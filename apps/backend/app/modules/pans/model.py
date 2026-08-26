import uuid

from sqlalchemy import ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Pan(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "pans"

    farm_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    farm: Mapped["Farm"] = relationship(back_populates="pans")
    animals: Mapped[list["Animal"]] = relationship(back_populates="pan")

    __table_args__ = (Index("ix_pans_farm_id", "farm_id"),)
