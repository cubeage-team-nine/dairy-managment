import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.common.pagination import PaginatedResponse, PaginationParams
from app.core.constants import UserRole
from app.modules.auth.dependencies import require_roles
from app.modules.farmers.schema import FarmerListItem
from app.modules.farmers.service import get_farmer, get_farmers_page

router = APIRouter(dependencies=[Depends(require_roles(UserRole.ADMIN))])


@router.get("", response_model=PaginatedResponse[FarmerListItem])
def list_farmers_route(
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
) -> PaginatedResponse[FarmerListItem]:
    return get_farmers_page(db, pagination.page, pagination.page_size)


@router.get("/{farmer_id}", response_model=FarmerListItem)
def get_farmer_route(farmer_id: uuid.UUID, db: Session = Depends(get_db)) -> FarmerListItem:
    return get_farmer(db, farmer_id)
