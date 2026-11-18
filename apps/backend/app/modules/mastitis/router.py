import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.core.constants import UserRole
from app.modules.auth.dependencies import require_roles
from app.modules.mastitis.schema import (
    MastitisRecordCreate,
    MastitisRecordListResponse,
    MastitisRecordResponse,
    MastitisRecordUpdate,
)
from app.modules.mastitis.service import (
    create_farmer_mastitis_record,
    delete_farmer_mastitis_record,
    get_farmer_mastitis_record,
    get_farmer_mastitis_records,
    update_farmer_mastitis_record,
)
from app.modules.mastitis.doctor_service import list_doctor_mastitis_cases, create_doctor_mastitis_case, update_doctor_mastitis_case, get_doctor_mastitis_case_history


router = APIRouter()
doctor_router = APIRouter(prefix="/doctor/mastitis-cases", tags=["Doctor Mastitis Cases"])


@doctor_router.get("", response_model=MastitisRecordListResponse)
def list_doctor_mastitis_cases_route(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    return list_doctor_mastitis_cases(db, current_user.id)


@doctor_router.post("", response_model=MastitisRecordResponse, status_code=status.HTTP_201_CREATED)
def create_doctor_mastitis_case_route(
    payload: MastitisRecordCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    return create_doctor_mastitis_case(db, current_user.id, payload.animal_id, payload.model_dump(exclude={"animal_id"}))


@doctor_router.get("/{case_id}/history")
def get_doctor_mastitis_case_history_route(
    case_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    return get_doctor_mastitis_case_history(db, current_user.id, case_id)


@doctor_router.patch("/{case_id}", response_model=MastitisRecordResponse)
def update_doctor_mastitis_case_route(
    case_id: uuid.UUID,
    payload: MastitisRecordUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="At least one field is required for update.")
    return update_doctor_mastitis_case(db, current_user.id, case_id, update_data)


@router.post(
    "",
    response_model=MastitisRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_farmer_mastitis_record_route(
    payload: MastitisRecordCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return create_farmer_mastitis_record(
        db,
        current_user.id,
        payload.animal_id,
        payload.model_dump(exclude={"animal_id"}),
    )


@router.get("", response_model=MastitisRecordListResponse)
def get_farmer_mastitis_records_route(
    animal_id: uuid.UUID | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_mastitis_records(db, current_user.id, animal_id)


@router.get("/{record_id}", response_model=MastitisRecordResponse)
def get_farmer_mastitis_record_route(
    record_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_mastitis_record(db, current_user.id, record_id)


@router.put("/{record_id}", response_model=MastitisRecordResponse)
def update_farmer_mastitis_record_route(
    record_id: uuid.UUID,
    payload: MastitisRecordUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one field is required for update.",
        )
    return update_farmer_mastitis_record(
        db,
        current_user.id,
        record_id,
        update_data,
    )


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farmer_mastitis_record_route(
    record_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    delete_farmer_mastitis_record(db, current_user.id, record_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
