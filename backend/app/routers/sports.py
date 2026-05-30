from fastapi import APIRouter, HTTPException

from app import models
from app.dependencies import AdminUser, DbDep
from app.schemas import SportCreate, SportOut, SportUpdate

router = APIRouter(prefix="/sports", tags=["sports"])


@router.get("", response_model=list[SportOut])
def list_sports(db: DbDep):
    return db.query(models.Sport).order_by(models.Sport.name).all()


@router.post("", response_model=SportOut, status_code=201)
def create_sport(body: SportCreate, db: DbDep, _: AdminUser):
    if body.match_type not in ("individual", "head_to_head"):
        raise HTTPException(status_code=422, detail="match_type må være 'individual' eller 'head_to_head'")
    existing = db.query(models.Sport).filter(models.Sport.slug == body.slug).first()
    if existing:
        raise HTTPException(status_code=409, detail="En idrett med denne slug-en finnes allerede")
    sport = models.Sport(**body.model_dump())
    db.add(sport)
    db.commit()
    db.refresh(sport)
    return sport


@router.get("/{sport_id}", response_model=SportOut)
def get_sport(sport_id: int, db: DbDep):
    sport = db.get(models.Sport, sport_id)
    if not sport:
        raise HTTPException(status_code=404, detail="Idrett ikke funnet")
    return sport


@router.patch("/{sport_id}", response_model=SportOut)
def update_sport(sport_id: int, body: SportUpdate, db: DbDep, _: AdminUser):
    sport = db.get(models.Sport, sport_id)
    if not sport:
        raise HTTPException(status_code=404, detail="Idrett ikke funnet")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(sport, field, value)
    db.commit()
    db.refresh(sport)
    return sport
