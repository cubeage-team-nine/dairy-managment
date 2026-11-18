import uuid
from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Notification(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Farmer-created reminder owned by one authenticated user."""

    __tablename__ = "notifications"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    animal_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("animals.id", ondelete="SET NULL"))
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(50), nullable=False, default="OTHER")
    reminder_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="PENDING")
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    animal: Mapped["Animal | None"] = relationship()

    __table_args__ = (Index("ix_notifications_user_date", "user_id", "reminder_date"),)
