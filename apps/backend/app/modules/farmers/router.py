import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.common.pagination import PaginatedResponse, PaginationParams
from app.core.constants import UserRole
from app.modules.auth.dependencies import require_roles
from app.modules.farmers.schema import (
    FarmerDetailResponse,
    FarmerListItem,
    FarmerStatusUpdate,
)
from app.modules.farmers.service import (
    change_farmer_status,
    get_farmer,
    get_farmer_details,
    get_farmers_page,
)

router = APIRouter(dependencies=[Depends(require_roles(UserRole.ADMIN))])


@router.get("", response_model=PaginatedResponse[FarmerListItem])
def list_farmers_route(
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
) -> PaginatedResponse[FarmerListItem]:
    return get_farmers_page(db, pagination.page, pagination.page_size)


@router.get("/{farmer_id}", response_model=FarmerDetailResponse)
def get_farmer_route(
    farmer_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> FarmerDetailResponse:
    return get_farmer_details(db, farmer_id)


@router.patch("/{farmer_id}/status", response_model=FarmerListItem)
def update_farmer_status_route(
    farmer_id: uuid.UUID,
    payload: FarmerStatusUpdate,
    db: Session = Depends(get_db),
) -> FarmerListItem:
    return change_farmer_status(db, farmer_id, payload.status)
