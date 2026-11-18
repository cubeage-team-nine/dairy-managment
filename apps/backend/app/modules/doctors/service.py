import uuid

from sqlalchemy.orm import Session

from app.common.pagination import PaginatedResponse
from app.core.constants import AccountStatus
from app.core.exceptions import ConflictError, NotFoundError
from app.modules.doctors import repository
from app.modules.doctors.schema import AdminDoctorListItem
from app.modules.doctors.photo_storage import save_doctor_photo, delete_doctor_photo, doctor_photo_path


def _profile_response(profile):
    user = profile.user
    return {
        "id": profile.id,
        "full_name": user.full_name,
        "email": user.email,
        "mobile_number": user.mobile_number,
        "first_name": profile.first_name,
        "middle_name": profile.middle_name,
        "last_name": profile.last_name,
        "qualification": profile.qualification,
        "specialization": profile.specialization,
        "registration_number": profile.registration_number,
        "experience_years": profile.experience_years,
        "address": profile.address,
        "village": profile.village,
        "district": profile.district,
        "state": profile.state,
        "profile_photo": "/api/v1/doctors/me/photo" if profile.profile_photo else None,
        "is_available": profile.is_available,
        "account_status": user.status,
        "is_verified": user.is_verified,
    }


def get_my_doctor_profile(db: Session, user_id: uuid.UUID):
    profile = repository.get_doctor_profile_by_user_id(
        db=db,
        user_id=user_id,
    )
    if profile is None:
        raise NotFoundError("Doctor profile not found.")
    return _profile_response(profile)


def update_my_doctor_availability(db: Session, user_id: uuid.UUID, is_available: bool):
    profile = repository.get_doctor_profile_by_user_id(db=db, user_id=user_id)
    if profile is None:
        raise NotFoundError("Doctor profile not found.")
    profile.is_available = is_available
    db.commit()
    db.refresh(profile)
    return _profile_response(profile)


def get_farmer_approved_doctors(db: Session):
    return [
        {
            "id": profile.id,
            "full_name": user.full_name
            or " ".join(
                name
                for name in (
                    profile.first_name,
                    profile.middle_name,
                    profile.last_name,
                )
                if name
            ),
            "qualification": profile.qualification,
            "specialization": profile.specialization,
            "experience_years": profile.experience_years,
            "registration_number": profile.registration_number,
            "mobile_number": user.mobile_number,
            "is_available": profile.is_available,
        }
        for profile, user in repository.list_approved_active_doctors(db)
    ]


def update_my_doctor_profile(
    db: Session,
    user_id: uuid.UUID,
    update_data: dict,
):
    profile = repository.get_doctor_profile_by_user_id(
        db=db,
        user_id=user_id,
    )
    if profile is None:
        raise NotFoundError("Doctor profile not found.")

    profile_updates = dict(update_data)
    user = profile.user
    for field in ("full_name", "email", "mobile_number"):
        if field in profile_updates:
            setattr(user, field, profile_updates.pop(field))

    profile = repository.update_doctor_profile(
        db=db,
        profile=profile,
        update_data=profile_updates,
    )
    return _profile_response(profile)


def _admin_doctor_item(profile, user) -> AdminDoctorListItem:
    if user.status == AccountStatus.REJECTED:
        registration_state = "REJECTED"
    elif user.is_verified:
        registration_state = "APPROVED"
    else:
        registration_state = "PENDING"

    return AdminDoctorListItem(
        doctor_id=profile.id,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        mobile_number=user.mobile_number,
        first_name=profile.first_name,
        middle_name=profile.middle_name,
        last_name=profile.last_name,
        qualification=profile.qualification,
        specialization=profile.specialization,
        registration_number=profile.registration_number,
        experience_years=profile.experience_years,
        account_status=user.status,
        is_verified=user.is_verified,
        registration_state=registration_state,
        is_available=profile.is_available,
        registered_at=user.created_at,
    )


def get_admin_doctors_page(db: Session, page: int, page_size: int):
    rows, total = repository.list_admin_doctors(db, page, page_size)
    return PaginatedResponse[AdminDoctorListItem](
        items=[_admin_doctor_item(profile, user) for profile, user in rows],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=max(1, (total + page_size - 1) // page_size) if total else 1,
    )


def _decide_doctor_registration(
    db: Session,
    doctor_id: uuid.UUID,
    approved: bool,
):
    row = repository.get_admin_doctor_by_id(db, doctor_id)
    if row is None:
        raise NotFoundError("Doctor registration not found.")

    profile, user = row
    if user.is_verified or user.status != AccountStatus.ACTIVE:
        raise ConflictError("Only pending Doctor registrations can be reviewed.")

    profile, user = repository.save_doctor_registration_decision(
        db=db,
        profile=profile,
        user=user,
        approved=approved,
    )
    return _admin_doctor_item(profile, user)


def approve_doctor_registration(db: Session, doctor_id: uuid.UUID):
    return _decide_doctor_registration(db, doctor_id, approved=True)


def reject_doctor_registration(db: Session, doctor_id: uuid.UUID):
    return _decide_doctor_registration(db, doctor_id, approved=False)


def upload_my_doctor_photo(db: Session, user_id: uuid.UUID, content: bytes, content_type: str):
    suffix_by_type = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
    suffix = suffix_by_type.get(content_type)
    if suffix is None:
        raise ConflictError("Profile photo must be JPEG, PNG, or WebP.")
    if not content or len(content) > 5 * 1024 * 1024:
        raise ConflictError("Profile photo must be no larger than 5 MB.")
    profile = repository.get_doctor_profile_by_user_id(db, user_id)
    if profile is None:
        raise NotFoundError("Doctor profile not found.")
    filename = save_doctor_photo(content, suffix)
    old_filename = profile.profile_photo
    profile.profile_photo = filename
    db.commit()
    if old_filename:
        delete_doctor_photo(old_filename)
    return _profile_response(profile)


def get_my_doctor_photo_path(db: Session, user_id: uuid.UUID):
    profile = repository.get_doctor_profile_by_user_id(db, user_id)
    if profile is None or not profile.profile_photo:
        raise NotFoundError("Doctor profile photo not found.")
    return doctor_photo_path(profile.profile_photo)
