from datetime import date
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.core.constants import UserRole
from app.modules.auth.dependencies import require_roles
from app.modules.feed.schema import (
    FeedTypeCreate,
    FeedTypeResponse,
    FeedTypeUpdate,
    FeedRecordCreate,
    FeedRecordListResponse,
    FeedRecordResponse,
    FeedRecordUpdate,
    FeedTypeListResponse,
)
from app.modules.feed.service import (
    create_farmer_feed_record,
    delete_farmer_feed_record,
    get_farmer_feed_record,
    get_farmer_feed_records,
    get_farmer_feed_types,
    create_admin_feed_type,
    delete_admin_feed_type,
    create_admin_feed_record,
    delete_admin_feed_record,
    get_admin_feed_records,
    update_farmer_feed_record,
    update_admin_feed_record,
    update_admin_feed_type,
)


router = APIRouter()
admin_router = APIRouter(
    prefix="/admin/feed-types",
    tags=["Admin Feed Types"],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)
admin_records_router = APIRouter(
    prefix="/admin/feed/records",
    tags=["Admin Feed Records"],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)


@admin_records_router.get("", response_model=FeedRecordListResponse)
def list_admin_feed_records_route(db: Session = Depends(get_db)):
    return get_admin_feed_records(db)


@admin_records_router.post(
    "",
    response_model=FeedRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_admin_feed_record_route(
    payload: FeedRecordCreate,
    db: Session = Depends(get_db),
):
    return create_admin_feed_record(db, payload.model_dump())


@admin_records_router.put("/{record_id}", response_model=FeedRecordResponse)
def update_admin_feed_record_route(
    record_id: uuid.UUID,
    payload: FeedRecordUpdate,
    db: Session = Depends(get_db),
):
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one field is required for update.",
        )
    for field in ("animal_id", "feed_type_id", "quantity", "record_date"):
        if field in update_data and update_data[field] is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"{field} cannot be null.",
            )
    return update_admin_feed_record(db, record_id, update_data)


@admin_records_router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_feed_record_route(record_id: uuid.UUID, db: Session = Depends(get_db)):
    delete_admin_feed_record(db, record_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@admin_router.get("", response_model=FeedTypeListResponse)
def list_admin_feed_types_route(db: Session = Depends(get_db)):
    return get_farmer_feed_types(db)


@admin_router.post(
    "",
    response_model=FeedTypeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_admin_feed_type_route(
    payload: FeedTypeCreate,
    db: Session = Depends(get_db),
):
    return create_admin_feed_type(db, payload.model_dump())


@admin_router.put("/{feed_type_id}", response_model=FeedTypeResponse)
def update_admin_feed_type_route(
    feed_type_id: uuid.UUID,
    payload: FeedTypeUpdate,
    db: Session = Depends(get_db),
):
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one field is required for update.",
        )
    for field in ("name", "unit"):
        if field in update_data and update_data[field] is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"{field} cannot be null.",
            )
    return update_admin_feed_type(db, feed_type_id, update_data)


@admin_router.delete(
    "/{feed_type_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_admin_feed_type_route(
    feed_type_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    delete_admin_feed_type(db, feed_type_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/types",
    response_model=FeedTypeListResponse,
)
def get_feed_types_route(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_feed_types(db)


@router.post(
    "/records",
    response_model=FeedRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_feed_record_route(
    payload: FeedRecordCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return create_farmer_feed_record(
        db=db,
        user_id=current_user.id,
        animal_id=payload.animal_id,
        feed_type_id=payload.feed_type_id,
        quantity=payload.quantity,
        record_date=payload.record_date,
    )


@router.get(
    "/records",
    response_model=FeedRecordListResponse,
)
def get_feed_records_route(
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
    return get_farmer_feed_records(
        db=db,
        user_id=current_user.id,
        animal_id=animal_id,
        from_date=from_date,
        to_date=to_date,
    )


@router.get(
    "/records/{record_id}",
    response_model=FeedRecordResponse,
)
def get_feed_record_route(
    record_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_feed_record(db, current_user.id, record_id)


@router.put(
    "/records/{record_id}",
    response_model=FeedRecordResponse,
)
def update_feed_record_route(
    record_id: uuid.UUID,
    payload: FeedRecordUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one field is required for update.",
        )
    for field in ("animal_id", "feed_type_id", "quantity", "record_date"):
        if field in update_data and update_data[field] is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"{field} cannot be null.",
            )

    return update_farmer_feed_record(
        db=db,
        user_id=current_user.id,
        record_id=record_id,
        update_data=update_data,
    )


@router.delete(
    "/records/{record_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_feed_record_route(
    record_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    delete_farmer_feed_record(db, current_user.id, record_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)