import uuid
from datetime import date

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.modules.animals.repository import get_animal_by_id_and_farmer
from app.modules.animals.model import Animal
from app.modules.dashboard.repository import get_farmer_profile
from app.modules.feed import repository


def _get_farmer(db: Session, user_id: uuid.UUID):
    farmer = get_farmer_profile(db, user_id)
    if farmer is None:
        raise NotFoundError("Farmer profile not found.")
    return farmer


def _record_data(
    record,
    animal_tag: str,
    feed_type_name: str,
    farm_name: str | None = None,
    farmer_name: str | None = None,
):
    return {
        "id": record.id,
        "animal_id": record.animal_id,
        "animal_tag": animal_tag,
        "feed_type_id": record.feed_type_id,
        "feed_type_name": feed_type_name,
        "quantity": record.quantity,
        "unit": record.unit,
        "record_date": record.record_date,
        "farm_name": farm_name,
        "farmer_name": farmer_name,
    }


def get_farmer_feed_types(db: Session):
    return {"items": repository.get_feed_types(db)}


def create_admin_feed_type(db: Session, feed_type_data: dict):
    _validate_feed_type_name(db, feed_type_data["name"])
    try:
        return repository.create_feed_type(db, feed_type_data)
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("A feed type with this name already exists.") from exc


def update_admin_feed_type(db: Session, feed_type_id: uuid.UUID, update_data: dict):
    feed_type = repository.get_feed_type_by_id(db, feed_type_id)
    if feed_type is None:
        raise NotFoundError("Feed type not found.")
    if "name" in update_data:
        _validate_feed_type_name(db, update_data["name"], exclude_id=feed_type.id)
    try:
        return repository.update_feed_type(db, feed_type, update_data)
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("A feed type with this name already exists.") from exc


def delete_admin_feed_type(db: Session, feed_type_id: uuid.UUID) -> None:
    feed_type = repository.get_feed_type_by_id(db, feed_type_id)
    if feed_type is None:
        raise NotFoundError("Feed type not found.")
    if repository.count_feed_records_for_type(db, feed_type.id):
        raise ConflictError(
            "This feed type has feed records and cannot be deleted."
        )
    repository.delete_feed_type(db, feed_type)


def _validate_feed_type_name(db: Session, name: str, exclude_id=None) -> None:
    if repository.get_feed_type_by_name(db, name, exclude_id=exclude_id):
        raise ConflictError("A feed type with this name already exists.")


def get_admin_feed_records(db: Session):
    return {
        "items": [
            _record_data(record, tag, type_name, farm_name, farmer_name)
            for record, tag, type_name, farm_name, farmer_name
            in repository.get_admin_feed_records(db)
        ]
    }


def create_admin_feed_record(db: Session, record_data: dict):
    animal = db.get(Animal, record_data["animal_id"])
    if animal is None:
        raise NotFoundError("Animal not found.")
    feed_type = repository.get_feed_type_by_id(db, record_data["feed_type_id"])
    if feed_type is None:
        raise NotFoundError("Feed type not found.")
    record = repository.create_feed_record(
        db,
        {
            **record_data,
            "unit": feed_type.unit,
        },
    )
    return _record_data(record, animal.tag_number, feed_type.name)


def update_admin_feed_record(db: Session, record_id: uuid.UUID, update_data: dict):
    record = repository.get_admin_feed_record_by_id(db, record_id)
    if record is None:
        raise NotFoundError("Feed record not found.")
    animal_id = update_data.get("animal_id", record.animal_id)
    animal = db.get(Animal, animal_id)
    if animal is None:
        raise NotFoundError("Animal not found.")
    feed_type_id = update_data.get("feed_type_id", record.feed_type_id)
    feed_type = repository.get_feed_type_by_id(db, feed_type_id)
    if feed_type is None:
        raise NotFoundError("Feed type not found.")
    record = repository.update_feed_record(
        db,
        record,
        {
            **update_data,
            "animal_id": animal.id,
            "feed_type_id": feed_type.id,
            "unit": feed_type.unit,
        },
    )
    return _record_data(record, animal.tag_number, feed_type.name)


def delete_admin_feed_record(db: Session, record_id: uuid.UUID):
    record = repository.get_admin_feed_record_by_id(db, record_id)
    if record is None:
        raise NotFoundError("Feed record not found.")
    repository.delete_feed_record(db, record)


def get_farmer_feed_records(
    db: Session,
    user_id: uuid.UUID,
    animal_id: uuid.UUID | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
):
    farmer = _get_farmer(db, user_id)
    if animal_id is not None and get_animal_by_id_and_farmer(
        db=db,
        animal_id=animal_id,
        farmer_id=farmer.id,
    ) is None:
        raise NotFoundError("Animal not found.")
    rows = repository.get_feed_records_by_farmer(
        db=db,
        farmer_id=farmer.id,
        animal_id=animal_id,
        from_date=from_date,
        to_date=to_date,
    )
    return {"items": [_record_data(record, tag, name) for record, tag, name in rows]}


def create_farmer_feed_record(
    db: Session,
    user_id: uuid.UUID,
    animal_id: uuid.UUID,
    feed_type_id: uuid.UUID,
    quantity: float,
    record_date: date,
):
    farmer = _get_farmer(db, user_id)
    animal = get_animal_by_id_and_farmer(
        db=db,
        animal_id=animal_id,
        farmer_id=farmer.id,
    )
    if animal is None:
        raise NotFoundError("Animal not found.")

    feed_type = repository.get_feed_type_by_id(db, feed_type_id)
    if feed_type is None:
        raise NotFoundError("Feed type not found.")

    record = repository.create_feed_record(
        db=db,
        record_data={
            "animal_id": animal.id,
            "feed_type_id": feed_type.id,
            "quantity": quantity,
            "unit": feed_type.unit,
            "record_date": record_date,
        },
    )
    return _record_data(record, animal.tag_number, feed_type.name)


def _get_owned_feed_record(db: Session, user_id: uuid.UUID, record_id: uuid.UUID):
    farmer = _get_farmer(db, user_id)
    row = repository.get_feed_record_by_id_and_farmer(
        db=db,
        record_id=record_id,
        farmer_id=farmer.id,
    )
    if row is None:
        raise NotFoundError("Feed record not found.")
    return row


def get_farmer_feed_record(db: Session, user_id: uuid.UUID, record_id: uuid.UUID):
    row = _get_owned_feed_record(db, user_id, record_id)
    return _record_data(*row)


def update_farmer_feed_record(
    db: Session,
    user_id: uuid.UUID,
    record_id: uuid.UUID,
    update_data: dict,
):
    record, current_animal_tag, current_feed_name = _get_owned_feed_record(
        db,
        user_id,
        record_id,
    )

    animal_id = update_data.get("animal_id", record.animal_id)
    animal = get_animal_by_id_and_farmer(
        db=db,
        animal_id=animal_id,
        farmer_id=_get_farmer(db, user_id).id,
    )
    if animal is None:
        raise NotFoundError("Animal not found.")

    feed_type_id = update_data.get("feed_type_id", record.feed_type_id)
    feed_type = repository.get_feed_type_by_id(db, feed_type_id)
    if feed_type is None:
        raise NotFoundError("Feed type not found.")

    update_data["animal_id"] = animal.id
    update_data["feed_type_id"] = feed_type.id
    update_data["unit"] = feed_type.unit
    updated = repository.update_feed_record(
        db=db,
        record=record,
        update_data=update_data,
    )
    return _record_data(updated, animal.tag_number, feed_type.name)


def delete_farmer_feed_record(db: Session, user_id: uuid.UUID, record_id: uuid.UUID):
    record, _, _ = _get_owned_feed_record(db, user_id, record_id)
    repository.delete_feed_record(db=db, record=record)