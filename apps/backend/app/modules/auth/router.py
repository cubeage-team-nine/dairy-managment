from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.schema import (
    ChangePasswordRequest,
    LoginRequest,
    SignupRequest,
    TokenResponse,
    UpdateProfileRequest,
    UserResponse,
)
from app.modules.auth.service import change_password as change_password_service
from app.modules.auth.service import login as login_service
from app.modules.auth.service import signup as signup_service
from app.modules.auth.service import update_profile as update_profile_service
from app.modules.users.model import User

router = APIRouter()


@router.post("/signup", response_model=TokenResponse, status_code=201)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return signup_service(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return login_service(db, payload)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_me(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    return update_profile_service(db, current_user, payload)


@router.post("/change-password", status_code=204)
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    change_password_service(db, current_user, payload)


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)) -> dict[str, str]:
    # Stateless JWT: there is no server-side session to invalidate. The client is
    # responsible for discarding the token. This endpoint exists so the frontend has
    # a real call to make (and a place to hook token revocation into later, if ever needed).
    return {"detail": "Logged out successfully."}
