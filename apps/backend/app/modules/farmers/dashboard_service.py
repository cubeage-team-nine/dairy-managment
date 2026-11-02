from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from app.modules.farmers.model import FarmerProfile
from app.modules.farms.model import Farm
from app.modules.pans.model import Pan
from app.modules.animals.model import Animal
from app.modules.milk.model import MilkRecord
from app.modules.health.model import HealthRecord


def get_farmer_dashboard(db: Session, user_id):
    """Return dashboard statistics for the logged-in farmer."""

    farmer = (
        db.query(FarmerProfile)
        .filter(FarmerProfile.user_id == user_id)
        .first()
    )

    if not farmer:
        return {
            "total_farms": 0,
            "total_pans": 0,
            "total_animals": 0,
            "today_milk": 0,
            "health_records": 0,
        }

    farm_ids = (
        db.query(Farm.id)
        .filter(Farm.farmer_id == farmer.id)
        .subquery()
    )

    pan_ids = (
        db.query(Pan.id)
        .filter(Pan.farm_id.in_(db.query(Farm.id).filter(Farm.farmer_id == farmer.id)))
        .subquery()
    )

    total_farms = (
        db.query(func.count(Farm.id))
        .filter(Farm.farmer_id == farmer.id)
        .scalar()
    ) or 0

    total_pans = (
        db.query(func.count(Pan.id))
        .filter(Pan.farm_id.in_(farm_ids))
        .scalar()
    ) or 0

    total_animals = (
        db.query(func.count(Animal.id))
        .filter(Animal.pan_id.in_(pan_ids))
        .scalar()
    ) or 0

    today_milk = (
        db.query(func.coalesce(func.sum(MilkRecord.total_quantity), 0))
        .filter(
            MilkRecord.farm_id.in_(farm_ids),
            MilkRecord.record_date == date.today(),
        )
        .scalar()
    ) or 0

    health_records = (
        db.query(func.count(HealthRecord.id))
        .join(Animal, HealthRecord.animal_id == Animal.id)
        .filter(Animal.pan_id.in_(pan_ids))
        .scalar()
    ) or 0

    return {
        "total_farms": total_farms,
        "total_pans": total_pans,
        "total_animals": total_animals,
        "today_milk": float(today_milk),
        "health_records": health_records,
    }