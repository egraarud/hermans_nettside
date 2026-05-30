from fastapi import APIRouter, HTTPException

from app import models
from app.dependencies import AdminUser, DbDep
from app.schemas import EditionParticipantAdd, ParticipantCreate, ParticipantOut, ParticipantUpdate

router = APIRouter(tags=["participants"])


@router.get("/participants", response_model=list[ParticipantOut])
def list_participants(db: DbDep):
    return db.query(models.Participant).order_by(models.Participant.name).all()


@router.post("/participants", response_model=ParticipantOut, status_code=201)
def create_participant(body: ParticipantCreate, db: DbDep, _: AdminUser):
    p = models.Participant(**body.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.get("/participants/{participant_id}", response_model=ParticipantOut)
def get_participant(participant_id: int, db: DbDep):
    p = db.get(models.Participant, participant_id)
    if not p:
        raise HTTPException(status_code=404, detail="Deltaker ikke funnet")
    return p


@router.patch("/participants/{participant_id}", response_model=ParticipantOut)
def update_participant(participant_id: int, body: ParticipantUpdate, db: DbDep, _: AdminUser):
    p = db.get(models.Participant, participant_id)
    if not p:
        raise HTTPException(status_code=404, detail="Deltaker ikke funnet")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(p, field, value)
    db.commit()
    db.refresh(p)
    return p


@router.get("/editions/{edition_id}/participants", response_model=list[ParticipantOut])
def list_edition_participants(edition_id: int, db: DbDep):
    eps = (
        db.query(models.EditionParticipant)
        .filter(models.EditionParticipant.edition_id == edition_id)
        .all()
    )
    return [ep.participant for ep in eps]


@router.post("/editions/{edition_id}/participants", status_code=201)
def add_edition_participant(edition_id: int, body: EditionParticipantAdd, db: DbDep, _: AdminUser):
    edition = db.get(models.Edition, edition_id)
    if not edition:
        raise HTTPException(status_code=404, detail="Utgave ikke funnet")
    existing = (
        db.query(models.EditionParticipant)
        .filter(
            models.EditionParticipant.edition_id == edition_id,
            models.EditionParticipant.participant_id == body.participant_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Deltaker er allerede påmeldt denne utgaven")
    ep = models.EditionParticipant(edition_id=edition_id, participant_id=body.participant_id)
    db.add(ep)
    db.commit()
    return {"ok": True}


@router.delete("/editions/{edition_id}/participants/{participant_id}", status_code=204)
def remove_edition_participant(edition_id: int, participant_id: int, db: DbDep, _: AdminUser):
    ep = (
        db.query(models.EditionParticipant)
        .filter(
            models.EditionParticipant.edition_id == edition_id,
            models.EditionParticipant.participant_id == participant_id,
        )
        .first()
    )
    if not ep:
        raise HTTPException(status_code=404, detail="Deltaker ikke funnet i denne utgaven")
    db.delete(ep)
    db.commit()
