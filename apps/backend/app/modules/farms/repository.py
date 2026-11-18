# Database access layer for the Farms module


from sqlalchemy import func
from sqlalchemy.orm import Session

from app.modules.farms.model import Farm, FarmPhoto
from app.modules.farmers.model import FarmerProfile
from app.modules.animals.model import Animal
from app.modules.pans.model import Pan
from app.modules.users.model import User
from app.core.constants import AnimalStatus


def create_farm(
    db: Session,
    farmer_id,
    farm_data: dict,
):
    farm = Farm(farmer_id=farmer_id, **farm_data)
    db.add(farm)
    db.commit()
    db.refresh(farm)

    return farm


def get_farms_by_farmer(
    db: Session,
    farmer_id,
):
    """
    Get all farms belonging to a specific farmer.
    """

    return (
        db.query(Farm)
        .filter(Farm.farmer_id == farmer_id)
        .order_by(Farm.created_at.desc())
        .all()
    )


def get_farm_by_id_and_farmer(
    db: Session,
    farm_id,
    farmer_id,
):
    """
    Get a farm only if it belongs to the given farmer.
    """

    return (
        db.query(Farm)
        .filter(
            Farm.id == farm_id,
            Farm.farmer_id == farmer_id,
        )
        .first()
    )


def update_farm(
    db: Session,
    farm: Farm,
    update_data: dict,
):
    """
    Update only the supplied farm fields.
    """

    for field, value in update_data.items():
        setattr(farm, field, value)

    db.commit()
    db.refresh(farm)

    return farm


def create_farm_photos(
    db: Session,
    photos: list[FarmPhoto],
) -> list[FarmPhoto]:
    db.add_all(photos)
    db.commit()
    for photo in photos:
        db.refresh(photo)
    return photos


def get_farm_photos(db: Session, farm_id) -> list[FarmPhoto]:
    return (
        db.query(FarmPhoto)
        .filter(FarmPhoto.farm_id == farm_id)
        .order_by(FarmPhoto.created_at.desc(), FarmPhoto.id)
        .all()
    )


def get_farm_photo(db: Session, farm_id, photo_id):
    return (
        db.query(FarmPhoto)
        .filter(
            FarmPhoto.farm_id == farm_id,
            FarmPhoto.id == photo_id,
        )
        .first()
    )


def delete_farm_photo(db: Session, photo: FarmPhoto) -> None:
    db.delete(photo)
    db.commit()


# ── Admin queries ─────────────────────────────────────────────────────────────

def list_admin_farms(db: Session, page: int, page_size: int, search: str | None = None):
    """Return (rows, total) for the admin farms list.

    Each row is a tuple:
        (Farm, farmer_full_name, farmer_mobile, animal_count)
    """
    animal_count_sq = (
        db.query(
            Farm.id.label("farm_id"),
            func.count(Animal.id).label("animal_count"),
        )
        .outerjoin(Pan, Pan.farm_id == Farm.id)
        .outerjoin(
            Animal,
            (Animal.pan_id == Pan.id) & (Animal.status == AnimalStatus.ACTIVE),
        )
        .group_by(Farm.id)
        .subquery()
    )

    q = (
        db.query(
            Farm,
            User.full_name,
            User.mobile_number,
            func.coalesce(animal_count_sq.c.animal_count, 0).label("animal_count"),
        )
        .join(FarmerProfile, Farm.farmer_id == FarmerProfile.id)
        .join(User, FarmerProfile.user_id == User.id)
        .outerjoin(animal_count_sq, animal_count_sq.c.farm_id == Farm.id)
    )

    if search:
        pattern = f"%{search.strip()}%"
        q = q.filter(
            Farm.name.ilike(pattern)
            | Farm.village.ilike(pattern)
            | User.full_name.ilike(pattern)
        )

    total = q.with_entities(func.count(Farm.id)).scalar() or 0
    rows = (
        q.order_by(Farm.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return rows, total
