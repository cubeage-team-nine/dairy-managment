import uuid

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.core.constants import UserRole
from app.modules.auth.dependencies import require_roles
from app.modules.doctor_requests.schema import (
    FarmerDoctorRequestCreate,
    FarmerDoctorRequestListResponse,
    FarmerDoctorRequestResponse,
)
from app.modules.doctor_requests.service import (
    create_farmer_request,
    get_farmer_request,
    get_farmer_requests,
)
from app.modules.doctor_requests.doctor_service import list_doctor_requests, update_doctor_request


router = APIRouter()
doctor_router = APIRouter(prefix="/doctor/health-requests", tags=["Doctor Health Requests"])


class CompletionNotes(BaseModel):
    treatment_notes: str = Field(min_length=1, max_length=10000)


@doctor_router.get("")
def list_doctor_health_requests_route(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    return list_doctor_requests(db, current_user.id)


@doctor_router.get("/{request_id}")
def get_doctor_health_request_route(
    request_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    items = list_doctor_requests(db, current_user.id)["items"]
    item = next((row for row in items if row["id"] == request_id), None)
    if item is None:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Assigned health request not found.")
    return item


@doctor_router.patch("/{request_id}/accept")
def accept_doctor_health_request_route(
    request_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    return update_doctor_request(db, current_user.id, request_id, "ACCEPTED")


@doctor_router.patch("/{request_id}/reject")
def reject_doctor_health_request_route(
    request_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    return update_doctor_request(db, current_user.id, request_id, "REJECTED")


@doctor_router.patch("/{request_id}/complete")
def complete_doctor_health_request_route(
    request_id: uuid.UUID,
    payload: CompletionNotes,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    return update_doctor_request(db, current_user.id, request_id, "COMPLETED", payload.treatment_notes)


@router.post(
    "",
    response_model=FarmerDoctorRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_farmer_request_route(
    payload: FarmerDoctorRequestCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return create_farmer_request(
        db=db,
        user_id=current_user.id,
        animal_id=payload.animal_id,
        doctor_id=payload.doctor_id,
        selection_mode=payload.selection_mode,
        priority=payload.priority,
        request_description=payload.request_description,
    )


@router.get(
    "",
    response_model=FarmerDoctorRequestListResponse,
)
def get_farmer_requests_route(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_requests(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/{request_id}",
    response_model=FarmerDoctorRequestResponse,
)
def get_farmer_request_route(
    request_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_request(
        db=db,
        user_id=current_user.id,
        request_id=request_id,
    )
