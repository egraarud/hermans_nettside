from typing import Annotated

import jwt
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app import models
from app.config import settings
from app.database import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbDep = Annotated[Session, Depends(get_db)]


def _decode_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ugyldig token")


def require_admin_token(authorization: str = Header(default="")):
    """Accepts the env-var bootstrap admin token."""
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or token != settings.admin_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ikke autorisert")


def require_bootstrap_or_admin(
    db: DbDep,
    authorization: str = Header(default=""),
) -> models.User | None:
    """Accepts either the env-var ADMIN_TOKEN (bootstrap) or a JWT with role=admin."""
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ikke autorisert")
    # Bootstrap token
    if token == settings.admin_token:
        return None  # No user object for bootstrap access
    # JWT admin
    payload = _decode_jwt(token)
    user = db.get(models.User, int(payload.get("sub", 0)))
    if not user or user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Krever admin-rolle")
    return user


BootstrapOrAdmin = Annotated[models.User | None, Depends(require_bootstrap_or_admin)]


def get_current_user(
    db: DbDep,
    authorization: str = Header(default=""),
) -> models.User:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Innlogging kreves")
    payload = _decode_jwt(token)
    user_id = payload.get("sub")
    user = db.get(models.User, int(user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bruker ikke funnet")
    return user


CurrentUser = Annotated[models.User, Depends(get_current_user)]


def require_admin_role(current_user: CurrentUser) -> models.User:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Krever admin-rolle")
    return current_user


AdminUser = Annotated[models.User, Depends(require_admin_role)]


def optional_user(
    db: DbDep,
    authorization: str = Header(default=""),
) -> models.User | None:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None
    try:
        payload = _decode_jwt(token)
        user_id = payload.get("sub")
        return db.get(models.User, int(user_id))
    except HTTPException:
        return None


OptionalUser = Annotated[models.User | None, Depends(optional_user)]
