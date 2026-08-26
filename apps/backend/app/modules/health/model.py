import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class HealthRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "health_records"

    animal_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("animals.id"), nullable=False
    )
    doctor_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("doctor_profiles.id")
    )
    disease: Mapped[str | None] = mapped_column(String(255))
    medicine: Mapped[str | None] = mapped_column(String(255))
    dose: Mapped[str | None] = mapped_column(String(100))
    treatment: Mapped[str | None] = mapped_column(Text)
    doctor_recommendation: Mapped[str | None] = mapped_column(Text)
    visit_date: Mapped[date] = mapped_column(Date, nullable=False)

    animal: Mapped["Animal"] = relationship(back_populates="health_records")
    doctor: Mapped["DoctorProfile | None"] = relationship()

    __table_args__ = (
        Index("ix_health_records_animal_id", "animal_id"),
        Index("ix_health_records_doctor_id", "doctor_id"),
        Index("ix_health_records_visit_date", "visit_date"),
    )
