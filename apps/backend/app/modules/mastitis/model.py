import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Index, JSON, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, CreatedAtMixin, TimestampMixin, UUIDPrimaryKeyMixin


class MastitisRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "mastitis_records"

    animal_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("animals.id"), nullable=False
    )
    doctor_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("doctor_profiles.id"))
    test_date: Mapped[date] = mapped_column(Date, nullable=False)
    test_name: Mapped[str | None] = mapped_column(String(150))
    result: Mapped[str | None] = mapped_column(String(100))
    treatment: Mapped[str | None] = mapped_column(Text)
    recovery_date: Mapped[date | None] = mapped_column(Date)
    follow_up_date: Mapped[date | None] = mapped_column(Date)
    symptoms: Mapped[str | None] = mapped_column(Text)
    affected_quarter: Mapped[str | None] = mapped_column(String(50))
    severity: Mapped[str | None] = mapped_column(String(30))
    diagnosis: Mapped[str | None] = mapped_column(Text)
    medicine: Mapped[str | None] = mapped_column(String(255))
    dose: Mapped[str | None] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="PENDING")
    doctor_notes: Mapped[str | None] = mapped_column(Text)

    animal: Mapped["Animal"] = relationship(back_populates="mastitis_records")

    __table_args__ = (
        Index("ix_mastitis_records_animal_id", "animal_id"),
        Index("ix_mastitis_records_test_date", "test_date"),
    )


class MastitisCaseHistory(Base, UUIDPrimaryKeyMixin, CreatedAtMixin):
    __tablename__ = "mastitis_case_history"

    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("mastitis_records.id", ondelete="CASCADE"), nullable=False
    )
    doctor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("doctor_profiles.id"), nullable=False
    )
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)

    __table_args__ = (Index("ix_mastitis_case_history_case_id", "case_id"),)
