import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.core.constants import UserRole
from app.modules.auth.dependencies import require_roles
from app.modules.milk.schema import (
    MilkRecordCreate,
    MilkRecordListResponse,
    MilkRecordResponse,
    MilkRecordUpdate,
)
from app.modules.milk.service import (
    create_farmer_milk_record,
    delete_farmer_milk_record,
    get_farmer_milk_record,
    get_farmer_milk_records,
    update_farmer_milk_record,
)


router = APIRouter()


@router.post(
    "",
    response_model=MilkRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_farmer_milk_record_route(
    payload: MilkRecordCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    record_data = payload.model_dump(exclude_unset=True)
    record_data.setdefault("record_date", payload.record_date)
    return create_farmer_milk_record(
        db=db,
        user_id=current_user.id,
        record_data=record_data,
    )


@router.get(
    "",
    response_model=MilkRecordListResponse,
)
def get_farmer_milk_records_route(
    farm_id: uuid.UUID | None = Query(default=None),
    animal_id: uuid.UUID | None = Query(default=None),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    if from_date is not None and to_date is not None and from_date > to_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="from_date must be on or before to_date.",
        )

    return get_farmer_milk_records(
        db=db,
        user_id=current_user.id,
        farm_id=farm_id,
        animal_id=animal_id,
        from_date=from_date,
        to_date=to_date,
    )


@router.get(
    "/{record_id}",
    response_model=MilkRecordResponse,
)
def get_farmer_milk_record_route(
    record_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_milk_record(
        db=db,
        user_id=current_user.id,
        record_id=record_id,
    )


@router.put(
    "/{record_id}",
    response_model=MilkRecordResponse,
)
def update_farmer_milk_record_route(
    record_id: uuid.UUID,
    payload: MilkRecordUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one field is required for update.",
        )

    return update_farmer_milk_record(
        db=db,
        user_id=current_user.id,
        record_id=record_id,
        update_data=update_data,
    )


@router.delete(
    "/{record_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_farmer_milk_record_route(
    record_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    delete_farmer_milk_record(
        db=db,
        user_id=current_user.id,
        record_id=record_id,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)