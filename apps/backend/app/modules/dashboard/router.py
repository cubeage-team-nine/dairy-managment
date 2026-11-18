
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.core.constants import UserRole
from app.modules.auth.dependencies import require_roles
from app.modules.dashboard.schema import (
    AdminDashboardResponse,
    DoctorDashboardResponse,
    FarmerDashboardResponse,
)
from app.modules.dashboard.service import (
    get_admin_dashboard,
    get_doctor_dashboard,
    get_farmer_dashboard,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)
admin_router = APIRouter(tags=["Admin Dashboard"])
doctor_router = APIRouter(
    prefix="/doctor/dashboard",
    tags=["Doctor Dashboard"],
)


@router.get(
    "/farmer",
    response_model=FarmerDashboardResponse,
)
def farmer_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_dashboard(
        db=db,
        user_id=current_user.id,
    )


@admin_router.get(
    "/admin/dashboard",
    response_model=AdminDashboardResponse,
)
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.ADMIN)),
):
    return get_admin_dashboard(db=db)


@doctor_router.get(
    "",
    response_model=DoctorDashboardResponse,
)
def doctor_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.DOCTOR)),
):
    return get_doctor_dashboard(db=db, user_id=current_user.id)
