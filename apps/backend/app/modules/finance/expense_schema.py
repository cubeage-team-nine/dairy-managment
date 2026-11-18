import uuid
from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


ExpenseCategory = Literal[
    "Animal Feed",
    "Medicines",
    "Veterinary Services",
    "Animal Purchase",
    "Equipment",
    "Transportation",
    "Farm Maintenance",
    "Other",
    # Preserve updates for older saved expense rows until their category is edited.
    "Medicine",
    "Other Expenses",
]


class FarmExpenseCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=150)
    category: ExpenseCategory
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    expense_date: date
    animal_id: uuid.UUID | None = None
    description: str | None = None
    payment_method: str | None = Field(default=None, max_length=50)

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Expense title cannot be blank.")
        return value


class FarmExpenseUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=1, max_length=150)
    category: ExpenseCategory | None = None
    amount: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    expense_date: date | None = None
    animal_id: uuid.UUID | None = None
    description: str | None = None
    payment_method: str | None = Field(default=None, max_length=50)

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Expense title cannot be blank.")
        return value

    @model_validator(mode="after")
    def require_some_field(self):
        if not self.model_fields_set:
            raise ValueError("At least one expense field is required.")
        for field in ("title", "category", "amount", "expense_date"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field.replace('_', ' ').capitalize()} cannot be empty.")
        return self


class FarmExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    category: str
    amount: Decimal
    expense_date: date
    animal_id: uuid.UUID | None = None
    animal_tag: str | None = None
    description: str | None = None
    payment_method: str | None = None


class FarmExpenseListResponse(BaseModel):
    items: list[FarmExpenseResponse]
