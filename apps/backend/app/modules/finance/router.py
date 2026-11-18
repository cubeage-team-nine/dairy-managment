import uuid

from datetime import date
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.core.constants import UserRole
from app.modules.auth.dependencies import require_roles
from app.modules.finance.expense_schema import (
    FarmExpenseCreate,
    FarmExpenseListResponse,
    FarmExpenseResponse,
    FarmExpenseUpdate,
)
from app.modules.finance.schema import FarmerMilkIncomeSummary
from app.modules.finance.milk_income_schema import MilkIncomeCreate, MilkIncomeUpdate
from app.modules.milk.schema import MilkRecordResponse
from app.modules.finance.service import (
    create_farmer_expense,
    delete_farmer_expense,
    get_farmer_milk_income_summary,
    create_farmer_milk_income,
    delete_farmer_milk_income,
    list_farmer_expenses,
    update_farmer_expense,
    update_farmer_milk_income,
)


router = APIRouter()


@router.post("/milk-income", response_model=MilkRecordResponse, status_code=status.HTTP_201_CREATED)
def create_farmer_milk_income_route(
    payload: MilkIncomeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return create_farmer_milk_income(db, current_user.id, payload.model_dump())


@router.put("/milk-income/{record_id}", response_model=MilkRecordResponse)
def update_farmer_milk_income_route(
    record_id: uuid.UUID,
    payload: MilkIncomeUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return update_farmer_milk_income(db, current_user.id, record_id, payload.model_dump(exclude_unset=True))


@router.delete("/milk-income/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farmer_milk_income_route(
    record_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    delete_farmer_milk_income(db, current_user.id, record_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/expenses", response_model=FarmExpenseListResponse)
def list_farmer_expenses_route(
    start_date: date | None = None,
    end_date: date | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return list_farmer_expenses(db, current_user.id, start_date, end_date, category)


@router.post("/expenses", response_model=FarmExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_farmer_expense_route(
    payload: FarmExpenseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return create_farmer_expense(db, current_user.id, payload.model_dump())


@router.put("/expenses/{expense_id}", response_model=FarmExpenseResponse)
def update_farmer_expense_route(
    expense_id: uuid.UUID,
    payload: FarmExpenseUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return update_farmer_expense(db, current_user.id, expense_id, payload.model_dump(exclude_unset=True))


@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farmer_expense_route(
    expense_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    delete_farmer_expense(db, current_user.id, expense_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/milk-income-summary",
    response_model=FarmerMilkIncomeSummary,
)
def get_farmer_milk_income_summary_route(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.FARMER)),
):
    return get_farmer_milk_income_summary(
        db=db,
        user_id=current_user.id,
    )
