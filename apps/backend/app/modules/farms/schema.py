# Pydantic request/response schemas for the Farms module

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FarmCreate(BaseModel):
    """
    Fields a farmer may use to create a farm.
    Ownership is always assigned from the authenticated user's profile.
    """

    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=150)
    address: str | None = None
    village: str | None = Field(default=None, max_length=150)
    pincode: str | None = Field(default=None, max_length=10)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Farm name cannot be blank.")
        return value


class FarmUpdate(BaseModel):
    """
    Fields that a farmer is allowed to update.
    Only existing Farm model fields are accepted.
    """

    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=150)
    address: str | None = None
    village: str | None = Field(default=None, max_length=150)
    pincode: str | None = Field(default=None, max_length=10)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        if not value:
            raise ValueError("Farm name cannot be blank.")
        return value


class FarmResponse(BaseModel):
    """
    Farm details returned by the API.
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    address: str | None = None
    village: str | None = None
    pincode: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class FarmListResponse(BaseModel):
    """
    Response containing farmer details and their farms.
    """

    farmer_name: str
    items: list[FarmResponse]


class FarmPhotoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    farm_id: uuid.UUID
    filename: str
    content_type: str
    file_size: int
    created_at: datetime
    content_url: str


class AdminFarmListItem(BaseModel):
    """Flat farm record returned by the admin list endpoint."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    address: str | None = None
    village: str | None = None
    pincode: str | None = None
    farmer_id: uuid.UUID
    farmer_name: str | None = None
    farmer_mobile: str | None = None
    total_animals: int
    created_at: datetime
