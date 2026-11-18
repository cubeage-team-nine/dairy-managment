import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.modules.animals.repository import get_animal_by_id_and_farmer
from app.modules.dashboard.repository import get_farmer_profile
from app.modules.mastitis import repository


def _get_farmer(db: Session, user_id: uuid.UUID):
    farmer = get_farmer_profile(db, user_id)
    if farmer is None:
        raise NotFoundError("Farmer profile not found.")
    return farmer


def _record_data(record, animal_tag: str):
    return {
        "id": record.id,
        "animal_id": record.animal_id,
        "animal_tag": animal_tag,
        "test_date": record.test_date,
        "test_name": record.test_name,
        "result": record.result,
        "treatment": record.treatment,
        "recovery_date": record.recovery_date,
        "follow_up_date": record.follow_up_date,
        "doctor_id": record.doctor_id,
        "symptoms": record.symptoms,
        "affected_quarter": record.affected_quarter,
        "severity": record.severity,
        "diagnosis": record.diagnosis,
        "medicine": record.medicine,
        "dose": record.dose,
        "status": record.status,
        "doctor_notes": record.doctor_notes,
        "created_at": record.created_at,
    }


def get_farmer_mastitis_records(
    db: Session,
    user_id: uuid.UUID,
    animal_id: uuid.UUID | None = None,
):
    farmer = _get_farmer(db, user_id)
    rows = repository.get_mastitis_records_by_farmer(db, farmer.id, animal_id)
    return {"items": [_record_data(record, tag) for record, tag in rows]}


def create_farmer_mastitis_record(
    db: Session,
    user_id: uuid.UUID,
    animal_id: uuid.UUID,
    record_data: dict,
):
    farmer = _get_farmer(db, user_id)
    animal = get_animal_by_id_and_farmer(db, animal_id, farmer.id)
    if animal is None:
        raise NotFoundError("Animal not found.")
    record = repository.create_mastitis_record(db, animal_id, record_data)
    return _record_data(record, animal.tag_number)


def _get_owned_record(db: Session, user_id: uuid.UUID, record_id: uuid.UUID):
    farmer = _get_farmer(db, user_id)
    row = repository.get_mastitis_record_by_id_and_farmer(
        db,
        record_id,
        farmer.id,
    )
    if row is None:
        raise NotFoundError("Mastitis record not found.")
    return row


def get_farmer_mastitis_record(
    db: Session,
    user_id: uuid.UUID,
    record_id: uuid.UUID,
):
    record, animal_tag = _get_owned_record(db, user_id, record_id)
    return _record_data(record, animal_tag)


def update_farmer_mastitis_record(
    db: Session,
    user_id: uuid.UUID,
    record_id: uuid.UUID,
    update_data: dict,
):
    record, animal_tag = _get_owned_record(db, user_id, record_id)
    updated = repository.update_mastitis_record(db, record, update_data)
    return _record_data(updated, animal_tag)


def delete_farmer_mastitis_record(
    db: Session,
    user_id: uuid.UUID,
    record_id: uuid.UUID,
):
    record, _ = _get_owned_record(db, user_id, record_id)
    repository.delete_mastitis_record(db, record)
