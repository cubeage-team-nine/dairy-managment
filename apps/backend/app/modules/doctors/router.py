import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.common.pagination import PaginatedResponse, PaginationParams
from app.core.constants import UserRole
from app.modules.auth.dependencies import require_roles
from app.modules.doctors.schema import (
    AdminDoctorListItem,
    DoctorProfileResponse,
    DoctorProfileUpdate,
    DoctorAvailabilityUpdate,
    FarmerApprovedDoctorResponse,
)
from app.modules.doctors.service import (
    approve_doctor_registration,
    get_admin_doctors_page,
    get_farmer_approved_doctors,
    get_my_doctor_profile,
    update_my_doctor_availability,
    reject_doctor_registration,
    update_my_doctor_profile,
    upload_my_doctor_photo,
    get_my_doctor_photo_path,
)


router = APIRouter()
farmer_router = APIRouter(
    prefix="/farmer/doctors",
    tags=["Farmer Doctors"],
    dependencies=[Depends(require_roles(UserRole.FARMER))],
)
admin_router = APIRouter(
    prefix="/admin/doctors",
    tags=["Admin Doctors"],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)


@farmer_router.get("", response_model=list[FarmerApprovedDoctorResponse])
def get_farmer_approved_doctors_route(
    db: Session = Depends(get_db),
):
    return get_farmer_approved_doctors(db)


@router.get(
    "/me",
    response_model=DoctorProfileResponse,
)
def get_my_doctor_profile_route(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    return get_my_doctor_profile(
        db=db,
        user_id=current_user.id,
    )


@router.patch(
    "/me",
    response_model=DoctorProfileResponse,
)
def update_my_doctor_profile_route(
    payload: DoctorProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one field is required for update.",
        )

    return update_my_doctor_profile(
        db=db,
        user_id=current_user.id,
        update_data=update_data,
    )


@router.patch("/me/availability", response_model=DoctorProfileResponse)
def update_my_doctor_availability_route(
    payload: DoctorAvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    return update_my_doctor_availability(db, current_user.id, payload.is_available)


@router.post("/me/photo", response_model=DoctorProfileResponse)
async def upload_my_doctor_photo_route(
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    content = await photo.read(5 * 1024 * 1024 + 1)
    return upload_my_doctor_photo(db, current_user.id, content, photo.content_type or "")


@router.get("/me/photo")
def get_my_doctor_photo_route(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    path = get_my_doctor_photo_path(db, current_user.id)
    return FileResponse(path)


@admin_router.get("", response_model=PaginatedResponse[AdminDoctorListItem])
def list_doctor_registrations_route(
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
):
    return get_admin_doctors_page(
        db=db,
        page=pagination.page,
        page_size=pagination.page_size,
    )


@admin_router.patch(
    "/{doctor_id}/approve",
    response_model=AdminDoctorListItem,
)
def approve_doctor_registration_route(
    doctor_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return approve_doctor_registration(db=db, doctor_id=doctor_id)


@admin_router.patch(
    "/{doctor_id}/reject",
    response_model=AdminDoctorListItem,
)
def reject_doctor_registration_route(
    doctor_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return reject_doctor_registration(db=db, doctor_id=doctor_id)
