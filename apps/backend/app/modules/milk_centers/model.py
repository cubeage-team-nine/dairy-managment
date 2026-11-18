import uuid

from sqlalchemy import Boolean, ForeignKey, Index, Integer, Numeric, String, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class MilkCenter(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "milk_centers"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str | None] = mapped_column(String(50), unique=True)
    location: Mapped[str | None] = mapped_column(String(200))
    manager_name: Mapped[str | None] = mapped_column(String(150))
    contact_number: Mapped[str | None] = mapped_column(String(20))
    email: Mapped[str | None] = mapped_column(String(255))
    daily_capacity_litres: Mapped[float | None] = mapped_column(Numeric(10, 2))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    __table_args__ = (
        Index("ix_milk_centers_is_active", "is_active"),
    )
