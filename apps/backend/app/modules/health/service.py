import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.modules.animals.repository import get_animal_by_id_and_farmer
from app.modules.dashboard.repository import get_farmer_profile
from app.modules.health import repository


def _get_farmer(db: Session, user_id: uuid.UUID):
    farmer = get_farmer_profile(db, user_id)
    if farmer is None:
        raise NotFoundError("Farmer profile not found.")
    return farmer


def _record_data(record, animal_tag: str):
    doctor = record.doctor
    doctor_user = doctor.user if doctor else None
    return {
        "id": record.id,
        "animal_id": record.animal_id,
        "animal_tag": animal_tag,
        "doctor_id": record.doctor_id,
        "doctor_name": (
            doctor_user.full_name
            or " ".join(filter(None, [doctor.first_name, doctor.middle_name, doctor.last_name]))
        ) if doctor else None,
        "disease": record.disease,
        "medicine": record.medicine,
        "dose": record.dose,
        "treatment": record.treatment,
        "doctor_recommendation": record.doctor_recommendation,
        "visit_date": record.visit_date,
        "treatment_start_date": record.visit_date,
        "treatment_duration": record.treatment_duration,
        "symptoms": record.symptoms,
        "doctor_notes": record.doctor_notes,
        "follow_up_date": record.follow_up_date,
        "health_status": record.health_status,
    }


def get_farmer_health_records(
    db: Session,
    user_id: uuid.UUID,
    animal_id: uuid.UUID | None = None,
):
    farmer = _get_farmer(db, user_id)

    rows = repository.get_health_records_by_farmer(
        db=db,
        farmer_id=farmer.id,
        animal_id=animal_id,
    )

    return {"items": [_record_data(record, tag) for record, tag in rows]}


def create_farmer_health_record(
    db: Session,
    user_id: uuid.UUID,
    animal_id: uuid.UUID,
    record_data: dict,
):
    farmer = _get_farmer(db, user_id)
    animal = get_animal_by_id_and_farmer(db, animal_id, farmer.id)
    if animal is None:
        raise NotFoundError("Animal not found.")
    record = repository.create_health_record(db, animal_id, record_data)
    return _record_data(record, animal.tag_number)


def _get_owned_farmer_created_record(
    db: Session,
    user_id: uuid.UUID,
    record_id: uuid.UUID,
):
    farmer = _get_farmer(db, user_id)
    row = repository.get_farmer_created_health_record(
        db,
        record_id,
        farmer.id,
    )
    if row is None:
        raise NotFoundError("Farmer-created health record not found.")
    return row


def update_farmer_health_record(
    db: Session,
    user_id: uuid.UUID,
    record_id: uuid.UUID,
    update_data: dict,
):
    record, animal_tag = _get_owned_farmer_created_record(db, user_id, record_id)
    updated = repository.update_health_record(db, record, update_data)
    return _record_data(updated, animal_tag)


def delete_farmer_health_record(
    db: Session,
    user_id: uuid.UUID,
    record_id: uuid.UUID,
):
    record, _ = _get_owned_farmer_created_record(db, user_id, record_id)
    repository.delete_health_record(db, record)
