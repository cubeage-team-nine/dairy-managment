from sqlalchemy.orm import Session

from app.modules.animals.model import Animal
from app.modules.farms.model import Farm
from app.modules.health.model import HealthRecord
from app.modules.pans.model import Pan


def get_health_records_by_farmer(db: Session, farmer_id, animal_id=None):
    query = (
        db.query(HealthRecord, Animal.tag_number)
        .join(Animal, HealthRecord.animal_id == Animal.id)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .filter(Farm.farmer_id == farmer_id)
    )

    if animal_id is not None:
        query = query.filter(HealthRecord.animal_id == animal_id)

    return query.order_by(HealthRecord.visit_date.desc()).all()


def create_health_record(db: Session, animal_id, record_data: dict):
    record = HealthRecord(animal_id=animal_id, doctor_id=None, **record_data)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_farmer_created_health_record(db: Session, record_id, farmer_id):
    return (
        db.query(HealthRecord, Animal.tag_number)
        .join(Animal, HealthRecord.animal_id == Animal.id)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .filter(
            HealthRecord.id == record_id,
            HealthRecord.doctor_id.is_(None),
            Farm.farmer_id == farmer_id,
        )
        .first()
    )


def update_health_record(db: Session, record: HealthRecord, update_data: dict):
    for field, value in update_data.items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


def delete_health_record(db: Session, record: HealthRecord):
    db.delete(record)
    db.commit()