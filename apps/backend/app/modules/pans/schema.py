# Pydantic request/response schemas for the Pans module
import uuid

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PanCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    farm_id: uuid.UUID
    name: str = Field(min_length=1, max_length=100)
    pen_number: str = Field(min_length=1, max_length=100)
    pen_type: str = Field(min_length=1, max_length=100)
    max_animal_capacity: int = Field(ge=1)
    location: str | None = None
    description: str | None = None

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Pan name cannot be blank.")
        return value

    @field_validator("pen_number", "pen_type")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank.")
        return value


class PanUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=100)
    pen_number: str | None = Field(default=None, min_length=1, max_length=100)
    pen_type: str | None = Field(default=None, min_length=1, max_length=100)
    max_animal_capacity: int | None = Field(default=None, ge=1)
    location: str | None = None
    description: str | None = None

    @field_validator("name", "pen_number", "pen_type")
    @classmethod
    def strip_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        if not value:
            raise ValueError("Pan name cannot be blank.")
        return value


class PanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    farm_id: uuid.UUID
    name: str
    pen_number: str | None = None
    pen_type: str | None = None
    max_animal_capacity: int | None = None
    location: str | None = None
    description: str | None = None


class PanListResponse(BaseModel):
    items: list[PanResponse]