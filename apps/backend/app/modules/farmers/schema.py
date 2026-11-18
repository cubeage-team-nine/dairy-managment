import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from app.core.constants import AccountStatus


class FarmerListItem(BaseModel):
    id: uuid.UUID
    full_name: str | None
    mobile_number: str
    village: str | None
    animals_count: int
    status: AccountStatus

    model_config = {"from_attributes": True}


class FarmerFarmDetails(BaseModel):
    id: uuid.UUID
    name: str
    address: str | None
    village: str | None
    pincode: str | None
    latitude: float | None
    longitude: float | None
    created_at: datetime

    model_config = {"from_attributes": True}


class FarmerDetailResponse(FarmerListItem):
    user_id: uuid.UUID
    email: str | None
    first_name: str
    middle_name: str | None
    last_name: str | None
    pincode: str | None
    is_verified: bool
    registered_at: datetime
    farms: list[FarmerFarmDetails]


class FarmerStatusUpdate(BaseModel):
    status: Literal[
        AccountStatus.ACTIVE,
        AccountStatus.INACTIVE,
        AccountStatus.SUSPENDED,
    ]
