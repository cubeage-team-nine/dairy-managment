from datetime import date
from typing import Any

from pydantic import BaseModel


class AdminReportResponse(BaseModel):
    report_type: str
    items: list[dict[str, Any]]
    totals: dict[str, int | float]
    from_date: date | None = None
    to_date: date | None = None
