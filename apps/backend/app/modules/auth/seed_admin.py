from sqlalchemy import func, select

from app.core.config import settings
from app.core.constants import AccountStatus, UserRole
from app.core.security import hash_password
from app.database.session import SessionLocal
from app.modules.users.model import User


def seed_admin() -> bool:
    password = settings.ADMIN_PASSWORD
    if not password or len(password) < 8 or len(password.encode("utf-8")) > 72:
        raise ValueError(
            "Set ADMIN_PASSWORD in the backend environment (8-72 UTF-8 bytes) before seeding."
        )

    email = settings.ADMIN_EMAIL.strip().lower()
    mobile_number = settings.ADMIN_MOBILE_NUMBER.strip()
    if not mobile_number:
        raise ValueError("Set a non-empty ADMIN_MOBILE_NUMBER before seeding.")

    with SessionLocal() as db:
        existing = db.scalar(
            select(User).where(func.lower(User.email) == email)
        )
        if existing is not None:
            if existing.role != UserRole.ADMIN:
                raise ValueError(
                    "ADMIN_EMAIL already belongs to a non-admin account; no account was changed."
                )
            return False

        mobile_owner = db.scalar(
            select(User.id).where(User.mobile_number == mobile_number)
        )
        if mobile_owner is not None:
            raise ValueError(
                "ADMIN_MOBILE_NUMBER is already in use; set a unique value before seeding."
            )

        db.add(
            User(
                role=UserRole.ADMIN,
                full_name="GauVikas Administrator",
                email=email,
                mobile_number=mobile_number,
                password_hash=hash_password(password),
                is_verified=True,
                status=AccountStatus.ACTIVE,
            )
        )
        db.commit()
        return True


if __name__ == "__main__":
    created = seed_admin()
    print("Initial Admin account created." if created else "Admin account already exists; no changes made.")
