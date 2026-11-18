import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.core.constants import UserRole
from app.modules.auth.dependencies import require_roles
from app.modules.health.schema import (
    FarmerHealthRecordCreate,
    FarmerHealthRecordListResponse,
    FarmerHealthRecordResponse,
    FarmerHealthRecordUpdate,
)
from app.modules.health.service import (
    create_farmer_health_record,
    delete_farmer_health_record,
    get_farmer_health_records,
    update_farmer_health_record,
)
from app.modules.health.doctor_service import list_doctor_health_records, create_doctor_health_record, update_doctor_health_record


router = APIRouter()
doctor_router = APIRouter(prefix="/doctor/health-records", tags=["Doctor Health Records"])


@doctor_router.get("")
def list_doctor_health_records_route(
    animal_id: uuid.UUID | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    return list_doctor_health_records(db, current_user.id, animal_id)


@doctor_router.post("", status_code=status.HTTP_201_CREATED)
def create_doctor_health_record_route(
    payload: FarmerHealthRecordCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    return create_doctor_health_record(db, current_user.id, payload.animal_id, payload.model_dump(exclude={"animal_id"}))


@doctor_router.put("/{record_id}")
def update_doctor_health_record_route(
    record_id: uuid.UUID,
    payload: FarmerHealthRecordUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="At least one field is required for update.")
    return update_doctor_health_record(db, current_user.id, record_id, update_data)


@router.post(
    "",
    response_model=FarmerHealthRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_farmer_health_record_route(
    payload: FarmerHealthRecordCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return create_farmer_health_record(
        db=db,
        user_id=current_user.id,
        animal_id=payload.animal_id,
        record_data=payload.model_dump(exclude={"animal_id"}),
    )


@router.get(
    "",
    response_model=FarmerHealthRecordListResponse,
)
def get_farmer_health_records_route(
    animal_id: uuid.UUID | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_health_records(
        db=db,
        user_id=current_user.id,
        animal_id=animal_id,
    )


@router.put(
    "/{record_id}",
    response_model=FarmerHealthRecordResponse,
)
def update_farmer_health_record_route(
    record_id: uuid.UUID,
    payload: FarmerHealthRecordUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one field is required for update.",
        )
    return update_farmer_health_record(
        db=db,
        user_id=current_user.id,
        record_id=record_id,
        update_data=update_data,
    )


@router.delete(
    "/{record_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_farmer_health_record_route(
    record_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    delete_farmer_health_record(db, current_user.id, record_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
