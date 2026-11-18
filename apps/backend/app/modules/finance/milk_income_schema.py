from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class MilkIncomeCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    quantity: float = Field(gt=0, le=99999999.99)
    milk_rate: float = Field(gt=0, le=99999999.99)
    record_date: date
    milk_session: Literal["Morning", "Evening"]
    customer_name: str | None = Field(default=None, max_length=150)
    description: str | None = None

    @field_validator("customer_name")
    @classmethod
    def clean_customer_name(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class MilkIncomeUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    quantity: float | None = Field(default=None, gt=0, le=99999999.99)
    milk_rate: float | None = Field(default=None, gt=0, le=99999999.99)
    record_date: date | None = None
    milk_session: Literal["Morning", "Evening"] | None = None
    customer_name: str | None = Field(default=None, max_length=150)
    description: str | None = None

    @field_validator("customer_name")
    @classmethod
    def clean_customer_name(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None

    @model_validator(mode="after")
    def require_some_field(self):
        if not self.model_fields_set:
            raise ValueError("At least one income field is required.")
        for field in ("quantity", "milk_rate", "record_date", "milk_session"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field.replace('_', ' ').capitalize()} cannot be empty.")
        return self
