from sqlalchemy.orm import Session

from app import models
from app.schemas import (
    EditionStats,
    ParticipantEditionStats,
    ParticipantSportStat,
    ParticipantStats,
    SportHistoryEntry,
    SportStats,
)
from app.services import leaderboard as lb_service


def get_edition_stats(db: Session, edition_id: int) -> EditionStats:
    edition = db.get(models.Edition, edition_id)
    ep_count = (
        db.query(models.EditionParticipant)
        .filter(models.EditionParticipant.edition_id == edition_id)
        .count()
    )
    result_count = (
        db.query(models.Result).filter(models.Result.edition_id == edition_id).count()
    )
    match_count = (
        db.query(models.Match).filter(models.Match.edition_id == edition_id).count()
    )
    sport_ids = set(
        [r.sport_id for r in db.query(models.Result.sport_id).filter(models.Result.edition_id == edition_id)]
        + [m.sport_id for m in db.query(models.Match.sport_id).filter(models.Match.edition_id == edition_id)]
    )
    return EditionStats(
        edition_id=edition_id,
        edition_name=edition.name,
        participant_count=ep_count,
        sport_count=len(sport_ids),
        result_count=result_count,
        match_count=match_count,
    )


def get_sport_stats(db: Session, sport_id: int) -> SportStats:
    sport = db.get(models.Sport, sport_id)
    editions = db.query(models.Edition).order_by(models.Edition.year).all()
    history: list[SportHistoryEntry] = []

    for edition in editions:
        if sport.match_type == "individual":
            results = (
                db.query(models.Result)
                .filter(models.Result.edition_id == edition.id, models.Result.sport_id == sport_id)
                .all()
            )
            if not results:
                continue
            lb = lb_service.build_individual_leaderboard(results, sport, edition.id)
            winner = lb.entries[0] if lb.entries else None
            history.append(
                SportHistoryEntry(
                    year=edition.year,
                    edition_name=edition.name,
                    winner_name=winner.participant_name if winner else None,
                    best_score=winner.score if winner else None,
                )
            )
        else:
            matches = (
                db.query(models.Match)
                .filter(models.Match.edition_id == edition.id, models.Match.sport_id == sport_id)
                .all()
            )
            if not matches:
                continue
            lb = lb_service.build_head_to_head_leaderboard(matches, sport, edition.id)
            winner = lb.entries[0] if lb.entries else None
            history.append(
                SportHistoryEntry(
                    year=edition.year,
                    edition_name=edition.name,
                    winner_name=winner.participant_name if winner else None,
                    best_score=float(winner.points) if winner and winner.points is not None else None,
                )
            )

    return SportStats(sport_id=sport_id, sport_name=sport.name, history=history)


def get_participant_stats(db: Session, participant_id: int) -> ParticipantStats:
    participant = db.get(models.Participant, participant_id)
    editions = (
        db.query(models.Edition)
        .join(models.EditionParticipant)
        .filter(models.EditionParticipant.participant_id == participant_id)
        .order_by(models.Edition.year)
        .all()
    )
    sports = db.query(models.Sport).all()
    edition_stats: list[ParticipantEditionStats] = []

    for edition in editions:
        sport_stats: list[ParticipantSportStat] = []
        all_lbs = []

        for sport in sports:
            if sport.match_type == "individual":
                results = (
                    db.query(models.Result)
                    .filter(models.Result.edition_id == edition.id, models.Result.sport_id == sport.id)
                    .all()
                )
                if not results:
                    continue
                lb = lb_service.build_individual_leaderboard(results, sport, edition.id)
                all_lbs.append(lb)
                my_entry = next((e for e in lb.entries if e.participant_id == participant_id), None)
                if my_entry:
                    sport_stats.append(
                        ParticipantSportStat(
                            sport_id=sport.id,
                            sport_name=sport.name,
                            score=my_entry.score,
                            rank=my_entry.rank,
                            wins=None,
                            losses=None,
                            draws=None,
                        )
                    )
            else:
                matches = (
                    db.query(models.Match)
                    .filter(models.Match.edition_id == edition.id, models.Match.sport_id == sport.id)
                    .all()
                )
                if not matches:
                    continue
                lb = lb_service.build_head_to_head_leaderboard(matches, sport, edition.id)
                all_lbs.append(lb)
                my_entry = next((e for e in lb.entries if e.participant_id == participant_id), None)
                if my_entry:
                    sport_stats.append(
                        ParticipantSportStat(
                            sport_id=sport.id,
                            sport_name=sport.name,
                            score=None,
                            rank=my_entry.rank,
                            wins=my_entry.wins,
                            losses=my_entry.losses,
                            draws=my_entry.draws,
                        )
                    )

        # Compute overall rank
        ep_count = (
            db.query(models.EditionParticipant)
            .filter(models.EditionParticipant.edition_id == edition.id)
            .count()
        )
        overall_lb = lb_service.build_overall_leaderboard(all_lbs, edition.id, ep_count)
        my_overall = next((e for e in overall_lb.entries if e.participant_id == participant_id), None)

        edition_stats.append(
            ParticipantEditionStats(
                edition_id=edition.id,
                edition_name=edition.name,
                year=edition.year,
                sports=sport_stats,
                overall_rank=my_overall.rank if my_overall else None,
            )
        )

    return ParticipantStats(
        participant_id=participant_id,
        participant_name=participant.name,
        editions=edition_stats,
    )
