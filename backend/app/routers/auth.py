from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import APIRouter, HTTPException, status

from app import models
from app.config import settings
from app.dependencies import CurrentUser, DbDep
from app.schemas import ChangePasswordRequest, LoginRequest, TokenResponse, UserMe

router = APIRouter(prefix="/auth", tags=["auth"])


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    return jwt.encode({"sub": str(user_id), "exp": expire}, settings.jwt_secret, algorithm="HS256")


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: DbDep):
    user = db.query(models.User).filter(models.User.username == req.username).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Feil brukernavn eller passord")
    return TokenResponse(access_token=create_token(user.id))


@router.get("/me", response_model=UserMe)
def me(current_user: CurrentUser):
    participant_name = None
    if current_user.participant:
        participant_name = current_user.participant.name
    return UserMe(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role,
        must_change_password=current_user.must_change_password,
        participant_id=current_user.participant_id,
        participant_name=participant_name,
    )


@router.post("/change-password", status_code=204)
def change_password(req: ChangePasswordRequest, current_user: CurrentUser, db: DbDep):
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Feil nåværende passord")
    current_user.hashed_password = hash_password(req.new_password)
    current_user.must_change_password = False
    db.commit()
