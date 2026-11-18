import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class MastitisRecordCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    animal_id: uuid.UUID
    test_date: date
    test_name: str | None = Field(default=None, max_length=150)
    result: str | None = Field(default=None, max_length=100)
    treatment: str | None = None
    recovery_date: date | None = None
    follow_up_date: date | None = None
    symptoms: str | None = None
    affected_quarter: str | None = Field(default=None, max_length=50)
    severity: Literal["LOW", "MEDIUM", "HIGH", "EMERGENCY"] | None = None
    diagnosis: str | None = None
    medicine: str | None = Field(default=None, max_length=255)
    dose: str | None = Field(default=None, max_length=100)
    status: Literal["PENDING", "UNDER TREATMENT", "MONITORING", "RECOVERED"] = "PENDING"
    doctor_notes: str | None = None


class MastitisRecordUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    test_date: date | None = None
    test_name: str | None = Field(default=None, max_length=150)
    result: str | None = Field(default=None, max_length=100)
    treatment: str | None = None
    recovery_date: date | None = None
    follow_up_date: date | None = None
    symptoms: str | None = None
    affected_quarter: str | None = Field(default=None, max_length=50)
    severity: Literal["LOW", "MEDIUM", "HIGH", "EMERGENCY"] | None = None
    diagnosis: str | None = None
    medicine: str | None = Field(default=None, max_length=255)
    dose: str | None = Field(default=None, max_length=100)
    status: Literal["PENDING", "UNDER TREATMENT", "MONITORING", "RECOVERED"] | None = None
    doctor_notes: str | None = None


class MastitisRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    animal_id: uuid.UUID
    animal_tag: str
    test_date: date
    test_name: str | None = None
    result: str | None = None
    treatment: str | None = None
    recovery_date: date | None = None
    follow_up_date: date | None = None
    doctor_id: uuid.UUID | None = None
    symptoms: str | None = None
    affected_quarter: str | None = None
    severity: str | None = None
    diagnosis: str | None = None
    medicine: str | None = None
    dose: str | None = None
    status: str = "PENDING"
    doctor_notes: str | None = None
    animal_name: str | None = None
    animal_type: str | None = None
    breed: str | None = None
    farmer_name: str | None = None
    farm_name: str | None = None
    village: str | None = None
    created_at: datetime | None = None


class MastitisRecordListResponse(BaseModel):
    items: list[MastitisRecordResponse]
