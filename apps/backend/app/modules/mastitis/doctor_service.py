import uuid

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.constants import RequestStatus
from app.core.exceptions import NotFoundError
from app.modules.animals.doctor_service import get_assigned_animal
from app.modules.dashboard.repository import get_doctor_profile
from app.modules.doctor_requests.model import DoctorRequest
from app.modules.mastitis.model import MastitisCaseHistory, MastitisRecord
from app.modules.mastitis.service import _record_data
from app.modules.animals.model import Animal
from app.modules.farms.model import Farm
from app.modules.pans.model import Pan
from app.modules.farmers.model import FarmerProfile
from app.modules.users.model import User


def _doctor(db, user_id):
    result = get_doctor_profile(db, user_id)
    if result is None:
        raise NotFoundError("Doctor profile not found.")
    return result[0]


def _case_item(db, record, tag):
    row = (
        db.query(Animal, Farm, FarmerProfile, User)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .join(FarmerProfile, Farm.farmer_id == FarmerProfile.id)
        .join(User, FarmerProfile.user_id == User.id)
        .filter(Animal.id == record.animal_id)
        .first()
    )
    animal, farm, farmer, user = row
    return {
        **_record_data(record, tag),
        "animal_name": animal.tag_number,
        "animal_type": animal.animal_type,
        "breed": animal.breed,
        "farmer_name": user.full_name or " ".join(filter(None, [farmer.first_name, farmer.middle_name, farmer.last_name])),
        "farm_name": farm.name,
        "village": farm.village or farmer.village,
    }


def _snapshot(record):
    keys = (
        "animal_id", "test_date", "test_name", "result", "treatment", "recovery_date",
        "follow_up_date", "symptoms", "affected_quarter", "severity", "diagnosis",
        "medicine", "dose", "status", "doctor_notes",
    )
    return {key: (str(getattr(record, key)) if getattr(record, key) is not None else None) for key in keys}


def list_doctor_mastitis_cases(db: Session, user_id: uuid.UUID):
    doctor = _doctor(db, user_id)
    assigned_ids = db.query(DoctorRequest.animal_id).filter(
        DoctorRequest.doctor_id == doctor.id,
        DoctorRequest.status.in_([RequestStatus.ACCEPTED, RequestStatus.COMPLETED]),
    )
    rows = db.query(MastitisRecord, Animal.tag_number).join(
        Animal, MastitisRecord.animal_id == Animal.id
    ).filter(
        or_(MastitisRecord.doctor_id == doctor.id, MastitisRecord.doctor_id.is_(None)),
        MastitisRecord.animal_id.in_(assigned_ids),
    ).order_by(MastitisRecord.test_date.desc()).all()
    return {"items": [_case_item(db, record, tag) for record, tag in rows]}


def create_doctor_mastitis_case(db: Session, user_id: uuid.UUID, animal_id: uuid.UUID, data: dict):
    get_assigned_animal(db, user_id, animal_id)
    doctor = _doctor(db, user_id)
    record = MastitisRecord(animal_id=animal_id, doctor_id=doctor.id, **data)
    db.add(record)
    db.flush()
    db.add(MastitisCaseHistory(case_id=record.id, doctor_id=doctor.id, snapshot=_snapshot(record)))
    db.commit()
    db.refresh(record)
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    return _case_item(db, record, animal.tag_number)


def update_doctor_mastitis_case(db: Session, user_id: uuid.UUID, case_id: uuid.UUID, data: dict):
    doctor = _doctor(db, user_id)
    record = db.query(MastitisRecord).filter(
        MastitisRecord.id == case_id,
        or_(MastitisRecord.doctor_id == doctor.id, MastitisRecord.doctor_id.is_(None)),
    ).first()
    if record is None:
        raise NotFoundError("Mastitis case not found.")
    get_assigned_animal(db, user_id, record.animal_id)
    record.doctor_id = doctor.id
    db.add(MastitisCaseHistory(case_id=record.id, doctor_id=doctor.id, snapshot=_snapshot(record)))
    for field, value in data.items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    animal = db.query(Animal).filter(Animal.id == record.animal_id).first()
    return _case_item(db, record, animal.tag_number)


def get_doctor_mastitis_case_history(db: Session, user_id: uuid.UUID, case_id: uuid.UUID):
    doctor = _doctor(db, user_id)
    record = db.query(MastitisRecord).filter(
        MastitisRecord.id == case_id,
        or_(MastitisRecord.doctor_id == doctor.id, MastitisRecord.doctor_id.is_(None)),
    ).first()
    if record is None:
        raise NotFoundError("Mastitis case not found.")
    get_assigned_animal(db, user_id, record.animal_id)
    history = db.query(MastitisCaseHistory).filter(
        MastitisCaseHistory.case_id == case_id,
        MastitisCaseHistory.doctor_id == doctor.id,
    ).order_by(MastitisCaseHistory.changed_at.desc()).all()
    return {"items": [{"id": item.id, "changed_at": item.changed_at, **item.snapshot} for item in history]}
