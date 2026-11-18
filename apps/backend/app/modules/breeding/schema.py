import uuid
from datetime import date

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import PregnancyStatus


class BreedingRecordCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    animal_id: uuid.UUID
    lactation_number: int | None = Field(default=None, ge=1)
    breed: str | None = Field(default=None, max_length=100)
    ai_date: date | None = None
    pregnancy_status: PregnancyStatus | None = None
    pregnancy_confirmation_date: date | None = None
    calving_date: date | None = None


class BreedingRecordUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    lactation_number: int | None = Field(default=None, ge=1)
    breed: str | None = Field(default=None, max_length=100)
    ai_date: date | None = None
    pregnancy_status: PregnancyStatus | None = None
    pregnancy_confirmation_date: date | None = None
    calving_date: date | None = None


class BreedingRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    animal_id: uuid.UUID
    animal_tag: str
    lactation_number: int | None = None
    breed: str | None = None
    ai_date: date | None = None
    pregnancy_status: PregnancyStatus | None = None
    pregnancy_confirmation_date: date | None = None
    calving_date: date | None = None


class BreedingRecordListResponse(BaseModel):
    items: list[BreedingRecordResponse]