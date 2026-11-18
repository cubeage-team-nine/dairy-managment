import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class FarmExpense(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "farm_expenses"

    farmer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("farmer_profiles.id"), nullable=False
    )
    animal_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("animals.id")
    )
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    expense_date: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    payment_method: Mapped[str | None] = mapped_column(String(50))

    farmer = relationship("FarmerProfile")
    animal = relationship("Animal")

    __table_args__ = (
        Index("ix_farm_expenses_farmer_id", "farmer_id"),
        Index("ix_farm_expenses_expense_date", "expense_date"),
        Index("ix_farm_expenses_category", "category"),
    )
