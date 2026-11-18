import uuid
from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class FarmerHealthRecordCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    animal_id: uuid.UUID
    disease: str | None = Field(default=None, max_length=255)
    medicine: str | None = Field(default=None, max_length=255)
    dose: str | None = Field(default=None, max_length=100)
    treatment: str | None = None
    doctor_recommendation: str | None = None
    treatment_duration: str | None = Field(default=None, max_length=100)
    symptoms: str | None = None
    doctor_notes: str | None = None
    follow_up_date: date | None = None
    health_status: str | None = Field(default=None, max_length=50)
    visit_date: date


class FarmerHealthRecordUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    disease: str | None = Field(default=None, max_length=255)
    medicine: str | None = Field(default=None, max_length=255)
    dose: str | None = Field(default=None, max_length=100)
    treatment: str | None = None
    doctor_recommendation: str | None = None
    treatment_duration: str | None = Field(default=None, max_length=100)
    symptoms: str | None = None
    doctor_notes: str | None = None
    follow_up_date: date | None = None
    health_status: str | None = Field(default=None, max_length=50)
    visit_date: date | None = None


class FarmerHealthRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    animal_id: uuid.UUID
    animal_tag: str
    doctor_id: uuid.UUID | None = None
    doctor_name: str | None = None
    disease: str | None = None
    medicine: str | None = None
    dose: str | None = None
    treatment: str | None = None
    doctor_recommendation: str | None = None
    visit_date: date
    treatment_start_date: date | None = None
    treatment_duration: str | None = None
    symptoms: str | None = None
    doctor_notes: str | None = None
    follow_up_date: date | None = None
    health_status: str | None = None


class FarmerHealthRecordListResponse(BaseModel):
    items: list[FarmerHealthRecordResponse]
