import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class MastitisRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "mastitis_records"

    animal_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("animals.id"), nullable=False
    )
    test_date: Mapped[date] = mapped_column(Date, nullable=False)
    test_name: Mapped[str | None] = mapped_column(String(150))
    result: Mapped[str | None] = mapped_column(String(100))
    treatment: Mapped[str | None] = mapped_column(Text)
    recovery_date: Mapped[date | None] = mapped_column(Date)
    follow_up_date: Mapped[date | None] = mapped_column(Date)

    animal: Mapped["Animal"] = relationship(back_populates="mastitis_records")

    __table_args__ = (
        Index("ix_mastitis_records_animal_id", "animal_id"),
        Index("ix_mastitis_records_test_date", "test_date"),
    )
