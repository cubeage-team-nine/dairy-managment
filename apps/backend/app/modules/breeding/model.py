import uuid
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import PregnancyStatus
from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class BreedingRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "breeding_records"

    animal_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("animals.id"), nullable=False
    )
    lactation_number: Mapped[int | None] = mapped_column(Integer)
    breed: Mapped[str | None] = mapped_column(String(100))
    ai_date: Mapped[date | None] = mapped_column(Date)
    pregnancy_status: Mapped[PregnancyStatus | None] = mapped_column(
        Enum(PregnancyStatus, name="pregnancy_status")
    )
    pregnancy_confirmation_date: Mapped[date | None] = mapped_column(Date)
    calving_date: Mapped[date | None] = mapped_column(Date)

    animal: Mapped["Animal"] = relationship(back_populates="breeding_records")

    __table_args__ = (Index("ix_breeding_records_animal_id", "animal_id"),)
