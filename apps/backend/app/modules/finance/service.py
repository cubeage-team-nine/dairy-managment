import uuid
from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.modules.dashboard.repository import get_farmer_profile
from app.modules.animals.repository import get_animal_by_id_and_farmer
from app.modules.farms import repository as farms_repository
from app.modules.finance import repository
from app.modules.milk import repository as milk_repository
from app.modules.milk.service import create_farmer_milk_record


def get_farmer_milk_income_summary(db: Session, user_id: uuid.UUID):
    farmer = get_farmer_profile(db, user_id)
    if farmer is None:
        raise NotFoundError("Farmer profile not found.")

    as_of = date.today()
    month_start = as_of.replace(day=1)
    total_value, month_value = repository.get_milk_value_totals(
        db=db,
        farmer_id=farmer.id,
        month_start=month_start,
        as_of=as_of,
    )
    return {
        "total_milk_value": total_value,
        "current_month_milk_value": month_value,
        "month_start": month_start,
        "as_of": as_of,
    }


def _get_farmer(db: Session, user_id: uuid.UUID):
    farmer = get_farmer_profile(db, user_id)
    if farmer is None:
        raise NotFoundError("Farmer profile not found.")
    return farmer


def _expense_item(row):
    if row is None:
        return None
    expense, animal_tag = row
    return {
        "id": expense.id,
        "title": expense.title,
        "category": expense.category,
        "amount": expense.amount,
        "expense_date": expense.expense_date,
        "animal_id": expense.animal_id,
        "animal_tag": animal_tag,
        "description": expense.description,
        "payment_method": expense.payment_method,
    }


def list_farmer_expenses(db: Session, user_id: uuid.UUID, start_date=None, end_date=None, category=None):
    farmer = _get_farmer(db, user_id)
    rows = repository.list_expenses(db, farmer.id, start_date, end_date, category)
    return {"items": [_expense_item(row) for row in rows]}


def create_farmer_expense(db: Session, user_id: uuid.UUID, data: dict):
    farmer = _get_farmer(db, user_id)
    animal_id = data.get("animal_id")
    if animal_id is not None and get_animal_by_id_and_farmer(db, animal_id, farmer.id) is None:
        raise NotFoundError("Animal not found.")
    return _expense_item(repository.create_expense(db, farmer.id, data))


def update_farmer_expense(db: Session, user_id: uuid.UUID, expense_id: uuid.UUID, data: dict):
    farmer = _get_farmer(db, user_id)
    row = repository.get_expense(db, farmer.id, expense_id)
    if row is None:
        raise NotFoundError("Expense not found.")
    expense, _ = row
    if "animal_id" in data and data["animal_id"] is not None:
        if get_animal_by_id_and_farmer(db, data["animal_id"], farmer.id) is None:
            raise NotFoundError("Animal not found.")
    for field, value in data.items():
        setattr(expense, field, value)
    return _expense_item(repository.save_expense(db, expense, farmer.id))


def delete_farmer_expense(db: Session, user_id: uuid.UUID, expense_id: uuid.UUID):
    farmer = _get_farmer(db, user_id)
    row = repository.get_expense(db, farmer.id, expense_id)
    if row is None:
        raise NotFoundError("Expense not found.")
    repository.delete_expense(db, row[0])


def _manual_income_record(db: Session, user_id: uuid.UUID, record_id: uuid.UUID):
    farmer = _get_farmer(db, user_id)
    record = milk_repository.get_milk_record_by_id_and_farmer(db, record_id, farmer.id)
    if record is None or record.milk_session not in ("Morning", "Evening"):
        raise NotFoundError("Manual milk income record not found.")
    return farmer, record


def create_farmer_milk_income(db: Session, user_id: uuid.UUID, data: dict):
    farmer = _get_farmer(db, user_id)
    farms = farms_repository.get_farms_by_farmer(db, farmer.id)
    if not farms:
        raise NotFoundError("Create a farm before adding milk income.")
    quantity = data["quantity"]
    session = data["milk_session"]
    record_data = {
        "farm_id": farms[0].id,
        "animal_id": None,
        "record_date": data["record_date"],
        "morning_quantity": quantity if session == "Morning" else None,
        "evening_quantity": quantity if session == "Evening" else None,
        "milk_rate": data["milk_rate"],
        "milk_session": session,
        "customer_name": data.get("customer_name"),
        "description": data.get("description"),
    }
    return create_farmer_milk_record(db, user_id, record_data)


def update_farmer_milk_income(db: Session, user_id: uuid.UUID, record_id: uuid.UUID, data: dict):
    _, record = _manual_income_record(db, user_id, record_id)
    quantity = data.get("quantity", record.total_quantity)
    session = data.get("milk_session", record.milk_session)
    rate = data.get("milk_rate", record.milk_rate)
    update_data = {
        "morning_quantity": quantity if session == "Morning" else None,
        "evening_quantity": quantity if session == "Evening" else None,
        "total_quantity": Decimal(str(quantity)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
        "milk_rate": Decimal(str(rate)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
        "milk_value": (Decimal(str(quantity)) * Decimal(str(rate))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
        "milk_session": session,
    }
    for field in ("record_date", "customer_name", "description"):
        if field in data:
            update_data[field] = data[field]
    return milk_repository.update_milk_record(db, record, update_data)


def delete_farmer_milk_income(db: Session, user_id: uuid.UUID, record_id: uuid.UUID):
    _, record = _manual_income_record(db, user_id, record_id)
    milk_repository.delete_milk_record(db, record)
