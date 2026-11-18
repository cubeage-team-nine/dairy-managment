import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.core.constants import AccountStatus, UserRole
from app.modules.animals.repository import get_animal_by_id_and_farmer
from app.modules.dashboard.repository import get_farmer_profile
from app.modules.doctors.model import DoctorProfile
from app.modules.users.model import User
from app.modules.doctor_requests import repository


def _get_farmer(db: Session, user_id: uuid.UUID):
    farmer = get_farmer_profile(db, user_id)
    if farmer is None:
        raise NotFoundError("Farmer profile not found.")
    return farmer


def _request_response(request, animal_tag: str):
    doctor = request.doctor
    doctor_user = doctor.user if doctor else None
    return {
        "id": request.id,
        "animal_id": request.animal_id,
        "animal_tag": animal_tag,
        "request_description": request.request_description,
        "status": request.status,
        "requested_at": request.requested_at,
        "accepted_at": request.accepted_at,
        "rejected_at": request.rejected_at,
        "doctor_id": request.doctor_id,
        "selection_mode": request.selection_mode,
        "doctor_name": (doctor_user.full_name or " ".join(filter(None, [doctor.first_name, doctor.middle_name, doctor.last_name]))) if doctor else None,
        "doctor_specialization": doctor.specialization if doctor else None,
        "doctor_experience_years": doctor.experience_years if doctor else None,
        "doctor_is_available": doctor.is_available if doctor else None,
        "priority": request.priority,
    }


def create_farmer_request(
    db: Session,
    user_id: uuid.UUID,
    animal_id: uuid.UUID,
    doctor_id: uuid.UUID | None,
    selection_mode: str,
    priority: str,
    request_description: str,
):
    farmer = _get_farmer(db, user_id)
    animal = get_animal_by_id_and_farmer(
        db=db,
        animal_id=animal_id,
        farmer_id=farmer.id,
    )
    if animal is None:
        raise NotFoundError("Animal not found.")

    doctor = None
    if selection_mode == "MANUAL":
        doctor = (
            db.query(DoctorProfile)
            .join(User, DoctorProfile.user_id == User.id)
            .filter(
                DoctorProfile.id == doctor_id,
                User.role == UserRole.DOCTOR,
                User.status == AccountStatus.ACTIVE,
                User.is_verified.is_(True),
                DoctorProfile.is_available.is_(True),
            )
            .first()
        )
        if doctor is None:
            raise ConflictError(
                "The selected doctor is no longer available. Please choose another doctor."
            )

    request = repository.create_farmer_request(
        db=db,
        farmer_id=farmer.id,
        doctor_id=doctor.id if doctor else None,
        selection_mode=selection_mode,
        animal_id=animal_id,
        priority=priority,
        request_description=request_description,
        requested_at=datetime.now(timezone.utc),
    )
    return _request_response(request, animal.tag_number)


def get_farmer_requests(db: Session, user_id: uuid.UUID):
    farmer = _get_farmer(db, user_id)
    rows = repository.get_farmer_requests(db=db, farmer_id=farmer.id)
    return {"items": [_request_response(request, tag) for request, tag in rows]}


def get_farmer_request(db: Session, user_id: uuid.UUID, request_id: uuid.UUID):
    farmer = _get_farmer(db, user_id)
    row = repository.get_farmer_request_by_id(
        db=db,
        farmer_id=farmer.id,
        request_id=request_id,
    )
    if row is None:
        raise NotFoundError("Health request not found.")
    request, animal_tag = row
    return _request_response(request, animal_tag)
