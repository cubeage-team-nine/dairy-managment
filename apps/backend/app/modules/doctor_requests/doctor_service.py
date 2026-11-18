from datetime import date, datetime, timezone
import uuid

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.core.constants import RequestStatus
from app.core.exceptions import ConflictError, NotFoundError
from app.modules.animals.model import Animal
from app.modules.dashboard.repository import get_doctor_profile
from app.modules.doctor_requests.model import DoctorRequest
from app.modules.doctors.model import DoctorProfile
from app.modules.farmers.model import FarmerProfile
from app.modules.farms.model import Farm
from app.modules.health.model import HealthRecord
from app.modules.pans.model import Pan
from app.modules.users.model import User


def _doctor(db: Session, user_id: uuid.UUID) -> DoctorProfile:
    result = get_doctor_profile(db, user_id)
    if result is None:
        raise NotFoundError("Doctor profile not found.")
    return result[0]


def _request_item(request, animal, farmer, user, farm):
    return {
        "id": request.id,
        "animal_id": animal.id,
        "animal_name": animal.tag_number,
        "animal_tag": animal.tag_number,
        "animal_type": animal.animal_type,
        "breed": animal.breed,
        "animal_gender": animal.gender,
        "animal_date_of_birth": animal.date_of_birth,
        "farmer_id": farmer.id,
        "doctor_id": request.doctor_id,
        "selection_mode": request.selection_mode,
        "farmer_name": user.full_name or " ".join(filter(None, [farmer.first_name, farmer.middle_name, farmer.last_name])),
        "farmer_contact": user.mobile_number,
        "farm_name": farm.name,
        "village": farm.village or farmer.village,
        "request_description": request.request_description,
        "priority": request.priority,
        "status": request.status,
        "requested_at": request.requested_at,
        "accepted_at": request.accepted_at,
        "rejected_at": request.rejected_at,
    }


def list_doctor_requests(db: Session, user_id: uuid.UUID):
    doctor = _doctor(db, user_id)
    rows = (
        db.query(DoctorRequest, Animal, FarmerProfile, User, Farm)
        .join(Animal, DoctorRequest.animal_id == Animal.id)
        .join(FarmerProfile, DoctorRequest.farmer_id == FarmerProfile.id)
        .join(User, FarmerProfile.user_id == User.id)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .filter(or_(
            DoctorRequest.doctor_id == doctor.id,
            and_(
                DoctorRequest.selection_mode == "AUTO",
                DoctorRequest.doctor_id.is_(None),
                DoctorRequest.status == RequestStatus.PENDING,
                doctor.is_available,
            ),
        ))
        .order_by(DoctorRequest.requested_at.desc())
        .all()
    )
    return {"items": [_request_item(*row) for row in rows]}


def update_doctor_request(
    db: Session,
    user_id: uuid.UUID,
    request_id: uuid.UUID,
    decision: str,
    notes: str | None = None,
):
    doctor = _doctor(db, user_id)
    request = (
        db.query(DoctorRequest)
        .filter(
            DoctorRequest.id == request_id,
            or_(
                DoctorRequest.doctor_id == doctor.id,
                and_(
                    DoctorRequest.selection_mode == "AUTO",
                    DoctorRequest.doctor_id.is_(None),
                    DoctorRequest.status == RequestStatus.PENDING,
                    doctor.is_available,
                ),
            ),
        )
        .with_for_update()
        .first()
    )
    if request is None:
        raise NotFoundError("Assigned health request not found.")

    now = datetime.now(timezone.utc)
    if decision == "ACCEPTED":
        if request.status != RequestStatus.PENDING:
            raise ConflictError("Only pending requests can be accepted.")
        request.doctor_id = doctor.id
        request.status = RequestStatus.ACCEPTED
        request.accepted_at = now
    elif decision == "REJECTED":
        if request.status != RequestStatus.PENDING:
            raise ConflictError("Only pending requests can be rejected.")
        request.doctor_id = doctor.id
        request.status = RequestStatus.REJECTED
        request.rejected_at = now
    elif decision == "COMPLETED":
        if request.status != RequestStatus.ACCEPTED:
            raise ConflictError("Only accepted requests can be completed.")
        request.status = RequestStatus.COMPLETED
        if notes and notes.strip():
            db.add(HealthRecord(
                animal_id=request.animal_id,
                doctor_id=doctor.id,
                treatment=notes.strip(),
                doctor_recommendation=notes.strip(),
                visit_date=date.today(),
            ))
    db.commit()
    db.refresh(request)
    return {"id": request.id, "status": request.status}
