import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.core.constants import UserRole
from app.modules.auth.dependencies import require_roles
from app.modules.breeding.schema import (
    BreedingRecordCreate,
    BreedingRecordListResponse,
    BreedingRecordResponse,
    BreedingRecordUpdate,
)
from app.modules.breeding.service import (
    create_farmer_breeding_record,
    delete_farmer_breeding_record,
    get_farmer_breeding_record,
    get_farmer_breeding_records,
    update_farmer_breeding_record,
)


router = APIRouter()


@router.post(
    "",
    response_model=BreedingRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_farmer_breeding_record_route(
    payload: BreedingRecordCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    record_data = payload.model_dump(exclude={"animal_id"})
    return create_farmer_breeding_record(
        db=db,
        user_id=current_user.id,
        animal_id=payload.animal_id,
        record_data=record_data,
    )


@router.get(
    "",
    response_model=BreedingRecordListResponse,
)
def get_farmer_breeding_records_route(
    animal_id: uuid.UUID | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_breeding_records(
        db=db,
        user_id=current_user.id,
        animal_id=animal_id,
    )


@router.get(
    "/{record_id}",
    response_model=BreedingRecordResponse,
)
def get_farmer_breeding_record_route(
    record_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_breeding_record(
        db=db,
        user_id=current_user.id,
        record_id=record_id,
    )


@router.put(
    "/{record_id}",
    response_model=BreedingRecordResponse,
)
def update_farmer_breeding_record_route(
    record_id: uuid.UUID,
    payload: BreedingRecordUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one field is required for update.",
        )

    return update_farmer_breeding_record(
        db=db,
        user_id=current_user.id,
        record_id=record_id,
        update_data=update_data,
    )


@router.delete(
    "/{record_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_farmer_breeding_record_route(
    record_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    delete_farmer_breeding_record(
        db=db,
        user_id=current_user.id,
        record_id=record_id,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)