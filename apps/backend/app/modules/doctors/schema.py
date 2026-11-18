import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.core.constants import AccountStatus


class DoctorProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    qualification: str | None = Field(default=None, max_length=255)
    specialization: str | None = Field(default=None, max_length=255)
    registration_number: str | None = Field(default=None, max_length=100)
    experience_years: int | None = Field(default=None, ge=0, le=2147483647)
    full_name: str | None = Field(default=None, max_length=150)
    email: EmailStr | None = None
    mobile_number: str | None = Field(default=None, max_length=20)
    first_name: str | None = Field(default=None, max_length=100)
    middle_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    address: str | None = Field(default=None, max_length=500)
    village: str | None = Field(default=None, max_length=150)
    district: str | None = Field(default=None, max_length=150)
    state: str | None = Field(default=None, max_length=150)
    is_available: bool | None = None

    @field_validator("qualification", "specialization", "registration_number")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip() or None


class DoctorAvailabilityUpdate(BaseModel):
    is_available: bool


class DoctorProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str | None = None
    email: str | None = None
    mobile_number: str
    first_name: str
    middle_name: str | None = None
    last_name: str | None = None
    qualification: str | None = None
    specialization: str | None = None
    registration_number: str | None = None
    experience_years: int | None = None
    account_status: AccountStatus
    is_verified: bool
    address: str | None = None
    village: str | None = None
    district: str | None = None
    state: str | None = None
    profile_photo: str | None = None
    is_available: bool = True


class FarmerApprovedDoctorResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    qualification: str | None = None
    specialization: str | None = None
    experience_years: int | None = None
    registration_number: str | None = None
    mobile_number: str | None = None
    is_available: bool = True


class AdminDoctorListItem(BaseModel):
    doctor_id: uuid.UUID
    user_id: uuid.UUID
    full_name: str | None
    email: str | None
    mobile_number: str
    first_name: str
    middle_name: str | None
    last_name: str | None
    qualification: str | None
    specialization: str | None
    registration_number: str | None
    experience_years: int | None
    account_status: AccountStatus
    is_verified: bool
    registration_state: Literal["PENDING", "APPROVED", "REJECTED"]
    is_available: bool = True
    registered_at: datetime
