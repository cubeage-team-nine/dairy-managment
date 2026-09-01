import uuid

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
