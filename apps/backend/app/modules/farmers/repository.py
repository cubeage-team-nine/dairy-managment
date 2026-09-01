import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.animals.model import Animal
from app.modules.farmers.model import FarmerProfile
from app.modules.farms.model import Farm
from app.modules.pans.model import Pan
from app.modules.users.model import User


def _animals_count_subquery():
    return (
        select(func.count(Animal.id))
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .where(Farm.farmer_id == FarmerProfile.id)
        .correlate(FarmerProfile)
        .scalar_subquery()
    )


def list_farmers(db: Session, page: int, page_size: int):
    animals_count = _animals_count_subquery().label("animals_count")

    base_query = (
        select(FarmerProfile, User, animals_count)
        .join(User, FarmerProfile.user_id == User.id)
        .order_by(FarmerProfile.created_at.desc())
    )

    total = db.scalar(select(func.count()).select_from(base_query.subquery()))
    rows = db.execute(base_query.offset((page - 1) * page_size).limit(page_size)).all()

    return rows, total


def get_farmer_by_id(db: Session, farmer_id: uuid.UUID):
    animals_count = _animals_count_subquery().label("animals_count")

    return db.execute(
        select(FarmerProfile, User, animals_count)
        .join(User, FarmerProfile.user_id == User.id)
        .where(FarmerProfile.id == farmer_id)
    ).first()
