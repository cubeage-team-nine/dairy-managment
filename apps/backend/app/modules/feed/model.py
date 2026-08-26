import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class FeedType(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "feed_types"

    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    feed_records: Mapped[list["FeedRecord"]] = relationship(back_populates="feed_type")


class FeedRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "feed_records"

    animal_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("animals.id"), nullable=False
    )
    feed_type_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("feed_types.id"), nullable=False
    )
    quantity: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    record_date: Mapped[date] = mapped_column(Date, nullable=False)

    animal: Mapped["Animal"] = relationship(back_populates="feed_records")
    feed_type: Mapped["FeedType"] = relationship(back_populates="feed_records")

    __table_args__ = (
        Index("ix_feed_records_animal_id", "animal_id"),
        Index("ix_feed_records_feed_type_id", "feed_type_id"),
        Index("ix_feed_records_record_date", "record_date"),
    )
