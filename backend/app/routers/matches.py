from datetime import datetime, timezone
from itertools import combinations

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import or_, and_

from app import models
from app.dependencies import AdminUser, CurrentUser, DbDep
from app.schemas import MatchCreate, MatchOut, MatchUpdate

router = APIRouter(prefix="/editions/{edition_id}/matches", tags=["matches"])


@router.get("", response_model=list[MatchOut])
def list_matches(edition_id: int, db: DbDep, sport_id: int | None = Query(default=None)):
    q = db.query(models.Match).filter(models.Match.edition_id == edition_id)
    if sport_id:
        q = q.filter(models.Match.sport_id == sport_id)
    return q.all()


@router.get("/{match_id}", response_model=MatchOut)
def get_match(edition_id: int, match_id: int, db: DbDep):
    match = db.get(models.Match, match_id)
    if not match or match.edition_id != edition_id:
        raise HTTPException(status_code=404, detail="Kamp ikke funnet")
    return match


@router.post("", response_model=MatchOut, status_code=201)
def create_match(edition_id: int, body: MatchCreate, db: DbDep, current_user: CurrentUser):
    if current_user.role != "admin":
        pid = current_user.participant_id
        if pid not in (body.player_a_id, body.player_b_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Du kan kun registrere kamper du selv deltar i")

    match = models.Match(
        edition_id=edition_id,
        played_at=datetime.now(timezone.utc),
        **body.model_dump(),
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    return match


@router.patch("/{match_id}", response_model=MatchOut)
def update_match(edition_id: int, match_id: int, body: MatchUpdate, db: DbDep, current_user: CurrentUser):
    match = db.get(models.Match, match_id)
    if not match or match.edition_id != edition_id:
        raise HTTPException(status_code=404, detail="Kamp ikke funnet")

    if current_user.role != "admin":
        pid = current_user.participant_id
        if pid not in (match.player_a_id, match.player_b_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Du kan kun oppdatere kamper du selv deltar i")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(match, field, value)

    if match.played_at is None and (match.score_a is not None or match.winner_id is not None):
        match.played_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(match)
    return match


@router.post("/schedule/generate", status_code=201)
def generate_schedule(edition_id: int, db: DbDep, _: AdminUser):
    """Creates round-robin planned matches for all h2h sports in this edition."""
    edition = db.get(models.Edition, edition_id)
    if not edition:
        raise HTTPException(status_code=404, detail="Turnering ikke funnet")

    h2h_sports = (
        db.query(models.Sport)
        .filter(models.Sport.match_type == "head_to_head")
        .all()
    )

    ep = (
        db.query(models.EditionParticipant)
        .filter(models.EditionParticipant.edition_id == edition_id)
        .all()
    )
    participant_ids = [e.participant_id for e in ep]

    created = 0
    for sport in h2h_sports:
        for pid_a, pid_b in combinations(participant_ids, 2):
            existing = (
                db.query(models.Match)
                .filter(
                    models.Match.edition_id == edition_id,
                    models.Match.sport_id == sport.id,
                    or_(
                        and_(models.Match.player_a_id == pid_a, models.Match.player_b_id == pid_b),
                        and_(models.Match.player_a_id == pid_b, models.Match.player_b_id == pid_a),
                    ),
                )
                .first()
            )
            if not existing:
                db.add(models.Match(
                    edition_id=edition_id,
                    sport_id=sport.id,
                    player_a_id=pid_a,
                    player_b_id=pid_b,
                ))
                created += 1

    db.commit()
    return {"created": created}


@router.delete("/{match_id}", status_code=204)
def delete_match(edition_id: int, match_id: int, db: DbDep, _: AdminUser):
    match = db.get(models.Match, match_id)
    if not match or match.edition_id != edition_id:
        raise HTTPException(status_code=404, detail="Kamp ikke funnet")
    db.delete(match)
    db.commit()
