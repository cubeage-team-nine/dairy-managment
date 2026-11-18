from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.modules.animals.model import Animal
from app.modules.feed.model import FeedRecord, FeedType
from app.modules.farms.model import Farm
from app.modules.farmers.model import FarmerProfile
from app.modules.pans.model import Pan
from app.modules.users.model import User


def get_feed_types(db: Session):
    return db.query(FeedType).order_by(FeedType.name).all()


def get_feed_type_by_id(db: Session, feed_type_id):
    return db.query(FeedType).filter(FeedType.id == feed_type_id).first()


def get_feed_type_by_name(db: Session, name: str, exclude_id=None):
    query = db.query(FeedType).filter(func.lower(FeedType.name) == name.strip().lower())
    if exclude_id is not None:
        query = query.filter(FeedType.id != exclude_id)
    return query.first()


def create_feed_type(db: Session, feed_type_data: dict):
    feed_type = FeedType(**feed_type_data)
    db.add(feed_type)
    db.commit()
    db.refresh(feed_type)
    return feed_type


def update_feed_type(db: Session, feed_type: FeedType, update_data: dict):
    for field, value in update_data.items():
        setattr(feed_type, field, value)
    db.commit()
    db.refresh(feed_type)
    return feed_type


def count_feed_records_for_type(db: Session, feed_type_id) -> int:
    return (
        db.query(func.count(FeedRecord.id))
        .filter(FeedRecord.feed_type_id == feed_type_id)
        .scalar()
        or 0
    )


def delete_feed_type(db: Session, feed_type: FeedType) -> None:
    db.delete(feed_type)
    db.commit()


def create_feed_record(db: Session, record_data: dict):
    record = FeedRecord(**record_data)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_feed_records_by_farmer(
    db: Session,
    farmer_id,
    animal_id=None,
    from_date: date | None = None,
    to_date: date | None = None,
):
    query = (
        db.query(FeedRecord, Animal.tag_number, FeedType.name)
        .join(Animal, FeedRecord.animal_id == Animal.id)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .join(FeedType, FeedRecord.feed_type_id == FeedType.id)
        .filter(Farm.farmer_id == farmer_id)
    )

    if animal_id is not None:
        query = query.filter(FeedRecord.animal_id == animal_id)
    if from_date is not None:
        query = query.filter(FeedRecord.record_date >= from_date)
    if to_date is not None:
        query = query.filter(FeedRecord.record_date <= to_date)

    return query.order_by(FeedRecord.record_date.desc(), FeedRecord.created_at.desc()).all()


def get_feed_record_by_id_and_farmer(db: Session, record_id, farmer_id):
    return (
        db.query(FeedRecord, Animal.tag_number, FeedType.name)
        .join(Animal, FeedRecord.animal_id == Animal.id)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .join(FeedType, FeedRecord.feed_type_id == FeedType.id)
        .filter(
            FeedRecord.id == record_id,
            Farm.farmer_id == farmer_id,
        )
        .first()
    )


def get_admin_feed_records(db: Session):
    return (
        db.query(
            FeedRecord,
            Animal.tag_number,
            FeedType.name,
            Farm.name,
            User.full_name,
        )
        .join(Animal, FeedRecord.animal_id == Animal.id)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .join(FarmerProfile, Farm.farmer_id == FarmerProfile.id)
        .join(User, FarmerProfile.user_id == User.id)
        .join(FeedType, FeedRecord.feed_type_id == FeedType.id)
        .order_by(FeedRecord.record_date.desc(), FeedRecord.created_at.desc())
        .all()
    )


def get_admin_feed_record_by_id(db: Session, record_id):
    return db.get(FeedRecord, record_id)


def update_feed_record(db: Session, record: FeedRecord, update_data: dict):
    for field, value in update_data.items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)
    return record


def delete_feed_record(db: Session, record: FeedRecord):
    db.delete(record)
    db.commit()