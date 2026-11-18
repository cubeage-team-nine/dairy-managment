import uuid
from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.modules.dashboard.repository import get_farmer_profile
from app.modules.farms import repository as farms_repository
from app.modules.milk import repository


def _get_farmer(db: Session, user_id: uuid.UUID):
    farmer = get_farmer_profile(db, user_id)
    if farmer is None:
        raise NotFoundError("Farmer profile not found.")
    return farmer


def _set_calculated_totals(record_data: dict, existing=None):
    morning = record_data.get(
        "morning_quantity",
        existing.morning_quantity if existing is not None else None,
    )
    evening = record_data.get(
        "evening_quantity",
        existing.evening_quantity if existing is not None else None,
    )
    total = None
    if morning is not None or evening is not None:
        morning_value = Decimal(str(morning or 0)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        evening_value = Decimal(str(evening or 0)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        total = morning_value + evening_value
    record_data["total_quantity"] = total

    rate = record_data.get(
        "milk_rate",
        existing.milk_rate if existing is not None else None,
    )
    if "milk_rate" in record_data and rate is not None:
        rate = Decimal(str(rate)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        record_data["milk_rate"] = rate
    if total is not None and rate is not None:
        record_data["milk_value"] = (total * Decimal(str(rate))).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )
    else:
        record_data["milk_value"] = None


def get_farmer_milk_records(
    db: Session,
    user_id: uuid.UUID,
    farm_id: uuid.UUID | None = None,
    animal_id: uuid.UUID | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
):
    farmer = _get_farmer(db, user_id)

    if farm_id is not None and farms_repository.get_farm_by_id_and_farmer(
        db=db,
        farm_id=farm_id,
        farmer_id=farmer.id,
    ) is None:
        raise NotFoundError("Farm not found.")

    return {
        "items": repository.get_milk_records_by_farmer(
            db=db,
            farmer_id=farmer.id,
            farm_id=farm_id,
            animal_id=animal_id,
            from_date=from_date,
            to_date=to_date,
        )
    }


def create_farmer_milk_record(
    db: Session,
    user_id: uuid.UUID,
    record_data: dict,
):
    farmer = _get_farmer(db, user_id)
    farm = farms_repository.get_farm_by_id_and_farmer(
        db=db,
        farm_id=record_data["farm_id"],
        farmer_id=farmer.id,
    )
    if farm is None:
        raise NotFoundError("Farm not found.")

    animal_id = record_data.get("animal_id")
    if animal_id is not None and not repository.animal_belongs_to_farm(
        db=db,
        animal_id=animal_id,
        farm_id=farm.id,
    ):
        raise NotFoundError("Animal not found in this farm.")

    _set_calculated_totals(record_data)
    return repository.create_milk_record(db=db, record_data=record_data)


def _get_owned_record(db: Session, user_id: uuid.UUID, record_id: uuid.UUID):
    farmer = _get_farmer(db, user_id)
    record = repository.get_milk_record_by_id_and_farmer(
        db=db,
        record_id=record_id,
        farmer_id=farmer.id,
    )
    if record is None:
        raise NotFoundError("Milk record not found.")
    return record


def get_farmer_milk_record(db: Session, user_id: uuid.UUID, record_id: uuid.UUID):
    return _get_owned_record(db, user_id, record_id)


def update_farmer_milk_record(
    db: Session,
    user_id: uuid.UUID,
    record_id: uuid.UUID,
    update_data: dict,
):
    record = _get_owned_record(db, user_id, record_id)

    animal_id = update_data.get("animal_id", record.animal_id)
    if animal_id is not None and not repository.animal_belongs_to_farm(
        db=db,
        animal_id=animal_id,
        farm_id=record.farm_id,
    ):
        raise NotFoundError("Animal not found in this farm.")

    _set_calculated_totals(update_data, existing=record)
    return repository.update_milk_record(
        db=db,
        record=record,
        update_data=update_data,
    )


def delete_farmer_milk_record(db: Session, user_id: uuid.UUID, record_id: uuid.UUID):
    record = _get_owned_record(db, user_id, record_id)
    repository.delete_milk_record(db=db, record=record)