from sqlalchemy import Boolean, Enum, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import AccountStatus, UserRole
from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(150))
    mobile_number: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    status: Mapped[AccountStatus] = mapped_column(
        Enum(AccountStatus, name="account_status"), nullable=False, default=AccountStatus.ACTIVE
    )

    farmer_profile: Mapped["FarmerProfile | None"] = relationship(
        back_populates="user", uselist=False
    )
    doctor_profile: Mapped["DoctorProfile | None"] = relationship(
        back_populates="user", uselist=False
    )

    __table_args__ = (
        Index("ix_users_role", "role"),
        Index("ix_users_status", "status"),
    )
