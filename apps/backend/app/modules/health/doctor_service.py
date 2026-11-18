import uuid

from sqlalchemy.orm import Session

from app.core.constants import RequestStatus
from app.core.exceptions import NotFoundError
from app.modules.animals.doctor_service import get_assigned_animal
from app.modules.doctor_requests.model import DoctorRequest
from app.modules.dashboard.repository import get_doctor_profile
from app.modules.health.model import HealthRecord
from app.modules.animals.model import Animal
from app.modules.farmers.model import FarmerProfile
from app.modules.farms.model import Farm
from app.modules.pans.model import Pan
from app.modules.users.model import User


def _doctor(db, user_id):
    result = get_doctor_profile(db, user_id)
    if result is None:
        raise NotFoundError("Doctor profile not found.")
    return result[0]


def _row(db, record):
    return (
        db.query(Animal, FarmerProfile, User, Farm)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .join(FarmerProfile, Farm.farmer_id == FarmerProfile.id)
        .join(User, FarmerProfile.user_id == User.id)
        .filter(Animal.id == record.animal_id)
        .first()
    )


def _item(db, record):
    animal, farmer, user, farm = _row(db, record)
    doctor = record.doctor
    doctor_user = doctor.user if doctor else None
    return {
        "id": record.id, "animal_id": record.animal_id, "animal_tag": animal.tag_number,
        "animal_name": animal.tag_number, "animal_type": animal.animal_type, "breed": animal.breed,
        "farmer_name": user.full_name or " ".join(filter(None, [farmer.first_name, farmer.middle_name, farmer.last_name])),
        "farm_name": farm.name, "village": farm.village or farmer.village,
        "doctor_id": record.doctor_id, "disease": record.disease, "medicine": record.medicine,
        "doctor_name": (doctor_user.full_name or " ".join(filter(None, [doctor.first_name, doctor.middle_name, doctor.last_name]))) if doctor else None,
        "dose": record.dose, "treatment": record.treatment,
        "doctor_recommendation": record.doctor_recommendation, "visit_date": record.visit_date,
        "symptoms": record.symptoms, "doctor_notes": record.doctor_notes,
        "follow_up_date": record.follow_up_date, "health_status": record.health_status,
        "treatment_start_date": record.visit_date, "treatment_duration": record.treatment_duration,
    }


def list_doctor_health_records(db: Session, user_id: uuid.UUID, animal_id=None):
    doctor = _doctor(db, user_id)
    assigned_ids = db.query(DoctorRequest.animal_id).filter(
        DoctorRequest.doctor_id == doctor.id,
        DoctorRequest.status.in_([RequestStatus.ACCEPTED, RequestStatus.COMPLETED]),
    )
    query = db.query(HealthRecord).filter(HealthRecord.animal_id.in_(assigned_ids))
    if animal_id:
        query = query.filter(HealthRecord.animal_id == animal_id)
    records = query.order_by(HealthRecord.visit_date.desc()).all()
    return {"items": [_item(db, record) for record in records]}


def create_doctor_health_record(db: Session, user_id: uuid.UUID, animal_id: uuid.UUID, data: dict):
    get_assigned_animal(db, user_id, animal_id)
    doctor = _doctor(db, user_id)
    record = HealthRecord(animal_id=animal_id, doctor_id=doctor.id, **data)
    db.add(record)
    db.commit()
    db.refresh(record)
    return _item(db, record)


def update_doctor_health_record(db: Session, user_id: uuid.UUID, record_id: uuid.UUID, data: dict):
    doctor = _doctor(db, user_id)
    record = db.query(HealthRecord).filter(
        HealthRecord.id == record_id,
        HealthRecord.doctor_id == doctor.id,
    ).first()
    if record is None:
        raise NotFoundError("Doctor health record not found.")
    get_assigned_animal(db, user_id, record.animal_id)
    for field, value in data.items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return _item(db, record)
