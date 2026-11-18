import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from typing import Literal

from app.core.constants import RequestStatus


class FarmerDoctorRequestCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    animal_id: uuid.UUID
    doctor_id: uuid.UUID | None = None
    selection_mode: Literal["MANUAL", "AUTO"] = "MANUAL"
    priority: Literal["LOW", "MEDIUM", "HIGH", "EMERGENCY"] = "MEDIUM"
    request_description: str = Field(min_length=1, max_length=10000)

    @field_validator("request_description")
    @classmethod
    def strip_description(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Request description cannot be blank.")
        return value

    @model_validator(mode="after")
    def validate_doctor_selection(self):
        if self.selection_mode == "MANUAL" and self.doctor_id is None:
            raise ValueError("Select a doctor for manual requests.")
        if self.selection_mode == "AUTO" and self.doctor_id is not None:
            raise ValueError("Automatic requests cannot specify a doctor.")
        return self


class FarmerDoctorRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    animal_id: uuid.UUID
    animal_tag: str
    request_description: str | None = None
    status: RequestStatus
    requested_at: datetime
    accepted_at: datetime | None = None
    rejected_at: datetime | None = None
    doctor_id: uuid.UUID | None = None
    selection_mode: Literal["MANUAL", "AUTO"] = "MANUAL"
    doctor_name: str | None = None
    doctor_specialization: str | None = None
    doctor_experience_years: int | None = None
    doctor_is_available: bool | None = None
    priority: str = "MEDIUM"


class FarmerDoctorRequestListResponse(BaseModel):
    items: list[FarmerDoctorRequestResponse]
