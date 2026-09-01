from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.constants import AccountStatus, UserRole
from app.core.exceptions import ConflictError, ForbiddenError, UnauthorizedError
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.auth.schema import (
    ChangePasswordRequest,
    DoctorSignupRequest,
    FarmerSignupRequest,
    LoginRequest,
    TokenResponse,
    UpdateProfileRequest,
    UserResponse,
)
from app.modules.doctors.model import DoctorProfile
from app.modules.farmers.model import FarmerProfile
from app.modules.users.model import User

# NOTE: `data` here is typed as the SignupRequest discriminated union (FarmerSignupRequest |
# DoctorSignupRequest), which only accepts role="FARMER" or role="DOCTOR" — a request body with
# role="ADMIN" fails Pydantic validation (422) before it ever reaches this function. That is the
# backend's rejection of public ADMIN signup; there is no separate runtime branch for ADMIN below
# because the type system makes it unreachable.


def _split_name(full_name: str) -> tuple[str, str | None]:
    parts = full_name.strip().split(maxsplit=1)
    first_name = parts[0]
    last_name = parts[1] if len(parts) > 1 else None
    return first_name, last_name


def signup(db: Session, data: FarmerSignupRequest | DoctorSignupRequest) -> TokenResponse:
    existing = db.execute(
        select(User).where((User.email == data.email) | (User.mobile_number == data.mobile_number))
    ).scalar_one_or_none()
    if existing is not None:
        raise ConflictError("A user with this email or mobile number already exists.")

    first_name, last_name = _split_name(data.full_name)

    try:
        user = User(
            role=UserRole(data.role),
            full_name=data.full_name,
            email=data.email,
            mobile_number=data.mobile_number,
            password_hash=hash_password(data.password),
            is_verified=False,
        )
        db.add(user)
        db.flush()

        if isinstance(data, FarmerSignupRequest):
            db.add(
                FarmerProfile(
                    user_id=user.id,
                    first_name=first_name,
                    last_name=last_name,
                    village=data.village,
                    pincode=data.pincode,
                )
            )
        else:
            db.add(
                DoctorProfile(
                    user_id=user.id,
                    first_name=first_name,
                    last_name=last_name,
                    qualification=data.qualification,
                    specialization=data.specialization,
                    registration_number=data.registration_number,
                    experience_years=data.experience_years,
                )
            )

        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("A user with this email, mobile number, or registration number already exists.") from exc
    except Exception:
        db.rollback()
        raise

    db.refresh(user)
    token = create_access_token(user.id, role=user.role.value)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


def update_profile(db: Session, user: User, data: UpdateProfileRequest) -> UserResponse:
    updates = data.model_dump(exclude_unset=True, exclude_none=True)

    if "email" in updates or "mobile_number" in updates:
        conflict_filters = []
        if "email" in updates:
            conflict_filters.append(User.email == updates["email"])
        if "mobile_number" in updates:
            conflict_filters.append(User.mobile_number == updates["mobile_number"])

        existing = db.execute(
            select(User).where(User.id != user.id, or_(*conflict_filters))
        ).scalar_one_or_none()
        if existing is not None:
            raise ConflictError("A user with this email or mobile number already exists.")

    for field, value in updates.items():
        setattr(user, field, value)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("A user with this email or mobile number already exists.") from exc

    db.refresh(user)
    return UserResponse.model_validate(user)


def change_password(db: Session, user: User, data: ChangePasswordRequest) -> None:
    if not verify_password(data.current_password, user.password_hash):
        raise UnauthorizedError("Current password is incorrect.")

    user.password_hash = hash_password(data.new_password)
    db.commit()


def login(db: Session, data: LoginRequest) -> TokenResponse:
    user = db.execute(select(User).where(User.email == data.email)).scalar_one_or_none()
    if user is None or not verify_password(data.password, user.password_hash):
        raise UnauthorizedError("Invalid email or password.")

    if user.status == AccountStatus.INACTIVE:
        raise ForbiddenError("This account is inactive. Please contact support.")
    if user.status == AccountStatus.SUSPENDED:
        raise ForbiddenError("This account has been suspended. Please contact support.")

    token = create_access_token(user.id, role=user.role.value)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))
