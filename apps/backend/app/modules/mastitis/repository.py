from sqlalchemy.orm import Session

from app.modules.animals.model import Animal
from app.modules.farms.model import Farm
from app.modules.mastitis.model import MastitisRecord
from app.modules.pans.model import Pan


def get_mastitis_records_by_farmer(db: Session, farmer_id, animal_id=None):
    query = (
        db.query(MastitisRecord, Animal.tag_number)
        .join(Animal, MastitisRecord.animal_id == Animal.id)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .filter(Farm.farmer_id == farmer_id)
    )
    if animal_id is not None:
        query = query.filter(MastitisRecord.animal_id == animal_id)
    return query.order_by(MastitisRecord.test_date.desc()).all()


def get_mastitis_record_by_id_and_farmer(db: Session, record_id, farmer_id):
    return (
        db.query(MastitisRecord, Animal.tag_number)
        .join(Animal, MastitisRecord.animal_id == Animal.id)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .filter(
            MastitisRecord.id == record_id,
            Farm.farmer_id == farmer_id,
        )
        .first()
    )


def create_mastitis_record(db: Session, animal_id, record_data: dict):
    record = MastitisRecord(animal_id=animal_id, **record_data)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def update_mastitis_record(db: Session, record: MastitisRecord, update_data: dict):
    for field, value in update_data.items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


def delete_mastitis_record(db: Session, record: MastitisRecord):
    db.delete(record)
    db.commit()