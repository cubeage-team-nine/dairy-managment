# API routes for the Pans module
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.core.constants import UserRole
from app.modules.auth.dependencies import require_roles
from app.modules.pans.schema import (
    PanCreate,
    PanListResponse,
    PanResponse,
    PanUpdate,
)
from app.modules.pans.service import (
    create_farmer_pan,
    delete_farmer_pan,
    get_farmer_pan,
    get_farmer_pans,
    update_farmer_pan,
)


router = APIRouter()


@router.post(
    "",
    response_model=PanResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_farmer_pan_route(
    payload: PanCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    pan_data = payload.model_dump(exclude={"farm_id"})
    return create_farmer_pan(
        db=db,
        user_id=current_user.id,
        farm_id=payload.farm_id,
        pan_data=pan_data,
    )


@router.get(
    "",
    response_model=PanListResponse,
)
def get_farmer_pans_route(
    farm_id: uuid.UUID | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_pans(
        db=db,
        user_id=current_user.id,
        farm_id=farm_id,
    )


@router.get(
    "/{pan_id}",
    response_model=PanResponse,
)
def get_farmer_pan_route(
    pan_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_pan(
        db=db,
        user_id=current_user.id,
        pan_id=pan_id,
    )


@router.put(
    "/{pan_id}",
    response_model=PanResponse,
)
def update_farmer_pan_route(
    pan_id: uuid.UUID,
    payload: PanUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one field is required for update.",
        )

    for field in ("name", "pen_number", "pen_type", "max_animal_capacity"):
        if field in update_data and update_data[field] is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"{field} cannot be null.",
            )

    return update_farmer_pan(
        db=db,
        user_id=current_user.id,
        pan_id=pan_id,
        update_data=update_data,
    )


@router.delete(
    "/{pan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_farmer_pan_route(
    pan_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    delete_farmer_pan(db=db, user_id=current_user.id, pan_id=pan_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)