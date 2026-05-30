from dataclasses import dataclass, field

from app import models
from app.schemas import LeaderboardEntry, LeaderboardOut


@dataclass
class _IndividualRow:
    participant_id: int
    participant_name: str
    score: float


@dataclass
class _MatchRow:
    participant_id: int
    participant_name: str
    wins: int = 0
    draws: int = 0
    losses: int = 0

    @property
    def points(self) -> int:
        return self.wins * 3 + self.draws


def build_individual_leaderboard(
    results: list[models.Result],
    sport: models.Sport,
    edition_id: int,
) -> LeaderboardOut:
    rows = [
        _IndividualRow(
            participant_id=r.participant_id,
            participant_name=r.participant.name,
            score=r.score,
        )
        for r in results
    ]
    rows.sort(key=lambda r: r.score, reverse=not sport.lower_is_better)

    entries: list[LeaderboardEntry] = []
    rank = 1
    for i, row in enumerate(rows):
        if i > 0 and rows[i].score != rows[i - 1].score:
            rank = i + 1
        entries.append(
            LeaderboardEntry(
                rank=rank,
                participant_id=row.participant_id,
                participant_name=row.participant_name,
                score=row.score,
            )
        )

    return LeaderboardOut(
        edition_id=edition_id,
        sport_id=sport.id,
        sport_name=sport.name,
        match_type="individual",
        entries=entries,
    )


def build_head_to_head_leaderboard(
    matches: list[models.Match],
    sport: models.Sport,
    edition_id: int,
) -> LeaderboardOut:
    standings: dict[int, _MatchRow] = {}

    def ensure(participant_id: int, name: str) -> _MatchRow:
        if participant_id not in standings:
            standings[participant_id] = _MatchRow(participant_id=participant_id, participant_name=name)
        return standings[participant_id]

    for m in matches:
        row_a = ensure(m.player_a_id, m.player_a.name)
        row_b = ensure(m.player_b_id, m.player_b.name)

        if m.winner_id is None:
            row_a.draws += 1
            row_b.draws += 1
        elif m.winner_id == m.player_a_id:
            row_a.wins += 1
            row_b.losses += 1
        else:
            row_b.wins += 1
            row_a.losses += 1

    rows = sorted(standings.values(), key=lambda r: (r.points, r.wins), reverse=True)

    entries: list[LeaderboardEntry] = []
    rank = 1
    for i, row in enumerate(rows):
        if i > 0 and (rows[i].points, rows[i].wins) != (rows[i - 1].points, rows[i - 1].wins):
            rank = i + 1
        entries.append(
            LeaderboardEntry(
                rank=rank,
                participant_id=row.participant_id,
                participant_name=row.participant_name,
                wins=row.wins,
                draws=row.draws,
                losses=row.losses,
                points=row.points,
            )
        )

    return LeaderboardOut(
        edition_id=edition_id,
        sport_id=sport.id,
        sport_name=sport.name,
        match_type="head_to_head",
        entries=entries,
    )


def build_overall_leaderboard(
    sport_leaderboards: list[LeaderboardOut],
    edition_id: int,
    participant_count: int,
) -> LeaderboardOut:
    """Sum points across sports: rank 1 = participant_count pts, rank 2 = n-1, etc."""
    total: dict[int, float] = {}
    names: dict[int, str] = {}

    for lb in sport_leaderboards:
        n = participant_count
        for entry in lb.entries:
            names[entry.participant_id] = entry.participant_name
            pts = max(0, n - entry.rank + 1)
            total[entry.participant_id] = total.get(entry.participant_id, 0) + pts

    rows = sorted(total.items(), key=lambda kv: kv[1], reverse=True)
    entries: list[LeaderboardEntry] = []
    rank = 1
    for i, (pid, pts) in enumerate(rows):
        if i > 0 and pts != rows[i - 1][1]:
            rank = i + 1
        entries.append(
            LeaderboardEntry(
                rank=rank,
                participant_id=pid,
                participant_name=names[pid],
                total_points=pts,
            )
        )

    return LeaderboardOut(
        edition_id=edition_id,
        sport_id=None,
        sport_name=None,
        match_type="overall",
        entries=entries,
    )
