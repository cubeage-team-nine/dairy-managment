# Business logic for the Animals module
import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.modules.animals import repository
from app.modules.animals.model import Animal
from app.modules.dashboard.repository import get_farmer_profile
from app.modules.pans.model import Pan
from app.modules.pans.repository import count_animals_in_pan, get_pan_by_id_and_farmer


def _get_farmer(db: Session, user_id: uuid.UUID):
    farmer = get_farmer_profile(db, user_id)
    if farmer is None:
        raise NotFoundError("Farmer profile not found.")
    return farmer


def get_farmer_animals(
    db: Session,
    user_id: uuid.UUID,
    pan_id: uuid.UUID | None = None,
):
    farmer = _get_farmer(db, user_id)

    if pan_id is not None and get_pan_by_id_and_farmer(
        db=db,
        pan_id=pan_id,
        farmer_id=farmer.id,
    ) is None:
        raise NotFoundError("Pan not found.")

    return {
        "items": repository.get_animals_by_farmer(
            db=db,
            farmer_id=farmer.id,
            pan_id=pan_id,
        )
    }


def create_farmer_animal(
    db: Session,
    user_id: uuid.UUID,
    animal_data: dict,
):
    farmer = _get_farmer(db, user_id)

    pan = get_pan_by_id_and_farmer(
        db=db,
        pan_id=animal_data["pan_id"],
        farmer_id=farmer.id,
    )
    if pan is None:
        raise NotFoundError("Pan not found.")
    if (
        pan.max_animal_capacity is not None
        and count_animals_in_pan(db, pan.id) >= pan.max_animal_capacity
    ):
        raise ConflictError("This pen has reached its maximum animal capacity.")

    return repository.create_animal(
        db=db,
        animal_data=animal_data,
    )


def get_farmer_animal(db: Session, user_id: uuid.UUID, animal_id: uuid.UUID):
    farmer = _get_farmer(db, user_id)
    animal = repository.get_animal_by_id_and_farmer(
        db=db,
        animal_id=animal_id,
        farmer_id=farmer.id,
    )
    if animal is None:
        raise NotFoundError("Animal not found.")
    return animal


def update_farmer_animal(
    db: Session,
    user_id: uuid.UUID,
    animal_id: uuid.UUID,
    update_data: dict,
):
    farmer = _get_farmer(db, user_id)
    animal = repository.get_animal_by_id_and_farmer(
        db=db,
        animal_id=animal_id,
        farmer_id=farmer.id,
    )
    if animal is None:
        raise NotFoundError("Animal not found.")

    return repository.update_animal(
        db=db,
        animal=animal,
        update_data=update_data,
        user_id=user_id,
    )


def delete_farmer_animal(db: Session, user_id: uuid.UUID, animal_id: uuid.UUID):
    farmer = _get_farmer(db, user_id)
    animal = repository.get_animal_by_id_and_farmer(
        db=db,
        animal_id=animal_id,
        farmer_id=farmer.id,
    )
    if animal is None:
        raise NotFoundError("Animal not found.")

    repository.delete_animal(db=db, animal=animal)


def get_admin_animals(db: Session):
    items = []
    for row in repository.get_admin_animals(db):
        animal = row["animal"]
        items.append(
            {
                "id": animal.id,
                "pan_id": animal.pan_id,
                "tag_number": animal.tag_number,
                "animal_type": animal.animal_type,
                "breed": animal.breed,
                "date_of_birth": animal.date_of_birth,
                "gender": animal.gender,
                "weight": animal.weight,
                "status": animal.status,
                "farm_id": row["farm_id"],
                "farm_name": row["farm_name"],
                "pan_name": row["pan_name"],
                "farmer_name": row["farmer_name"],
            }
        )
    return {
        "items": items
    }


def get_admin_animal_options(db: Session):
    return repository.get_admin_animal_options(db)


def create_admin_animal(db: Session, animal_data: dict):
    pan = db.get(Pan, animal_data["pan_id"])
    if pan is None:
        raise NotFoundError("Pan not found.")
    if (
        pan.max_animal_capacity is not None
        and count_animals_in_pan(db, pan.id) >= pan.max_animal_capacity
    ):
        raise ConflictError("This pen has reached its maximum animal capacity.")
    return repository.create_animal(db=db, animal_data=animal_data)


def update_admin_animal(
    db: Session,
    user_id: uuid.UUID,
    animal_id: uuid.UUID,
    update_data: dict,
):
    animal = db.get(Animal, animal_id)
    if animal is None:
        raise NotFoundError("Animal not found.")
    return repository.update_animal(
        db=db,
        animal=animal,
        update_data=update_data,
        user_id=user_id,
    )


def delete_admin_animal(db: Session, animal_id: uuid.UUID):
    animal = db.get(Animal, animal_id)
    if animal is None:
        raise NotFoundError("Animal not found.")
    repository.delete_animal(db=db, animal=animal)
