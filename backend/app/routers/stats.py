from fastapi import APIRouter, HTTPException

from app.dependencies import DbDep
from app.schemas import EditionStats, ParticipantStats, SportStats
from app.services import stats as stats_service

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/edition/{edition_id}", response_model=EditionStats)
def edition_stats(edition_id: int, db: DbDep):
    try:
        return stats_service.get_edition_stats(db, edition_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Utgave ikke funnet")


@router.get("/sport/{sport_id}", response_model=SportStats)
def sport_stats(sport_id: int, db: DbDep):
    try:
        return stats_service.get_sport_stats(db, sport_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Idrett ikke funnet")


@router.get("/participant/{participant_id}", response_model=ParticipantStats)
def participant_stats(participant_id: int, db: DbDep):
    try:
        return stats_service.get_participant_stats(db, participant_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Deltaker ikke funnet")
