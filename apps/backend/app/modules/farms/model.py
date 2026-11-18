import uuid

from sqlalchemy import ForeignKey, Index, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Farm(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "farms"

    farmer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("farmer_profiles.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    address: Mapped[str | None] = mapped_column(Text)
    village: Mapped[str | None] = mapped_column(String(150))
    pincode: Mapped[str | None] = mapped_column(String(10))
    latitude: Mapped[float | None] = mapped_column(Numeric(10, 7))
    longitude: Mapped[float | None] = mapped_column(Numeric(10, 7))

    farmer: Mapped["FarmerProfile"] = relationship(back_populates="farms")
    pans: Mapped[list["Pan"]] = relationship(back_populates="farm")
    photos: Mapped[list["FarmPhoto"]] = relationship(
        back_populates="farm",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    __table_args__ = (Index("ix_farms_farmer_id", "farmer_id"),)


class FarmPhoto(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "farm_photos"

    farm_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("farms.id", ondelete="CASCADE"),
        nullable=False,
    )
    filename: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)

    farm: Mapped["Farm"] = relationship(back_populates="photos")

    __table_args__ = (Index("ix_farm_photos_farm_id", "farm_id"),)
