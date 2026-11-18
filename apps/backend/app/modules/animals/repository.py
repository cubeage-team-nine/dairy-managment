# Database access layer for the Animals module

from datetime import datetime, timezone

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError
from app.modules.animals.model import Animal, AnimalLifecycleHistory
from app.modules.farmers.model import FarmerProfile
from app.modules.farms.model import Farm
from app.modules.pans.model import Pan
from app.modules.users.model import User


def create_animal(db: Session, animal_data: dict):
    animal = Animal(**animal_data)
    db.add(animal)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("Animal tag number already exists.") from exc

    db.refresh(animal)
    return animal


def get_animals_by_farmer(db: Session, farmer_id, pan_id=None):
    query = (
        db.query(Animal)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .filter(Farm.farmer_id == farmer_id)
    )

    if pan_id is not None:
        query = query.filter(Animal.pan_id == pan_id)

    return query.order_by(Animal.created_at.desc()).all()


def get_animal_by_id_and_farmer(db: Session, animal_id, farmer_id):
    return (
        db.query(Animal)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .filter(
            Animal.id == animal_id,
            Farm.farmer_id == farmer_id,
        )
        .first()
    )


def get_admin_animals(db: Session):
    rows = (
        db.query(Animal, Farm.id, Farm.name, Pan.name, User.full_name)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .join(FarmerProfile, Farm.farmer_id == FarmerProfile.id)
        .join(User, FarmerProfile.user_id == User.id)
        .order_by(Animal.created_at.desc())
        .all()
    )
    return [
        {
            "animal": animal,
            "farm_id": farm_id,
            "farm_name": farm_name,
            "pan_name": pan_name,
            "farmer_name": farmer_name,
        }
        for animal, farm_id, farm_name, pan_name, farmer_name in rows
    ]


def get_admin_animal_options(db: Session):
    farm_rows = (
        db.query(Farm.id, Farm.name, User.full_name)
        .join(FarmerProfile, Farm.farmer_id == FarmerProfile.id)
        .join(User, FarmerProfile.user_id == User.id)
        .order_by(Farm.name)
        .all()
    )
    pan_rows = (
        db.query(Pan.id, Pan.farm_id, Pan.name, Pan.pen_number, Pan.max_animal_capacity)
        .join(Farm, Pan.farm_id == Farm.id)
        .order_by(Farm.name, Pan.name)
        .all()
    )
    return {
        "farms": [
            {"id": farm_id, "name": name, "farmer_name": farmer_name}
            for farm_id, name, farmer_name in farm_rows
        ],
        "pans": [
            {
                "id": pan_id,
                "farm_id": farm_id,
                "name": name,
                "pen_number": pen_number,
                "max_animal_capacity": capacity,
            }
            for pan_id, farm_id, name, pen_number, capacity in pan_rows
        ],
    }


def update_animal(db: Session, animal: Animal, update_data: dict, user_id):
    previous_status = animal.status

    for field, value in update_data.items():
        setattr(animal, field, value)

    if animal.status != previous_status:
        db.add(
            AnimalLifecycleHistory(
                animal_id=animal.id,
                previous_status=previous_status,
                new_status=animal.status,
                changed_at=datetime.now(timezone.utc),
                created_by=user_id,
            )
        )

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("Animal tag number already exists.") from exc

    db.refresh(animal)
    return animal


def delete_animal(db: Session, animal: Animal):
    db.delete(animal)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError(
            "This animal has related records and cannot be deleted. Mark it sold or deceased instead."
        ) from exc
