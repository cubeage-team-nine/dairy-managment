from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.constants import AccountStatus, UserRole
from app.core.exceptions import ConflictError
from app.modules.doctors.model import DoctorProfile
from app.modules.users.model import User


def get_doctor_profile_by_user_id(db: Session, user_id):
    return (
        db.query(DoctorProfile)
        .filter(DoctorProfile.user_id == user_id)
        .first()
    )


def list_approved_active_doctors(db: Session):
    return (
        db.query(DoctorProfile, User)
        .join(User, DoctorProfile.user_id == User.id)
        .filter(
            User.role == UserRole.DOCTOR,
            User.status == AccountStatus.ACTIVE,
            User.is_verified.is_(True),
            DoctorProfile.is_available.is_(True),
        )
        .order_by(DoctorProfile.first_name, DoctorProfile.last_name)
        .all()
    )


def update_doctor_profile(db: Session, profile: DoctorProfile, update_data: dict):
    for field, value in update_data.items():
        setattr(profile, field, value)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("A doctor registration number, email, or mobile number is already in use.") from exc

    db.refresh(profile)
    return profile


def list_admin_doctors(db: Session, page: int, page_size: int):
    query = db.query(DoctorProfile, User).join(
        User, DoctorProfile.user_id == User.id
    ).filter(User.role == UserRole.DOCTOR)
    total = query.with_entities(func.count(DoctorProfile.id)).scalar() or 0
    rows = (
        query.order_by(User.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return rows, total


def get_admin_doctor_by_id(db: Session, doctor_id):
    return (
        db.query(DoctorProfile, User)
        .join(User, DoctorProfile.user_id == User.id)
        .filter(
            DoctorProfile.id == doctor_id,
            User.role == UserRole.DOCTOR,
        )
        .with_for_update()
        .first()
    )


def save_doctor_registration_decision(
    db: Session,
    profile: DoctorProfile,
    user: User,
    approved: bool,
):
    user.status = AccountStatus.ACTIVE if approved else AccountStatus.REJECTED
    user.is_verified = approved
    db.commit()
    db.refresh(user)
    db.refresh(profile)
    return profile, user
