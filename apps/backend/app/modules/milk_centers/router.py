import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.common.pagination import PaginatedResponse, PaginationParams
from app.core.constants import UserRole
from app.modules.auth.dependencies import require_roles
from app.modules.milk_centers.schema import (
    MilkCenterCreate,
    MilkCenterResponse,
    MilkCenterUpdate,
)
from app.modules.milk_centers.service import (
    create_milk_center,
    delete_milk_center,
    list_milk_centers,
    update_milk_center,
)

router = APIRouter(
    prefix="/admin/milk-centers",
    tags=["Admin Milk Centers"],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)


@router.get("", response_model=PaginatedResponse[MilkCenterResponse])
def list_milk_centers_route(
    pagination: PaginationParams = Depends(),
    is_active: bool | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return list_milk_centers(
        db=db,
        page=pagination.page,
        page_size=pagination.page_size,
        is_active=is_active,
        search=search,
    )


@router.post("", response_model=MilkCenterResponse, status_code=status.HTTP_201_CREATED)
def create_milk_center_route(
    payload: MilkCenterCreate,
    db: Session = Depends(get_db),
):
    return create_milk_center(db=db, data=payload.model_dump())


@router.patch("/{center_id}", response_model=MilkCenterResponse)
def update_milk_center_route(
    center_id: uuid.UUID,
    payload: MilkCenterUpdate,
    db: Session = Depends(get_db),
):
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one field is required for update.",
        )
    return update_milk_center(db=db, center_id=center_id, data=update_data)


@router.delete("/{center_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_milk_center_route(
    center_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    delete_milk_center(db=db, center_id=center_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
