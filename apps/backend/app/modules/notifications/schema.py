import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ReminderCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: str | None = None
    category: str = Field(default="OTHER", max_length=50)
    reminder_date: date
    animal_id: uuid.UUID | None = None


class ReminderUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = None
    category: str | None = Field(default=None, max_length=50)
    reminder_date: date | None = None
    animal_id: uuid.UUID | None = None
    status: str | None = None
    is_read: bool | None = None


class ReminderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    category: str
    reminder_date: date
    status: str
    is_read: bool
    animal_id: uuid.UUID | None
    source: str = "FARMER_REMINDER"
    animal_tag: str | None = None
    animal_name: str | None = None
    farm_name: str | None = None
    farmer_name: str | None = None
    doctor_name: str | None = None
    updated_at: datetime | None = None
