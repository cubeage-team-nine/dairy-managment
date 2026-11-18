# API routes for the Animals module
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.core.constants import UserRole
from app.modules.auth.dependencies import require_roles
from app.modules.animals.schema import (
    AdminAnimalListResponse,
    AdminAnimalOptionsResponse,
    AnimalCreate,
    AnimalListResponse,
    AnimalResponse,
    AnimalUpdate,
)
from app.modules.animals.service import (
    create_admin_animal,
    create_farmer_animal,
    delete_admin_animal,
    delete_farmer_animal,
    get_farmer_animal,
    get_farmer_animals,
    get_admin_animal_options,
    get_admin_animals,
    update_admin_animal,
    update_farmer_animal,
)
from app.modules.animals.doctor_service import list_assigned_animals, get_assigned_animal, get_assigned_animal_history


router = APIRouter()
doctor_router = APIRouter(prefix="/doctor/animals", tags=["Doctor Assigned Animals"])


@doctor_router.get("")
def list_assigned_animals_route(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    return list_assigned_animals(db, current_user.id)


@doctor_router.get("/{animal_id}/health-history")
def assigned_animal_history_route(
    animal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    return get_assigned_animal_history(db, current_user.id, animal_id)


@doctor_router.get("/{animal_id}")
def get_assigned_animal_route(
    animal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    return get_assigned_animal(db, current_user.id, animal_id)
admin_router = APIRouter(
    prefix="/admin/animals",
    tags=["Admin Animals"],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)


@admin_router.get("", response_model=AdminAnimalListResponse)
def list_admin_animals_route(db: Session = Depends(get_db)):
    return get_admin_animals(db)


@admin_router.get("/options", response_model=AdminAnimalOptionsResponse)
def get_admin_animal_options_route(db: Session = Depends(get_db)):
    return get_admin_animal_options(db)


@admin_router.post(
    "",
    response_model=AnimalResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_admin_animal_route(
    payload: AnimalCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.ADMIN)),
):
    return create_admin_animal(db, payload.model_dump())


@admin_router.put("/{animal_id}", response_model=AnimalResponse)
def update_admin_animal_route(
    animal_id: uuid.UUID,
    payload: AnimalUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.ADMIN)),
):
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one field is required for update.",
        )
    for field in ("tag_number", "animal_type", "gender", "status"):
        if field in update_data and update_data[field] is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Animal {field} cannot be null.",
            )
    return update_admin_animal(db, current_user.id, animal_id, update_data)


@admin_router.delete("/{animal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_animal_route(animal_id: uuid.UUID, db: Session = Depends(get_db)):
    delete_admin_animal(db, animal_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "",
    response_model=AnimalResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_farmer_animal_route(
    payload: AnimalCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return create_farmer_animal(
        db=db,
        user_id=current_user.id,
        animal_data=payload.model_dump(),
    )


@router.get(
    "",
    response_model=AnimalListResponse,
)
def get_farmer_animals_route(
    pan_id: uuid.UUID | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_animals(
        db=db,
        user_id=current_user.id,
        pan_id=pan_id,
    )


@router.get(
    "/{animal_id}",
    response_model=AnimalResponse,
)
def get_farmer_animal_route(
    animal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_animal(
        db=db,
        user_id=current_user.id,
        animal_id=animal_id,
    )


@router.put(
    "/{animal_id}",
    response_model=AnimalResponse,
)
def update_farmer_animal_route(
    animal_id: uuid.UUID,
    payload: AnimalUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one field is required for update.",
        )

    for field in ("tag_number", "animal_type", "gender", "status"):
        if field in update_data and update_data[field] is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Animal {field} cannot be null.",
            )

    return update_farmer_animal(
        db=db,
        user_id=current_user.id,
        animal_id=animal_id,
        update_data=update_data,
    )


@router.delete(
    "/{animal_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_farmer_animal_route(
    animal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    delete_farmer_animal(
        db=db,
        user_id=current_user.id,
        animal_id=animal_id,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
