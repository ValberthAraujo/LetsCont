from collections.abc import Generator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlmodel import Session

from app.core import security
from app.core.config import settings
from app.core.db import engine
from app.models import TokenPayload, User, UserRole

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]


def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = session.get(User, token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user


def enforce_readonly_user(request: Request, session: SessionDep) -> None:
    # Allow safe methods
    if request.method in {"GET", "HEAD", "OPTIONS"}:
        return
    # Only enforce when a Bearer token is present
    auth = request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        return
    token = auth.split(" ", 1)[1]
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except Exception:
        return
    user = session.get(User, token_data.sub)
    if user and user.is_active and getattr(user, "is_readonly", False):
        raise HTTPException(
            status_code=403,
            detail="Read-only user: write operations are not allowed",
        )


def require_roles(*roles: UserRole):
    def _dep(current_user: CurrentUser) -> User:
        if current_user.is_superuser:
            return current_user
        user_roles = set(getattr(current_user, "roles", []) or [])
        if user_roles.intersection(set(roles)):
            return current_user
        raise HTTPException(status_code=403, detail="Insufficient role permissions")

    return _dep
