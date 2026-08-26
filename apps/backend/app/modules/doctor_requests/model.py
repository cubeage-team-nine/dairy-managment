import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import RequestStatus
from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class DoctorRequest(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "doctor_requests"

    farmer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("farmer_profiles.id"), nullable=False
    )
    doctor_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("doctor_profiles.id")
    )
    animal_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("animals.id"), nullable=False
    )
    request_description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[RequestStatus] = mapped_column(
        Enum(RequestStatus, name="request_status"), nullable=False, default=RequestStatus.PENDING
    )
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    rejected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    farmer: Mapped["FarmerProfile"] = relationship()
    doctor: Mapped["DoctorProfile | None"] = relationship()
    animal: Mapped["Animal"] = relationship()

    __table_args__ = (
        Index("ix_doctor_requests_farmer_id", "farmer_id"),
        Index("ix_doctor_requests_doctor_id", "doctor_id"),
        Index("ix_doctor_requests_animal_id", "animal_id"),
        Index("ix_doctor_requests_status", "status"),
    )
