from datetime import date

from sqlalchemy.orm import Session

from app.modules.animals.model import Animal
from app.modules.farms.model import Farm
from app.modules.milk.model import MilkRecord
from app.modules.pans.model import Pan


def create_milk_record(db: Session, record_data: dict):
    record = MilkRecord(**record_data)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_milk_records_by_farmer(
    db: Session,
    farmer_id,
    farm_id=None,
    animal_id=None,
    from_date: date | None = None,
    to_date: date | None = None,
):
    query = (
        db.query(MilkRecord)
        .join(Farm, MilkRecord.farm_id == Farm.id)
        .filter(Farm.farmer_id == farmer_id)
    )

    if farm_id is not None:
        query = query.filter(MilkRecord.farm_id == farm_id)
    if animal_id is not None:
        query = query.filter(MilkRecord.animal_id == animal_id)
    if from_date is not None:
        query = query.filter(MilkRecord.record_date >= from_date)
    if to_date is not None:
        query = query.filter(MilkRecord.record_date <= to_date)

    return query.order_by(MilkRecord.record_date.desc(), MilkRecord.created_at.desc()).all()


def get_milk_record_by_id_and_farmer(db: Session, record_id, farmer_id):
    return (
        db.query(MilkRecord)
        .join(Farm, MilkRecord.farm_id == Farm.id)
        .filter(
            MilkRecord.id == record_id,
            Farm.farmer_id == farmer_id,
        )
        .first()
    )


def animal_belongs_to_farm(db: Session, animal_id, farm_id):
    return (
        db.query(Animal.id)
        .join(Pan, Animal.pan_id == Pan.id)
        .filter(
            Animal.id == animal_id,
            Pan.farm_id == farm_id,
        )
        .first()
        is not None
    )


def update_milk_record(db: Session, record: MilkRecord, update_data: dict):
    for field, value in update_data.items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)
    return record


def delete_milk_record(db: Session, record: MilkRecord):
    db.delete(record)
    db.commit()