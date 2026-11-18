from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.constants import AccountStatus, UserRole
from app.core.exceptions import (
    ConflictError,
    ForbiddenError,
    UnauthorizedError,
)
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)

from app.modules.auth.schema import (
    SignupRequest,
    FarmerSignupRequest,
    DoctorSignupRequest,
    SignupResponse,
    LoginRequest,
    PanelLoginRequest,
    TokenResponse,
    DoctorRegistrationStatusResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
    UserResponse,
)

from app.modules.users.model import User
from app.modules.farmers.model import FarmerProfile
from app.modules.doctors.model import DoctorProfile


def split_name(full_name: str):
    parts = full_name.strip().split()

    first_name = parts[0]
    middle_name = None
    last_name = None

    if len(parts) == 2:
        last_name = parts[1]

    elif len(parts) >= 3:
        middle_name = parts[1]
        last_name = " ".join(parts[2:])

    return first_name, middle_name, last_name


# ---------------- SIGNUP ----------------

def signup(
    db: Session,
    data: SignupRequest
) -> SignupResponse:

    # Check duplicate email or mobile number
    existing_user = db.execute(
        select(User).where(
            or_(
                User.email == str(data.email),
                User.mobile_number == data.mobile_number
            )
        )
    ).scalar_one_or_none()

    if existing_user:
        raise ConflictError(
            "Email or mobile number already registered."
        )

    first_name, middle_name, last_name = split_name(
        data.full_name
    )

    try:
        # Create user account
        user = User(
            role=UserRole(data.role),
            full_name=data.full_name,
            email=str(data.email),
            mobile_number=data.mobile_number,
            password_hash=hash_password(data.password),
            status=AccountStatus.ACTIVE,
            is_verified=isinstance(data, FarmerSignupRequest),
        )

        db.add(user)
        db.flush()

        # Farmer profile
        if isinstance(data, FarmerSignupRequest):

            farmer = FarmerProfile(
                user_id=user.id,
                first_name=first_name,
                middle_name=middle_name,
                last_name=last_name,
                village=data.village,
                pincode=data.pincode,
            )

            db.add(farmer)

        # Doctor profile
        elif isinstance(data, DoctorSignupRequest):

            doctor = DoctorProfile(
                user_id=user.id,
                first_name=first_name,
                middle_name=middle_name,
                last_name=last_name,
                qualification=data.qualification,
                specialization=data.specialization,
                registration_number=data.registration_number,
                experience_years=data.experience_years,
            )

            db.add(doctor)

        db.commit()
        db.refresh(user)

        return SignupResponse(
            message=(
                "Registration successful. You can now log in."
                if isinstance(data, FarmerSignupRequest)
                else "Registration submitted successfully. Please wait for Admin approval."
            ),
            user=UserResponse.model_validate(user)
        )

    except IntegrityError as exc:
        db.rollback()

        raise ConflictError(
            "Email, mobile number or registration number already exists."
        ) from exc

    except Exception:
        db.rollback()
        raise


# ---------------- LOGIN ----------------

def _authenticate_user(
    db: Session,
    data: LoginRequest,
    required_role: UserRole | None = None,
) -> User:

    user = db.execute(
        select(User).where(
            User.email == str(data.email)
        )
    ).scalar_one_or_none()

    # Check email and password
    if user is None or not verify_password(
        data.password,
        user.password_hash
    ):
        raise UnauthorizedError(
            "Invalid email or password."
        )

    if required_role is not None and user.role != required_role:
        raise UnauthorizedError("Invalid email or password.")

    # Check account status
    if user.status == AccountStatus.REJECTED:
        raise ForbiddenError(
            "Your Doctor registration was rejected."
        )

    if user.status == AccountStatus.INACTIVE:
        raise ForbiddenError(
            "Your account is inactive."
        )

    if user.status == AccountStatus.SUSPENDED:
        raise ForbiddenError(
            "Your account has been suspended."
        )

    # Farmers register directly; unverified Doctors must wait for Admin approval.
    if user.role != UserRole.FARMER and not user.is_verified:
        raise ForbiddenError(
            "Your registration is pending Admin approval."
        )

    return user


def _create_login_response(user: User) -> TokenResponse:
    # Generate JWT token
    access_token = create_access_token(
        user.id,
        role=user.role.value
    )

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


def login(
    db: Session,
    data: LoginRequest
) -> TokenResponse:
    return _create_login_response(_authenticate_user(db, data))


def admin_login(
    db: Session,
    data: LoginRequest,
) -> TokenResponse:
    user = _authenticate_user(db, data, required_role=UserRole.ADMIN)
    return _create_login_response(user)


def panel_login(
    db: Session,
    data: PanelLoginRequest,
) -> TokenResponse:
    if data.role == UserRole.ADMIN:
        raise UnauthorizedError("Invalid email or password.")
    user = _authenticate_user(db, data, required_role=data.role)
    return _create_login_response(user)


def get_doctor_registration_status(
    db: Session,
    data: LoginRequest,
) -> DoctorRegistrationStatusResponse:
    user = db.execute(
        select(User).where(User.email == str(data.email))
    ).scalar_one_or_none()

    if user is None or not verify_password(data.password, user.password_hash):
        raise UnauthorizedError("Invalid email or password.")

    if user.role != UserRole.DOCTOR:
        raise UnauthorizedError("Invalid email or password.")

    if user.status == AccountStatus.INACTIVE:
        message = "Your doctor account is inactive."
    elif user.status == AccountStatus.SUSPENDED:
        message = "Your doctor account has been suspended."
    elif user.status == AccountStatus.REJECTED:
        message = "Your doctor registration was rejected."
    elif not user.is_verified:
        message = "Your registration is pending Admin approval."
    else:
        message = "Your doctor registration is approved."

    return DoctorRegistrationStatusResponse(
        account_status=user.status,
        is_verified=user.is_verified,
        message=message,
    )


# ---------------- UPDATE PROFILE ----------------

def update_profile(
    db: Session,
    user: User,
    data: UpdateProfileRequest
) -> UserResponse:

    updates = data.model_dump(
        exclude_unset=True,
        exclude_none=True
    )

    if "email" in updates or "mobile_number" in updates:

        filters = []

        if "email" in updates:
            filters.append(User.email == str(updates["email"]))

        if "mobile_number" in updates:
            filters.append(
                User.mobile_number == updates["mobile_number"]
            )

        existing = db.execute(
            select(User).where(
                User.id != user.id,
                or_(*filters)
            )
        ).scalar_one_or_none()

        if existing:
            raise ConflictError(
                "Email or mobile number already exists."
            )

    for field, value in updates.items():
        setattr(user, field, value)

    try:
        db.commit()
        db.refresh(user)

    except IntegrityError as exc:
        db.rollback()
        raise ConflictError(
            "Email or mobile number already exists."
        ) from exc

    return UserResponse.model_validate(user)


# ---------------- CHANGE PASSWORD ----------------

def change_password(
    db: Session,
    user: User,
    data: ChangePasswordRequest
):

    if not verify_password(
        data.current_password,
        user.password_hash
    ):
        raise UnauthorizedError(
            "Current password is incorrect."
        )

    user.password_hash = hash_password(
        data.new_password
    )

    db.commit()