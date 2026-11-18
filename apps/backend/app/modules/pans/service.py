# Business logic for the Pans module
import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.modules.dashboard.repository import get_farmer_profile
from app.modules.farms import repository as farms_repository
from app.modules.pans import repository


def _get_farmer(db: Session, user_id: uuid.UUID):
    farmer = get_farmer_profile(db, user_id)
    if farmer is None:
        raise NotFoundError("Farmer profile not found.")
    return farmer


def get_farmer_pans(db: Session, user_id: uuid.UUID, farm_id: uuid.UUID | None = None):
    farmer = _get_farmer(db, user_id)

    if farm_id is not None and farms_repository.get_farm_by_id_and_farmer(
        db=db,
        farm_id=farm_id,
        farmer_id=farmer.id,
    ) is None:
        raise NotFoundError("Farm not found.")

    return {
        "items": repository.get_pans_by_farmer(
            db=db,
            farmer_id=farmer.id,
            farm_id=farm_id,
        )
    }


def create_farmer_pan(
    db: Session,
    user_id: uuid.UUID,
    farm_id: uuid.UUID,
    pan_data: dict,
):
    farmer = _get_farmer(db, user_id)

    if farms_repository.get_farm_by_id_and_farmer(
        db=db,
        farm_id=farm_id,
        farmer_id=farmer.id,
    ) is None:
        raise NotFoundError("Farm not found.")

    return repository.create_pan(
        db=db,
        farm_id=farm_id,
        pan_data=pan_data,
    )


def get_farmer_pan(db: Session, user_id: uuid.UUID, pan_id: uuid.UUID):
    farmer = _get_farmer(db, user_id)
    pan = repository.get_pan_by_id_and_farmer(
        db=db,
        pan_id=pan_id,
        farmer_id=farmer.id,
    )
    if pan is None:
        raise NotFoundError("Pan not found.")
    return pan


def update_farmer_pan(
    db: Session,
    user_id: uuid.UUID,
    pan_id: uuid.UUID,
    update_data: dict,
):
    farmer = _get_farmer(db, user_id)
    pan = repository.get_pan_by_id_and_farmer(
        db=db,
        pan_id=pan_id,
        farmer_id=farmer.id,
    )
    if pan is None:
        raise NotFoundError("Pan not found.")

    capacity = update_data.get("max_animal_capacity")
    if (
        capacity is not None
        and capacity < repository.count_animals_in_pan(db, pan.id)
    ):
        raise ConflictError(
            "Maximum animal capacity cannot be less than the number of animals assigned to this pen."
        )

    return repository.update_pan(
        db=db,
        pan=pan,
        update_data=update_data,
    )


def delete_farmer_pan(db: Session, user_id: uuid.UUID, pan_id: uuid.UUID) -> None:
    farmer = _get_farmer(db, user_id)
    pan = repository.get_pan_by_id_and_farmer(
        db=db,
        pan_id=pan_id,
        farmer_id=farmer.id,
    )
    if pan is None:
        raise NotFoundError("Pen not found.")
    if repository.count_animals_in_pan(db, pan.id):
        raise ConflictError("Move or remove the animals assigned to this pen before deleting it.")
    repository.delete_pan(db, pan)