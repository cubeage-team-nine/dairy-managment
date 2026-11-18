import uuid
from datetime import date

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FeedTypeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    unit: str
    description: str | None = Field(default=None, max_length=2000)


class FeedTypeListResponse(BaseModel):
    items: list[FeedTypeResponse]


class FeedTypeCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=100)
    unit: str = Field(min_length=1, max_length=20)
    description: str | None = Field(default=None, max_length=2000)

    @field_validator("name", "unit")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank.")
        return value

    @field_validator("description")
    @classmethod
    def strip_description(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class FeedTypeUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=100)
    unit: str | None = Field(default=None, min_length=1, max_length=20)
    description: str | None = None

    @field_validator("name", "unit")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank.")
        return value

    @field_validator("description")
    @classmethod
    def strip_description(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class FeedRecordCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    animal_id: uuid.UUID
    feed_type_id: uuid.UUID
    quantity: float = Field(gt=0, le=99999999.99)
    record_date: date = Field(default_factory=date.today)


class FeedRecordUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    animal_id: uuid.UUID | None = None
    feed_type_id: uuid.UUID | None = None
    quantity: float | None = Field(default=None, gt=0, le=99999999.99)
    record_date: date | None = None


class FeedRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    animal_id: uuid.UUID
    animal_tag: str
    feed_type_id: uuid.UUID
    feed_type_name: str
    quantity: float
    unit: str
    record_date: date
    farm_name: str | None = None
    farmer_name: str | None = None


class FeedRecordListResponse(BaseModel):
    items: list[FeedRecordResponse]