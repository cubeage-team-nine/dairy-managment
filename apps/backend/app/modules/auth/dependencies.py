import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.core.config import settings
from app.core.constants import AccountStatus, UserRole
from app.core.security import decode_token

from app.modules.users.model import User


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)

        if payload.get("type") != "access":
            raise credentials_exception

        user_id = uuid.UUID(payload.get("sub"))

    except (ValueError, TypeError) as exc:
        raise credentials_exception from exc

    user = db.get(User, user_id)

    if user is None:
        raise credentials_exception

    if user.status == AccountStatus.REJECTED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your Doctor registration was rejected.",
        )

    if user.status != AccountStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is not active."
        )

    if user.role != UserRole.FARMER and not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your registration is pending Admin approval."
        )

    return user


def require_roles(*roles):

    def role_checker(
        current_user: User = Depends(get_current_user)
    ):

        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission."
            )

        return current_user

    return role_checker