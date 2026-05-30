from fastapi import APIRouter, HTTPException, Query

from app import models
from app.dependencies import DbDep
from app.schemas import LeaderboardOut
from app.services import leaderboard as lb_service

router = APIRouter(tags=["leaderboard"])


@router.get("/editions/{edition_id}/leaderboard", response_model=LeaderboardOut)
def get_leaderboard(edition_id: int, db: DbDep, sport_id: int | None = Query(default=None)):
    edition = db.get(models.Edition, edition_id)
    if not edition:
        raise HTTPException(status_code=404, detail="Utgave ikke funnet")

    if sport_id:
        sport = db.get(models.Sport, sport_id)
        if not sport:
            raise HTTPException(status_code=404, detail="Idrett ikke funnet")
        if sport.match_type == "individual":
            results = (
                db.query(models.Result)
                .filter(models.Result.edition_id == edition_id, models.Result.sport_id == sport_id)
                .all()
            )
            return lb_service.build_individual_leaderboard(results, sport, edition_id)
        else:
            matches = (
                db.query(models.Match)
                .filter(models.Match.edition_id == edition_id, models.Match.sport_id == sport_id)
                .all()
            )
            return lb_service.build_head_to_head_leaderboard(matches, sport, edition_id)

    # Overall leaderboard
    sports = db.query(models.Sport).all()
    ep_count = (
        db.query(models.EditionParticipant)
        .filter(models.EditionParticipant.edition_id == edition_id)
        .count()
    )
    all_lbs = []
    for sport in sports:
        if sport.match_type == "individual":
            results = (
                db.query(models.Result)
                .filter(models.Result.edition_id == edition_id, models.Result.sport_id == sport.id)
                .all()
            )
            if results:
                all_lbs.append(lb_service.build_individual_leaderboard(results, sport, edition_id))
        else:
            matches = (
                db.query(models.Match)
                .filter(models.Match.edition_id == edition_id, models.Match.sport_id == sport.id)
                .all()
            )
            if matches:
                all_lbs.append(lb_service.build_head_to_head_leaderboard(matches, sport, edition_id))

    return lb_service.build_overall_leaderboard(all_lbs, edition_id, ep_count)


@router.get("/leaderboard/alltime", response_model=list[LeaderboardOut])
def get_alltime_leaderboard(db: DbDep):
    editions = db.query(models.Edition).order_by(models.Edition.year).all()
    result = []
    for edition in editions:
        sports = db.query(models.Sport).all()
        ep_count = (
            db.query(models.EditionParticipant)
            .filter(models.EditionParticipant.edition_id == edition.id)
            .count()
        )
        all_lbs = []
        for sport in sports:
            if sport.match_type == "individual":
                results = (
                    db.query(models.Result)
                    .filter(models.Result.edition_id == edition.id, models.Result.sport_id == sport.id)
                    .all()
                )
                if results:
                    all_lbs.append(lb_service.build_individual_leaderboard(results, sport, edition.id))
            else:
                matches = (
                    db.query(models.Match)
                    .filter(models.Match.edition_id == edition.id, models.Match.sport_id == sport.id)
                    .all()
                )
                if matches:
                    all_lbs.append(lb_service.build_head_to_head_leaderboard(matches, sport, edition.id))
        result.append(lb_service.build_overall_leaderboard(all_lbs, edition.id, ep_count))
    return result
