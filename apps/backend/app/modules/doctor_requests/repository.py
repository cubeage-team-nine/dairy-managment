from datetime import datetime

from sqlalchemy.orm import Session

from app.modules.animals.model import Animal
from app.modules.doctor_requests.model import DoctorRequest


def create_farmer_request(
    db: Session,
    farmer_id,
    doctor_id,
    selection_mode,
    animal_id,
    priority,
    request_description: str,
    requested_at: datetime,
):
    request = DoctorRequest(
        farmer_id=farmer_id,
        doctor_id=doctor_id,
        selection_mode=selection_mode,
        priority=priority,
        animal_id=animal_id,
        request_description=request_description,
        requested_at=requested_at,
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


def get_farmer_requests(db: Session, farmer_id):
    return (
        db.query(DoctorRequest, Animal.tag_number)
        .join(Animal, DoctorRequest.animal_id == Animal.id)
        .filter(DoctorRequest.farmer_id == farmer_id)
        .order_by(DoctorRequest.requested_at.desc())
        .all()
    )


def get_farmer_request_by_id(db: Session, farmer_id, request_id):
    return (
        db.query(DoctorRequest, Animal.tag_number)
        .join(Animal, DoctorRequest.animal_id == Animal.id)
        .filter(
            DoctorRequest.farmer_id == farmer_id,
            DoctorRequest.id == request_id,
        )
        .first()
    )
