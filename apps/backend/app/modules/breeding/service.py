import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.modules.breeding import repository
from app.modules.dashboard.repository import get_farmer_profile
from app.modules.animals.repository import get_animal_by_id_and_farmer


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
        "lactation_number": record.lactation_number,
        "breed": record.breed,
        "ai_date": record.ai_date,
        "pregnancy_status": record.pregnancy_status,
        "pregnancy_confirmation_date": record.pregnancy_confirmation_date,
        "calving_date": record.calving_date,
    }


def get_farmer_breeding_records(
    db: Session,
    user_id: uuid.UUID,
    animal_id: uuid.UUID | None = None,
):
    farmer = _get_farmer(db, user_id)
    if animal_id is not None and get_animal_by_id_and_farmer(
        db=db,
        animal_id=animal_id,
        farmer_id=farmer.id,
    ) is None:
        raise NotFoundError("Animal not found.")

    rows = repository.get_breeding_records_by_farmer(
        db=db,
        farmer_id=farmer.id,
        animal_id=animal_id,
    )
    return {"items": [_record_data(record, tag) for record, tag in rows]}


def create_farmer_breeding_record(
    db: Session,
    user_id: uuid.UUID,
    animal_id: uuid.UUID,
    record_data: dict,
):
    farmer = _get_farmer(db, user_id)
    animal = get_animal_by_id_and_farmer(
        db=db,
        animal_id=animal_id,
        farmer_id=farmer.id,
    )
    if animal is None:
        raise NotFoundError("Animal not found.")

    record = repository.create_breeding_record(
        db=db,
        animal_id=animal_id,
        record_data=record_data,
    )
    return _record_data(record, animal.tag_number)


def _get_owned_record(db: Session, user_id: uuid.UUID, record_id: uuid.UUID):
    farmer = _get_farmer(db, user_id)
    row = repository.get_breeding_record_by_id_and_farmer(
        db=db,
        record_id=record_id,
        farmer_id=farmer.id,
    )
    if row is None:
        raise NotFoundError("Breeding record not found.")
    return row


def get_farmer_breeding_record(db: Session, user_id: uuid.UUID, record_id: uuid.UUID):
    record, animal_tag = _get_owned_record(db, user_id, record_id)
    return _record_data(record, animal_tag)


def update_farmer_breeding_record(
    db: Session,
    user_id: uuid.UUID,
    record_id: uuid.UUID,
    update_data: dict,
):
    record, animal_tag = _get_owned_record(db, user_id, record_id)
    updated = repository.update_breeding_record(
        db=db,
        record=record,
        update_data=update_data,
    )
    return _record_data(updated, animal_tag)


def delete_farmer_breeding_record(db: Session, user_id: uuid.UUID, record_id: uuid.UUID):
    record, _ = _get_owned_record(db, user_id, record_id)
    repository.delete_breeding_record(db=db, record=record)