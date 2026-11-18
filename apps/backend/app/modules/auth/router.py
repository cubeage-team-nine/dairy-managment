from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.common.dependencies import get_db

from app.modules.auth.dependencies import get_current_user

from app.modules.auth.schema import (
    SignupRequest,
    SignupResponse,
    LoginRequest,
    PanelLoginRequest,
    DoctorRegistrationStatusResponse,
    TokenResponse,
    UserResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
)

from app.modules.auth.service import (
    signup,
    login,
    admin_login,
    panel_login,
    get_doctor_registration_status,
    update_profile,
    change_password,
)

from app.modules.users.model import User


router = APIRouter()


# ---------------- SIGNUP ----------------

@router.post(
    "/signup",
    response_model=SignupResponse,
    status_code=201
)
def signup_route(
    payload: SignupRequest,
    db: Session = Depends(get_db)
):
    return signup(db, payload)


# ---------------- LOGIN ----------------

@router.post(
    "/login",
    response_model=TokenResponse
)
def login_route(
    payload: LoginRequest,
    db: Session = Depends(get_db)
):
    return login(db, payload)


@router.post(
    "/admin/login",
    response_model=TokenResponse,
)
def admin_login_route(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    return admin_login(db, payload)


@router.post(
    "/panel-login",
    response_model=TokenResponse,
)
def panel_login_route(
    payload: PanelLoginRequest,
    db: Session = Depends(get_db),
):
    return panel_login(db, payload)


@router.post(
    "/doctor-registration-status",
    response_model=DoctorRegistrationStatusResponse,
)
def doctor_registration_status_route(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    return get_doctor_registration_status(db, payload)


# ---------------- GET LOGGED-IN USER ----------------

@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user


# ---------------- UPDATE PROFILE ----------------

@router.patch(
    "/me",
    response_model=UserResponse
)
def update_me(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_profile(db, current_user, payload)


# ---------------- CHANGE PASSWORD ----------------

@router.post(
    "/change-password",
    status_code=204
)
def change_password_route(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    change_password(db, current_user, payload)


# ---------------- LOGOUT ----------------

@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_user)
):
    return {
        "detail": "Logged out successfully."
    }