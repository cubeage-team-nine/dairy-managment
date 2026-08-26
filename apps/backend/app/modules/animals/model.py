import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import AnimalStatus, Gender
from app.database.base import Base, CreatedAtMixin, TimestampMixin, UUIDPrimaryKeyMixin


class Animal(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "animals"

    pan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("pans.id"), nullable=False)
    tag_number: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    animal_type: Mapped[str] = mapped_column(String(50), nullable=False)
    breed: Mapped[str | None] = mapped_column(String(100))
    date_of_birth: Mapped[date | None] = mapped_column(Date)
    gender: Mapped[Gender] = mapped_column(Enum(Gender, name="gender"), nullable=False)
    weight: Mapped[float | None] = mapped_column(Numeric(8, 2))
    status: Mapped[AnimalStatus] = mapped_column(
        Enum(AnimalStatus, name="animal_status"), nullable=False, default=AnimalStatus.ACTIVE
    )

    pan: Mapped["Pan"] = relationship(back_populates="animals")
    pan_history: Mapped[list["AnimalPanHistory"]] = relationship(
        back_populates="animal", foreign_keys="AnimalPanHistory.animal_id"
    )
    lifecycle_history: Mapped[list["AnimalLifecycleHistory"]] = relationship(back_populates="animal")
    breeding_records: Mapped[list["BreedingRecord"]] = relationship(back_populates="animal")
    milk_records: Mapped[list["MilkRecord"]] = relationship(back_populates="animal")
    feed_records: Mapped[list["FeedRecord"]] = relationship(back_populates="animal")
    health_records: Mapped[list["HealthRecord"]] = relationship(back_populates="animal")
    mastitis_records: Mapped[list["MastitisRecord"]] = relationship(back_populates="animal")

    __table_args__ = (
        Index("ix_animals_pan_id", "pan_id"),
        Index("ix_animals_status", "status"),
    )


class AnimalPanHistory(Base, UUIDPrimaryKeyMixin, CreatedAtMixin):
    __tablename__ = "animal_pan_history"

    animal_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("animals.id"), nullable=False
    )
    from_pan_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("pans.id"))
    to_pan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("pans.id"), nullable=False
    )
    moved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    reason: Mapped[str | None] = mapped_column(String(255))

    animal: Mapped["Animal"] = relationship(back_populates="pan_history", foreign_keys=[animal_id])

    __table_args__ = (
        Index("ix_animal_pan_history_animal_id", "animal_id"),
        Index("ix_animal_pan_history_moved_at", "moved_at"),
    )


class AnimalLifecycleHistory(Base, UUIDPrimaryKeyMixin, CreatedAtMixin):
    __tablename__ = "animal_lifecycle_history"

    animal_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("animals.id"), nullable=False
    )
    previous_status: Mapped[AnimalStatus | None] = mapped_column(Enum(AnimalStatus, name="animal_status"))
    new_status: Mapped[AnimalStatus] = mapped_column(Enum(AnimalStatus, name="animal_status"), nullable=False)
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    reason: Mapped[str | None] = mapped_column(Text)
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    animal: Mapped["Animal"] = relationship(back_populates="lifecycle_history")

    __table_args__ = (
        Index("ix_animal_lifecycle_history_animal_id", "animal_id"),
        Index("ix_animal_lifecycle_history_changed_at", "changed_at"),
    )
