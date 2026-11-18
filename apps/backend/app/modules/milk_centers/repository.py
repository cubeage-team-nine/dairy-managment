import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.modules.milk_centers.model import MilkCenter


def list_milk_centers(
    db: Session,
    page: int,
    page_size: int,
    is_active: bool | None = None,
    search: str | None = None,
):
    q = db.query(MilkCenter)

    if is_active is not None:
        q = q.filter(MilkCenter.is_active == is_active)

    if search:
        pattern = f"%{search.strip()}%"
        q = q.filter(
            MilkCenter.name.ilike(pattern)
            | MilkCenter.location.ilike(pattern)
            | MilkCenter.manager_name.ilike(pattern)
            | MilkCenter.code.ilike(pattern)
        )

    total = q.with_entities(func.count(MilkCenter.id)).scalar() or 0
    items = q.order_by(MilkCenter.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def get_milk_center_by_id(db: Session, center_id: uuid.UUID) -> MilkCenter | None:
    return db.query(MilkCenter).filter(MilkCenter.id == center_id).first()


def create_milk_center(db: Session, data: dict) -> MilkCenter:
    center = MilkCenter(**data)
    db.add(center)
    db.commit()
    db.refresh(center)
    return center


def update_milk_center(db: Session, center: MilkCenter, data: dict) -> MilkCenter:
    for field, value in data.items():
        setattr(center, field, value)
    db.commit()
    db.refresh(center)
    return center


def delete_milk_center(db: Session, center: MilkCenter) -> None:
    db.delete(center)
    db.commit()
