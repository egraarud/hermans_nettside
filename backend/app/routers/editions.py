from fastapi import APIRouter, HTTPException

from app import models
from app.dependencies import AdminUser, DbDep
from app.schemas import EditionCreate, EditionOut, EditionUpdate

router = APIRouter(prefix="/editions", tags=["editions"])


@router.get("", response_model=list[EditionOut])
def list_editions(db: DbDep):
    return db.query(models.Edition).order_by(models.Edition.year.desc()).all()


@router.post("", response_model=EditionOut, status_code=201)
def create_edition(body: EditionCreate, db: DbDep, _: AdminUser):
    existing = db.query(models.Edition).filter(models.Edition.year == body.year).first()
    if existing:
        raise HTTPException(status_code=409, detail="Det finnes allerede en utgave for dette året")
    edition = models.Edition(**body.model_dump())
    db.add(edition)
    db.commit()
    db.refresh(edition)
    return edition


@router.get("/{edition_id}", response_model=EditionOut)
def get_edition(edition_id: int, db: DbDep):
    edition = db.get(models.Edition, edition_id)
    if not edition:
        raise HTTPException(status_code=404, detail="Utgave ikke funnet")
    return edition


@router.patch("/{edition_id}", response_model=EditionOut)
def update_edition(edition_id: int, body: EditionUpdate, db: DbDep, _: AdminUser):
    edition = db.get(models.Edition, edition_id)
    if not edition:
        raise HTTPException(status_code=404, detail="Utgave ikke funnet")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(edition, field, value)
    db.commit()
    db.refresh(edition)
    return edition
