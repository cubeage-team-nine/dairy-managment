import math
import uuid

from sqlalchemy.orm import Session

from app.common.pagination import PaginatedResponse
from app.core.exceptions import NotFoundError
from app.modules.farmers.repository import (
    get_farmer_by_id,
    list_farmers,
    update_farmer_status,
)
from app.modules.farmers.schema import FarmerDetailResponse, FarmerListItem


def _to_list_item(farmer_profile, user, animals_count) -> FarmerListItem:
    return FarmerListItem(
        id=farmer_profile.id,
        full_name=user.full_name,
        mobile_number=user.mobile_number,
        village=farmer_profile.village,
        animals_count=animals_count or 0,
        status=user.status,
    )


def get_farmers_page(db: Session, page: int, page_size: int) -> PaginatedResponse[FarmerListItem]:
    rows, total = list_farmers(db, page, page_size)
    items = [_to_list_item(farmer_profile, user, animals_count) for farmer_profile, user, animals_count in rows]
    total_pages = max(1, math.ceil(total / page_size)) if total else 1

    return PaginatedResponse[FarmerListItem](
        items=items, total=total, page=page, page_size=page_size, total_pages=total_pages
    )


def get_farmer(db: Session, farmer_id: uuid.UUID) -> FarmerListItem:
    row = get_farmer_by_id(db, farmer_id)
    if row is None:
        raise NotFoundError("Farmer not found.")

    farmer_profile, user, animals_count = row
    return _to_list_item(farmer_profile, user, animals_count)


def get_farmer_details(db: Session, farmer_id: uuid.UUID) -> FarmerDetailResponse:
    row = get_farmer_by_id(db, farmer_id)
    if row is None:
        raise NotFoundError("Farmer not found.")

    profile, user, animals_count = row
    return FarmerDetailResponse(
        id=profile.id,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        mobile_number=user.mobile_number,
        first_name=profile.first_name,
        middle_name=profile.middle_name,
        last_name=profile.last_name,
        village=profile.village,
        pincode=profile.pincode,
        animals_count=animals_count or 0,
        status=user.status,
        is_verified=user.is_verified,
        registered_at=user.created_at,
        farms=profile.farms,
    )


def change_farmer_status(db: Session, farmer_id: uuid.UUID, status):
    row = get_farmer_by_id(db, farmer_id)
    if row is None:
        raise NotFoundError("Farmer not found.")

    _, user, _ = row
    update_farmer_status(db, user, status)
    return get_farmer(db, farmer_id)
