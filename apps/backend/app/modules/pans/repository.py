# Database access layer for the Pans module
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.modules.animals.model import Animal
from app.modules.farms.model import Farm
from app.modules.pans.model import Pan


def create_pan(db: Session, farm_id, pan_data: dict):
    pan = Pan(farm_id=farm_id, **pan_data)
    db.add(pan)
    db.commit()
    db.refresh(pan)
    return pan


def get_pans_by_farmer(db: Session, farmer_id, farm_id=None):
    query = (
        db.query(Pan)
        .join(Farm, Pan.farm_id == Farm.id)
        .filter(Farm.farmer_id == farmer_id)
    )

    if farm_id is not None:
        query = query.filter(Pan.farm_id == farm_id)

    return query.order_by(Pan.created_at.desc()).all()


def get_pan_by_id_and_farmer(db: Session, pan_id, farmer_id):
    return (
        db.query(Pan)
        .join(Farm, Pan.farm_id == Farm.id)
        .filter(
            Pan.id == pan_id,
            Farm.farmer_id == farmer_id,
        )
        .first()
    )


def update_pan(db: Session, pan: Pan, update_data: dict):
    for field, value in update_data.items():
        setattr(pan, field, value)

    db.commit()
    db.refresh(pan)
    return pan


def count_animals_in_pan(db: Session, pan_id) -> int:
    return db.query(func.count(Animal.id)).filter(Animal.pan_id == pan_id).scalar() or 0


def delete_pan(db: Session, pan: Pan) -> None:
    db.delete(pan)
    db.commit()