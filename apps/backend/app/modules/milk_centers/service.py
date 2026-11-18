import math
import uuid

from sqlalchemy.orm import Session

from app.common.pagination import PaginatedResponse
from app.core.exceptions import ConflictError, NotFoundError
from app.modules.milk_centers import repository
from app.modules.milk_centers.schema import MilkCenterResponse


def list_milk_centers(
    db: Session,
    page: int,
    page_size: int,
    is_active: bool | None = None,
    search: str | None = None,
) -> PaginatedResponse[MilkCenterResponse]:
    items, total = repository.list_milk_centers(
        db, page=page, page_size=page_size,
        is_active=is_active, search=search,
    )
    total_pages = max(1, math.ceil(total / page_size)) if total else 1
    return PaginatedResponse[MilkCenterResponse](
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


def create_milk_center(db: Session, data: dict) -> MilkCenterResponse:
    center = repository.create_milk_center(db, data)
    return center


def update_milk_center(db: Session, center_id: uuid.UUID, data: dict) -> MilkCenterResponse:
    center = repository.get_milk_center_by_id(db, center_id)
    if center is None:
        raise NotFoundError("Milk center not found.")
    return repository.update_milk_center(db, center, data)


def delete_milk_center(db: Session, center_id: uuid.UUID) -> None:
    center = repository.get_milk_center_by_id(db, center_id)
    if center is None:
        raise NotFoundError("Milk center not found.")
    repository.delete_milk_center(db, center)
