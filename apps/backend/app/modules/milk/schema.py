import uuid
from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class MilkRecordCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    farm_id: uuid.UUID
    animal_id: uuid.UUID | None = None
    record_date: date = Field(default_factory=date.today)
    morning_quantity: float | None = Field(default=None, ge=0, le=99999999.99)
    evening_quantity: float | None = Field(default=None, ge=0, le=99999999.99)
    fat: float | None = Field(default=None, ge=0, le=100)
    snf: float | None = Field(default=None, ge=0, le=100)
    milk_rate: float | None = Field(default=None, ge=0, le=99999999.99)
    milk_session: Literal["Morning", "Evening"] | None = None
    customer_name: str | None = Field(default=None, max_length=150)
    description: str | None = None


class MilkRecordUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    animal_id: uuid.UUID | None = None
    record_date: date | None = None
    morning_quantity: float | None = Field(default=None, ge=0, le=99999999.99)
    evening_quantity: float | None = Field(default=None, ge=0, le=99999999.99)
    fat: float | None = Field(default=None, ge=0, le=100)
    snf: float | None = Field(default=None, ge=0, le=100)
    milk_rate: float | None = Field(default=None, ge=0, le=99999999.99)
    milk_session: Literal["Morning", "Evening"] | None = None
    customer_name: str | None = Field(default=None, max_length=150)
    description: str | None = None


class MilkRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    farm_id: uuid.UUID
    animal_id: uuid.UUID | None = None
    record_date: date
    morning_quantity: float | None = None
    evening_quantity: float | None = None
    total_quantity: float | None = None
    fat: float | None = None
    snf: float | None = None
    milk_rate: float | None = None
    milk_value: float | None = None
    milk_session: str | None = None
    customer_name: str | None = None
    description: str | None = None


class MilkRecordListResponse(BaseModel):
    items: list[MilkRecordResponse]
