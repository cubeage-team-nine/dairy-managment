import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Index, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class MilkRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "milk_records"

    animal_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("animals.id"))
    farm_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    record_date: Mapped[date] = mapped_column(Date, nullable=False)
    morning_quantity: Mapped[float | None] = mapped_column(Numeric(10, 2))
    evening_quantity: Mapped[float | None] = mapped_column(Numeric(10, 2))
    total_quantity: Mapped[float | None] = mapped_column(Numeric(10, 2))
    fat: Mapped[float | None] = mapped_column(Numeric(5, 2))
    snf: Mapped[float | None] = mapped_column(Numeric(5, 2))
    milk_rate: Mapped[float | None] = mapped_column(Numeric(10, 2))
    milk_value: Mapped[float | None] = mapped_column(Numeric(12, 2))

    animal: Mapped["Animal | None"] = relationship(back_populates="milk_records")
    farm: Mapped["Farm"] = relationship()

    __table_args__ = (
        Index("ix_milk_records_animal_id", "animal_id"),
        Index("ix_milk_records_farm_id", "farm_id"),
        Index("ix_milk_records_record_date", "record_date"),
    )
