# Pydantic request/response schemas for the Animals module
import uuid
from datetime import date

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.constants import AnimalStatus, Gender


class AnimalCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    pan_id: uuid.UUID
    tag_number: str = Field(min_length=1, max_length=100)
    animal_type: str = Field(min_length=1, max_length=50)
    breed: str | None = Field(default=None, max_length=100)
    date_of_birth: date | None = None
    gender: Gender
    weight: float | None = Field(default=None, ge=0, le=999999.99)
    status: AnimalStatus = AnimalStatus.ACTIVE

    @field_validator("tag_number", "animal_type")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank.")
        return value

    @field_validator("breed")
    @classmethod
    def strip_breed(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class AnimalUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    tag_number: str | None = Field(default=None, min_length=1, max_length=100)
    animal_type: str | None = Field(default=None, min_length=1, max_length=50)
    breed: str | None = Field(default=None, max_length=100)
    date_of_birth: date | None = None
    gender: Gender | None = None
    weight: float | None = Field(default=None, ge=0, le=999999.99)
    status: AnimalStatus | None = None

    @field_validator("tag_number", "animal_type")
    @classmethod
    def strip_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank.")
        return value

    @field_validator("breed")
    @classmethod
    def strip_breed(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class AnimalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    pan_id: uuid.UUID
    tag_number: str
    animal_type: str
    breed: str | None = None
    date_of_birth: date | None = None
    gender: Gender
    weight: float | None = None
    status: AnimalStatus


class AnimalListResponse(BaseModel):
    items: list[AnimalResponse]


class AdminAnimalResponse(AnimalResponse):
    farm_id: uuid.UUID
    farm_name: str
    pan_name: str
    farmer_name: str


class AdminAnimalListResponse(BaseModel):
    items: list[AdminAnimalResponse]


class AdminFarmOption(BaseModel):
    id: uuid.UUID
    name: str
    farmer_name: str


class AdminPanOption(BaseModel):
    id: uuid.UUID
    farm_id: uuid.UUID
    name: str
    pen_number: str | None = None
    max_animal_capacity: int | None = None


class AdminAnimalOptionsResponse(BaseModel):
    farms: list[AdminFarmOption]
    pans: list[AdminPanOption]