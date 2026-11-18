from datetime import date

from pydantic import BaseModel


class FarmerMilkIncomeSummary(BaseModel):
    total_milk_value: float
    current_month_milk_value: float
    month_start: date
    as_of: date