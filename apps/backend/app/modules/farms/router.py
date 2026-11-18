# API routes for the Farms module


import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.common.pagination import PaginatedResponse, PaginationParams
from app.core.constants import UserRole
from app.modules.auth.dependencies import require_roles
from app.modules.farms.schema import (
    AdminFarmListItem,
    FarmCreate,
    FarmListResponse,
    FarmPhotoResponse,
    FarmResponse,
    FarmUpdate,
)
from app.modules.farms.service import (
    create_farmer_farm,
    delete_farmer_farm_photo,
    get_admin_farms_page,
    get_farmer_farm_photo_path,
    get_farmer_farm_photos,
    get_farmer_farms,
    MAX_FARM_PHOTO_FILE_SIZE,
    MAX_FARM_PHOTO_UPLOAD_SIZE,
    upload_farmer_farm_photos,
    update_farmer_farm,
)

router = APIRouter()
admin_farms_router = APIRouter(
    prefix="/admin/farms",
    tags=["Admin Farms"],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)


# ── Admin routes ──────────────────────────────────────────────────────────────

@admin_farms_router.get("", response_model=PaginatedResponse[AdminFarmListItem])
def admin_list_farms_route(
    pagination: PaginationParams = Depends(),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return get_admin_farms_page(
        db=db,
        page=pagination.page,
        page_size=pagination.page_size,
        search=search,
    )


@router.post(
    "",
    response_model=FarmResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_farmer_farm_route(
    payload: FarmCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return create_farmer_farm(
        db=db,
        user_id=current_user.id,
        farm_data=payload.model_dump(),
    )


@router.get(
    "",
    response_model=FarmListResponse,
)
def get_farmer_farms_route(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_farms(
        db=db,
        user_id=current_user.id,
    )


@router.put(
    "/{farm_id}",
    response_model=FarmResponse,
)
def update_farmer_farm_route(
    farm_id: uuid.UUID,
    payload: FarmUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one field is required for update.",
        )

    if "name" in update_data and update_data["name"] is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Farm name cannot be null.",
        )

    return update_farmer_farm(
        db=db,
        user_id=current_user.id,
        farm_id=farm_id,
        update_data=update_data,
    )


@router.get(
    "/{farm_id}/photos",
    response_model=list[FarmPhotoResponse],
)
def get_farmer_farm_photos_route(
    farm_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_farm_photos(
        db=db,
        user_id=current_user.id,
        farm_id=farm_id,
    )


@router.post(
    "/{farm_id}/photos",
    response_model=list[FarmPhotoResponse],
    status_code=status.HTTP_201_CREATED,
)
async def upload_farmer_farm_photos_route(
    farm_id: uuid.UUID,
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    if not files:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Select at least one farm photo.",
        )
    uploads = []
    total_size = 0
    try:
        for upload in files:
            content = await upload.read(MAX_FARM_PHOTO_FILE_SIZE + 1)
            if len(content) > MAX_FARM_PHOTO_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"{upload.filename or 'Photo'} exceeds the 10 MB per-photo limit.",
                )
            total_size += len(content)
            if total_size > MAX_FARM_PHOTO_UPLOAD_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="The total upload size cannot exceed 50 MB.",
                )
            uploads.append((upload.filename, content))
    finally:
        for upload in files:
            await upload.close()

    return upload_farmer_farm_photos(
        db=db,
        user_id=current_user.id,
        farm_id=farm_id,
        uploads=uploads,
    )


@router.get(
    "/{farm_id}/photos/{photo_id}/content",
    response_class=FileResponse,
)
def get_farmer_farm_photo_content_route(
    farm_id: uuid.UUID,
    photo_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    path, content_type = get_farmer_farm_photo_path(
        db=db,
        user_id=current_user.id,
        farm_id=farm_id,
        photo_id=photo_id,
    )
    return FileResponse(
        path,
        media_type=content_type,
        headers={"Cache-Control": "private, no-store"},
    )


@router.delete(
    "/{farm_id}/photos/{photo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_farmer_farm_photo_route(
    farm_id: uuid.UUID,
    photo_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    delete_farmer_farm_photo(
        db=db,
        user_id=current_user.id,
        farm_id=farm_id,
        photo_id=photo_id,
    )
    return None
