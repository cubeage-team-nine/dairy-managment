from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.core.constants import UserRole
from app.modules.auth.dependencies import require_roles
from app.modules.reports.schema import AdminReportResponse
from app.modules.reports.service import get_admin_report


router = APIRouter(
    prefix="/admin/reports",
    tags=["Admin Reports"],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)


@router.get("", response_model=AdminReportResponse)
def get_admin_report_route(
    report_type: Literal[
        "animals", "milk", "feed", "health", "breeding", "mastitis", "finance"
    ],
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
):
    if from_date is not None and to_date is not None and from_date > to_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="from_date must be on or before to_date.",
        )
    return get_admin_report(db, report_type, from_date, to_date)
