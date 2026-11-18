# Business logic for the Farms module


import uuid
from pathlib import PurePosixPath

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.modules.dashboard.repository import get_farmer_profile
from app.modules.farms import repository
from app.modules.farms.model import FarmPhoto
from app.modules.farms.storage import (
    create_storage_key,
    delete_farm_photo_file,
    get_farm_photo_path,
    save_farm_photo,
)


MAX_FARM_PHOTO_FILE_SIZE = 10 * 1024 * 1024
MAX_FARM_PHOTO_UPLOAD_SIZE = 50 * 1024 * 1024
_IMAGE_SIGNATURES = {
    ".jpg": ("image/jpeg", lambda content: content.startswith(b"\xff\xd8\xff")),
    ".jpeg": ("image/jpeg", lambda content: content.startswith(b"\xff\xd8\xff")),
    ".png": (
        "image/png",
        lambda content: content.startswith(b"\x89PNG\r\n\x1a\n"),
    ),
    ".webp": (
        "image/webp",
        lambda content: (
            len(content) >= 12
            and content.startswith(b"RIFF")
            and content[8:12] == b"WEBP"
        ),
    ),
}


def _validate_farm_photo(filename: str | None, content: bytes) -> tuple[str, str, str]:
    safe_filename = (filename or "").replace("\\", "/").rsplit("/", 1)[-1].strip()
    extension = PurePosixPath(safe_filename).suffix.lower()
    if not safe_filename or extension not in _IMAGE_SIGNATURES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPG, JPEG, PNG, and WEBP photos are allowed.",
        )
    if not content:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{safe_filename} is empty.",
        )
    if len(content) > MAX_FARM_PHOTO_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"{safe_filename} exceeds the 10 MB per-photo limit.",
        )

    content_type, signature_check = _IMAGE_SIGNATURES[extension]
    if not signature_check(content):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"{safe_filename} does not contain a valid {extension} image.",
        )

    return safe_filename[:255], extension, content_type


def create_farmer_farm(
    db: Session,
    user_id: uuid.UUID,
    farm_data: dict,
):
    farmer = get_farmer_profile(db, user_id)

    if farmer is None:
        raise NotFoundError("Farmer profile not found.")

    return repository.create_farm(
        db=db,
        farmer_id=farmer.id,
        farm_data=farm_data,
    )


def get_farmer_farms(db: Session, user_id: uuid.UUID):
    """
    Return farms belonging only to the logged-in farmer.
    """

    farmer = get_farmer_profile(db, user_id)

    if farmer is None:
        raise NotFoundError("Farmer profile not found.")

    farms = repository.get_farms_by_farmer(
        db=db,
        farmer_id=farmer.id,
    )

    return {
        "farmer_name": " ".join(
            part
            for part in [
                farmer.first_name,
                farmer.middle_name,
                farmer.last_name,
            ]
            if part
        ),
        "items": farms,
    }


def update_farmer_farm(
    db: Session,
    user_id: uuid.UUID,
    farm_id: uuid.UUID,
    update_data: dict,
):
    """
    Update a farm only if it belongs to the logged-in farmer.
    """

    farmer = get_farmer_profile(db, user_id)

    if farmer is None:
        raise NotFoundError("Farmer profile not found.")

    farm = repository.get_farm_by_id_and_farmer(
        db=db,
        farm_id=farm_id,
        farmer_id=farmer.id,
    )

    if farm is None:
        raise NotFoundError("Farm not found.")

    return repository.update_farm(
        db=db,
        farm=farm,
        update_data=update_data,
    )


def _get_farmer_owned_farm(db: Session, user_id: uuid.UUID, farm_id: uuid.UUID):
    farmer = get_farmer_profile(db, user_id)
    if farmer is None:
        raise NotFoundError("Farmer profile not found.")

    farm = repository.get_farm_by_id_and_farmer(
        db=db,
        farm_id=farm_id,
        farmer_id=farmer.id,
    )
    if farm is None:
        raise NotFoundError("Farm not found.")
    return farm


def _serialize_farm_photo(photo: FarmPhoto) -> dict:
    return {
        "id": photo.id,
        "farm_id": photo.farm_id,
        "filename": photo.original_filename,
        "content_type": photo.content_type,
        "file_size": photo.file_size,
        "created_at": photo.created_at,
        "content_url": f"/farms/{photo.farm_id}/photos/{photo.id}/content",
    }


def get_farmer_farm_photos(
    db: Session,
    user_id: uuid.UUID,
    farm_id: uuid.UUID,
) -> list[dict]:
    _get_farmer_owned_farm(db, user_id, farm_id)
    return [
        _serialize_farm_photo(photo)
        for photo in repository.get_farm_photos(db, farm_id)
    ]


def upload_farmer_farm_photos(
    db: Session,
    user_id: uuid.UUID,
    farm_id: uuid.UUID,
    uploads: list[tuple[str | None, bytes]],
) -> list[dict]:
    if not uploads:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Select at least one farm photo.",
        )
    total_size = sum(len(content) for _, content in uploads)
    if total_size > MAX_FARM_PHOTO_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="The total upload size cannot exceed 50 MB.",
        )

    farm = _get_farmer_owned_farm(db, user_id, farm_id)
    prepared = []
    for filename, content in uploads:
        safe_filename, extension, content_type = _validate_farm_photo(
            filename,
            content,
        )
        storage_key = create_storage_key(extension)
        prepared.append(
            (
                FarmPhoto(
                    farm_id=farm.id,
                    filename=storage_key,
                    original_filename=safe_filename,
                    content_type=content_type,
                    file_size=len(content),
                ),
                content,
            )
        )

    saved_paths = []
    try:
        for photo, content in prepared:
            saved_paths.append(save_farm_photo(photo.filename, content))
        photos = repository.create_farm_photos(
            db,
            [photo for photo, _ in prepared],
        )
    except Exception:
        db.rollback()
        for path in saved_paths:
            path.unlink(missing_ok=True)
        raise

    return [_serialize_farm_photo(photo) for photo in photos]


def get_farmer_farm_photo_path(
    db: Session,
    user_id: uuid.UUID,
    farm_id: uuid.UUID,
    photo_id: uuid.UUID,
) -> tuple[str, str]:
    _get_farmer_owned_farm(db, user_id, farm_id)
    photo = repository.get_farm_photo(db, farm_id, photo_id)
    if photo is None:
        raise NotFoundError("Farm photo not found.")
    path = get_farm_photo_path(photo.filename)
    return str(path), photo.content_type


def delete_farmer_farm_photo(
    db: Session,
    user_id: uuid.UUID,
    farm_id: uuid.UUID,
    photo_id: uuid.UUID,
) -> None:
    _get_farmer_owned_farm(db, user_id, farm_id)
    photo = repository.get_farm_photo(db, farm_id, photo_id)
    if photo is None:
        raise NotFoundError("Farm photo not found.")
    storage_key = photo.filename
    repository.delete_farm_photo(db, photo)
    delete_farm_photo_file(storage_key)


# ── Admin ─────────────────────────────────────────────────────────────────────

def get_admin_farms_page(db: Session, page: int, page_size: int, search: str | None = None):
    import math
    from app.modules.farms.schema import AdminFarmListItem
    from app.common.pagination import PaginatedResponse

    rows, total = repository.list_admin_farms(db, page=page, page_size=page_size, search=search)
    total_pages = max(1, math.ceil(total / page_size)) if total else 1

    items = [
        AdminFarmListItem(
            id=farm.id,
            name=farm.name,
            address=farm.address,
            village=farm.village,
            pincode=farm.pincode,
            farmer_id=farm.farmer_id,
            farmer_name=farmer_name,
            farmer_mobile=farmer_mobile,
            total_animals=int(animal_count),
            created_at=farm.created_at,
        )
        for farm, farmer_name, farmer_mobile, animal_count in rows
    ]

    return PaginatedResponse[AdminFarmListItem](
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )
