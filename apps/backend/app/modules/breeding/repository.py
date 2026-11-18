from sqlalchemy.orm import Session

from app.modules.animals.model import Animal
from app.modules.breeding.model import BreedingRecord
from app.modules.farms.model import Farm
from app.modules.pans.model import Pan


def create_breeding_record(db: Session, animal_id, record_data: dict):
    record = BreedingRecord(animal_id=animal_id, **record_data)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_breeding_records_by_farmer(db: Session, farmer_id, animal_id=None):
    query = (
        db.query(BreedingRecord, Animal.tag_number)
        .join(Animal, BreedingRecord.animal_id == Animal.id)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .filter(Farm.farmer_id == farmer_id)
    )

    if animal_id is not None:
        query = query.filter(BreedingRecord.animal_id == animal_id)

    return query.order_by(BreedingRecord.created_at.desc()).all()


def get_breeding_record_by_id_and_farmer(db: Session, record_id, farmer_id):
    return (
        db.query(BreedingRecord, Animal.tag_number)
        .join(Animal, BreedingRecord.animal_id == Animal.id)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .filter(
            BreedingRecord.id == record_id,
            Farm.farmer_id == farmer_id,
        )
        .first()
    )


def update_breeding_record(db: Session, record: BreedingRecord, update_data: dict):
    for field, value in update_data.items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)
    return record


def delete_breeding_record(db: Session, record: BreedingRecord):
    db.delete(record)
    db.commit()