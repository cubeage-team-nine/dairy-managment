import uuid
from datetime import date

from sqlalchemy.orm import Session

from app.core.constants import RequestStatus
from app.core.exceptions import NotFoundError
from app.modules.animals.model import Animal
from app.modules.dashboard.repository import get_doctor_profile
from app.modules.doctor_requests.model import DoctorRequest
from app.modules.farmers.model import FarmerProfile
from app.modules.farms.model import Farm
from app.modules.health.model import HealthRecord
from app.modules.pans.model import Pan
from app.modules.users.model import User


def _assigned_animal_query(db: Session, doctor_id):
    return (
        db.query(Animal, FarmerProfile, User, Farm)
        .join(DoctorRequest, DoctorRequest.animal_id == Animal.id)
        .join(FarmerProfile, DoctorRequest.farmer_id == FarmerProfile.id)
        .join(User, FarmerProfile.user_id == User.id)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .filter(
            DoctorRequest.doctor_id == doctor_id,
            DoctorRequest.status.in_([RequestStatus.ACCEPTED, RequestStatus.COMPLETED]),
        )
        .distinct()
    )


def _animal_item(db: Session, animal, farmer, user, farm):
    age_days = (date.today() - animal.date_of_birth).days if animal.date_of_birth else None
    last_record = db.query(HealthRecord).filter(HealthRecord.animal_id == animal.id).order_by(HealthRecord.visit_date.desc()).first()
    return {
        "id": animal.id,
        "animal_name": animal.tag_number,
        "tag_number": animal.tag_number,
        "animal_type": animal.animal_type,
        "breed": animal.breed,
        "age_days": age_days,
        "date_of_birth": animal.date_of_birth,
        "gender": animal.gender,
        "farmer_name": user.full_name or " ".join(filter(None, [farmer.first_name, farmer.middle_name, farmer.last_name])),
        "farmer_id": farmer.id,
        "farm_name": farm.name,
        "village": farm.village or farmer.village,
        "health_status": last_record.disease if last_record and last_record.disease else "No recent health issue",
        "last_visit_date": last_record.visit_date if last_record else None,
    }


def list_assigned_animals(db: Session, user_id: uuid.UUID):
    doctor = get_doctor_profile(db, user_id)
    if doctor is None:
        raise NotFoundError("Doctor profile not found.")
    doctor_profile, _ = doctor
    rows = _assigned_animal_query(db, doctor_profile.id).order_by(Animal.tag_number).all()
    return {"items": [_animal_item(db, *row) for row in rows]}


def get_assigned_animal(db: Session, user_id: uuid.UUID, animal_id: uuid.UUID):
    doctor = get_doctor_profile(db, user_id)
    if doctor is None:
        raise NotFoundError("Doctor profile not found.")
    doctor_profile, _ = doctor
    row = _assigned_animal_query(db, doctor_profile.id).filter(Animal.id == animal_id).first()
    if row is None:
        raise NotFoundError("Assigned animal not found.")
    return _animal_item(db, *row)


def get_assigned_animal_history(db: Session, user_id: uuid.UUID, animal_id: uuid.UUID):
    get_assigned_animal(db, user_id, animal_id)
    records = db.query(HealthRecord).filter(HealthRecord.animal_id == animal_id).order_by(HealthRecord.visit_date.desc()).all()
    return {"items": [{
        "id": row.id, "animal_id": row.animal_id, "visit_date": row.visit_date,
        "disease": row.disease, "medicine": row.medicine, "dose": row.dose,
        "treatment": row.treatment, "doctor_recommendation": row.doctor_recommendation,
    } for row in records]}
