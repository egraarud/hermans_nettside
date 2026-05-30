from fastapi import APIRouter, HTTPException, status

from app import models
from app.dependencies import BootstrapOrAdmin, DbDep
from app.routers.auth import hash_password
from app.schemas import UserCreate, UserOut, UserUpdate
from app.services.email import send_provisional_password
from app.services.password_gen import generate_passphrase

router = APIRouter(prefix="/admin/users", tags=["admin-users"])


@router.get("", response_model=list[UserOut])
def list_users(db: DbDep, _: BootstrapOrAdmin):
    return db.query(models.User).all()


@router.post("", response_model=UserOut, status_code=201)
def create_user(body: UserCreate, db: DbDep, _: BootstrapOrAdmin):
    existing = db.query(models.User).filter(models.User.username == body.username).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Brukernavn er allerede i bruk")

    if body.role not in ("admin", "participant"):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Rolle må være 'admin' eller 'participant'")

    password = generate_passphrase()
    user = models.User(
        username=body.username,
        email=body.email,
        hashed_password=hash_password(password),
        role=body.role,
        participant_id=body.participant_id,
        must_change_password=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    try:
        send_provisional_password(body.email, body.username, password)
    except Exception:
        pass

    return user


@router.patch("/{user_id}", response_model=UserOut)
def update_user(user_id: int, body: UserUpdate, db: DbDep, _: BootstrapOrAdmin):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Bruker ikke funnet")
    if body.email is not None:
        user.email = body.email
    if body.role is not None:
        user.role = body.role
    if body.participant_id is not None:
        user.participant_id = body.participant_id
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/reset-password", response_model=dict)
def reset_password(user_id: int, db: DbDep, _: BootstrapOrAdmin):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Bruker ikke funnet")
    password = generate_passphrase()
    user.hashed_password = hash_password(password)
    user.must_change_password = True
    db.commit()
    try:
        send_provisional_password(user.email, user.username, password)
    except Exception:
        pass
    return {"message": "Passord tilbakestilt og sendt på e-post"}


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: DbDep, _: BootstrapOrAdmin):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Bruker ikke funnet")
    db.delete(user)
    db.commit()
