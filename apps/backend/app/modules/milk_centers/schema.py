import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MilkCenterCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=200)
    code: str | None = Field(default=None, max_length=50)
    location: str | None = Field(default=None, max_length=200)
    manager_name: str | None = Field(default=None, max_length=150)
    contact_number: str | None = Field(default=None, max_length=20)
    email: str | None = Field(default=None, max_length=255)
    daily_capacity_litres: float | None = Field(default=None, ge=0)
    is_active: bool = True

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Center name cannot be blank.")
        return v


class MilkCenterUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=200)
    code: str | None = Field(default=None, max_length=50)
    location: str | None = Field(default=None, max_length=200)
    manager_name: str | None = Field(default=None, max_length=150)
    contact_number: str | None = Field(default=None, max_length=20)
    email: str | None = Field(default=None, max_length=255)
    daily_capacity_litres: float | None = Field(default=None, ge=0)
    is_active: bool | None = None


class MilkCenterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    code: str | None
    location: str | None
    manager_name: str | None
    contact_number: str | None
    email: str | None
    daily_capacity_litres: float | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
