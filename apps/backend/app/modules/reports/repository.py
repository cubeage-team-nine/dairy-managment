from datetime import date, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.modules.animals.model import Animal
from app.modules.breeding.model import BreedingRecord
from app.modules.farmers.model import FarmerProfile
from app.modules.farms.model import Farm
from app.modules.feed.model import FeedRecord, FeedType
from app.modules.health.model import HealthRecord
from app.modules.mastitis.model import MastitisRecord
from app.modules.milk.model import MilkRecord
from app.modules.pans.model import Pan
from app.modules.users.model import User


def _apply_date_filter(query, column, from_date: date | None, to_date: date | None):
    if from_date is not None:
        query = query.filter(column >= from_date)
    if to_date is not None:
        query = query.filter(column < to_date + timedelta(days=1))
    return query


def get_admin_report_rows(
    db: Session,
    report_type: str,
    from_date: date | None,
    to_date: date | None,
):
    if report_type == "animals":
        query = (
            db.query(Animal, Farm.name, User.full_name)
            .join(Pan, Animal.pan_id == Pan.id)
            .join(Farm, Pan.farm_id == Farm.id)
            .join(FarmerProfile, Farm.farmer_id == FarmerProfile.id)
            .join(User, FarmerProfile.user_id == User.id)
        )
        query = _apply_date_filter(query, func.date(Animal.created_at), from_date, to_date)
        return query.order_by(Animal.created_at.desc()).all()

    if report_type in {"milk", "finance"}:
        query = (
            db.query(MilkRecord, Animal.tag_number, Farm.name, User.full_name)
            .join(Farm, MilkRecord.farm_id == Farm.id)
            .outerjoin(Animal, MilkRecord.animal_id == Animal.id)
            .join(FarmerProfile, Farm.farmer_id == FarmerProfile.id)
            .join(User, FarmerProfile.user_id == User.id)
        )
        query = _apply_date_filter(query, MilkRecord.record_date, from_date, to_date)
        return query.order_by(MilkRecord.record_date.desc(), MilkRecord.created_at.desc()).all()

    if report_type == "feed":
        query = (
            db.query(FeedRecord, Animal.tag_number, FeedType.name, Farm.name, User.full_name)
            .join(Animal, FeedRecord.animal_id == Animal.id)
            .join(Pan, Animal.pan_id == Pan.id)
            .join(Farm, Pan.farm_id == Farm.id)
            .join(FarmerProfile, Farm.farmer_id == FarmerProfile.id)
            .join(User, FarmerProfile.user_id == User.id)
            .join(FeedType, FeedRecord.feed_type_id == FeedType.id)
        )
        query = _apply_date_filter(query, FeedRecord.record_date, from_date, to_date)
        return query.order_by(FeedRecord.record_date.desc(), FeedRecord.created_at.desc()).all()

    if report_type == "health":
        query = (
            db.query(HealthRecord, Animal.tag_number, Farm.name, User.full_name)
            .join(Animal, HealthRecord.animal_id == Animal.id)
            .join(Pan, Animal.pan_id == Pan.id)
            .join(Farm, Pan.farm_id == Farm.id)
            .join(FarmerProfile, Farm.farmer_id == FarmerProfile.id)
            .join(User, FarmerProfile.user_id == User.id)
        )
        query = _apply_date_filter(query, HealthRecord.visit_date, from_date, to_date)
        return query.order_by(HealthRecord.visit_date.desc()).all()

    if report_type == "breeding":
        query = (
            db.query(BreedingRecord, Animal.tag_number, Farm.name, User.full_name)
            .join(Animal, BreedingRecord.animal_id == Animal.id)
            .join(Pan, Animal.pan_id == Pan.id)
            .join(Farm, Pan.farm_id == Farm.id)
            .join(FarmerProfile, Farm.farmer_id == FarmerProfile.id)
            .join(User, FarmerProfile.user_id == User.id)
        )
        date_column = func.coalesce(
            BreedingRecord.ai_date,
            BreedingRecord.pregnancy_confirmation_date,
            BreedingRecord.calving_date,
        )
        query = _apply_date_filter(query, date_column, from_date, to_date)
        return query.order_by(date_column.desc().nullslast()).all()

    if report_type == "mastitis":
        query = (
            db.query(MastitisRecord, Animal.tag_number, Farm.name, User.full_name)
            .join(Animal, MastitisRecord.animal_id == Animal.id)
            .join(Pan, Animal.pan_id == Pan.id)
            .join(Farm, Pan.farm_id == Farm.id)
            .join(FarmerProfile, Farm.farmer_id == FarmerProfile.id)
            .join(User, FarmerProfile.user_id == User.id)
        )
        query = _apply_date_filter(query, MastitisRecord.test_date, from_date, to_date)
        return query.order_by(MastitisRecord.test_date.desc()).all()

    raise ValueError(f"Unsupported report type: {report_type}")
