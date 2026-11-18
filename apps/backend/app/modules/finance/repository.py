from datetime import date

from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.modules.farms.model import Farm
from app.modules.animals.model import Animal
from app.modules.finance.model import FarmExpense
from app.modules.milk.model import MilkRecord


def get_milk_value_totals(db: Session, farmer_id, month_start: date, as_of: date):
    total_value, current_month_value = (
        db.query(
            func.coalesce(func.sum(MilkRecord.milk_value), 0),
            func.coalesce(
                func.sum(
                    case(
                        (
                            MilkRecord.record_date >= month_start,
                            MilkRecord.milk_value,
                        ),
                        else_=0,
                    )
                ),
                0,
            ),
        )
        .join(Farm, MilkRecord.farm_id == Farm.id)
        .filter(
            Farm.farmer_id == farmer_id,
            MilkRecord.record_date <= as_of,
        )
        .one()
    )
    return float(total_value or 0), float(current_month_value or 0)


def _expense_query(db: Session, farmer_id):
    return (
        db.query(FarmExpense, Animal.tag_number)
        .outerjoin(Animal, FarmExpense.animal_id == Animal.id)
        .filter(FarmExpense.farmer_id == farmer_id)
    )


def list_expenses(db: Session, farmer_id, start_date=None, end_date=None, category=None):
    query = _expense_query(db, farmer_id)
    if start_date is not None:
        query = query.filter(FarmExpense.expense_date >= start_date)
    if end_date is not None:
        query = query.filter(FarmExpense.expense_date <= end_date)
    if category:
        query = query.filter(FarmExpense.category == category)
    return query.order_by(FarmExpense.expense_date.desc(), FarmExpense.created_at.desc()).all()


def get_expense(db: Session, farmer_id, expense_id):
    return _expense_query(db, farmer_id).filter(FarmExpense.id == expense_id).first()


def create_expense(db: Session, farmer_id, data):
    expense = FarmExpense(farmer_id=farmer_id, **data)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    row = _expense_query(db, farmer_id).filter(FarmExpense.id == expense.id).first()
    return row


def save_expense(db: Session, expense, farmer_id):
    db.commit()
    db.refresh(expense)
    return _expense_query(db, farmer_id).filter(FarmExpense.id == expense.id).first()


def delete_expense(db: Session, expense):
    db.delete(expense)
    db.commit()
