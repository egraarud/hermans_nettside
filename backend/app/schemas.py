from datetime import datetime

from pydantic import BaseModel, EmailStr


# ── Editions ──────────────────────────────────────────────────────────────────

class EditionBase(BaseModel):
    year: int
    name: str
    start_date: str | None = None
    end_date: str | None = None


class EditionCreate(EditionBase):
    pass


class EditionUpdate(BaseModel):
    name: str | None = None
    start_date: str | None = None
    end_date: str | None = None


class EditionOut(EditionBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Sports ────────────────────────────────────────────────────────────────────

class SportBase(BaseModel):
    slug: str
    name: str
    description: str | None = None
    match_type: str  # "individual" | "head_to_head"
    scoring_type: str  # "points" | "wins" | "time" | "strokes"
    lower_is_better: bool = False


class SportCreate(SportBase):
    pass


class SportUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    scoring_type: str | None = None
    lower_is_better: bool | None = None


class SportOut(SportBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Participants ──────────────────────────────────────────────────────────────

class ParticipantBase(BaseModel):
    name: str
    nickname: str | None = None


class ParticipantCreate(ParticipantBase):
    pass


class ParticipantUpdate(BaseModel):
    name: str | None = None
    nickname: str | None = None


class ParticipantOut(ParticipantBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class EditionParticipantAdd(BaseModel):
    participant_id: int


# ── Results ───────────────────────────────────────────────────────────────────

class ResultCreate(BaseModel):
    sport_id: int
    participant_id: int
    score: float
    notes: str | None = None


class ResultOut(BaseModel):
    id: int
    edition_id: int
    sport_id: int
    participant_id: int
    score: float
    notes: str | None
    recorded_at: datetime

    model_config = {"from_attributes": True}


# ── Matches ───────────────────────────────────────────────────────────────────

class MatchCreate(BaseModel):
    sport_id: int
    player_a_id: int
    player_b_id: int
    score_a: str | None = None
    score_b: str | None = None
    winner_id: int | None = None
    notes: str | None = None


class MatchUpdate(BaseModel):
    score_a: str | None = None
    score_b: str | None = None
    winner_id: int | None = None
    notes: str | None = None


class MatchOut(BaseModel):
    id: int
    edition_id: int
    sport_id: int
    player_a_id: int
    player_b_id: int
    score_a: str | None
    score_b: str | None
    winner_id: int | None
    played_at: datetime | None
    notes: str | None

    model_config = {"from_attributes": True}


# ── Users ─────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    email: str
    role: str  # "admin" | "participant"
    participant_id: int | None = None


class UserUpdate(BaseModel):
    email: str | None = None
    role: str | None = None
    participant_id: int | None = None


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    participant_id: int | None
    must_change_password: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserMe(BaseModel):
    id: int
    username: str
    email: str
    role: str
    must_change_password: bool
    participant_id: int | None
    participant_name: str | None = None

    model_config = {"from_attributes": True}


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# ── Photos ────────────────────────────────────────────────────────────────────

class PhotoUpdate(BaseModel):
    caption: str | None = None
    edition_id: int | None = None


class PhotoOut(BaseModel):
    id: int
    edition_id: int | None
    filename: str
    thumbnail_filename: str | None
    original_name: str | None
    caption: str | None
    uploaded_at: datetime

    model_config = {"from_attributes": True}


# ── Leaderboard ───────────────────────────────────────────────────────────────

class LeaderboardEntry(BaseModel):
    rank: int
    participant_id: int
    participant_name: str
    score: float | None = None
    wins: int | None = None
    draws: int | None = None
    losses: int | None = None
    points: int | None = None  # W/D/L points for head_to_head
    total_points: float | None = None  # overall leaderboard points


class LeaderboardOut(BaseModel):
    edition_id: int
    sport_id: int | None
    sport_name: str | None
    match_type: str | None  # "individual" | "head_to_head" | "overall"
    entries: list[LeaderboardEntry]


# ── Stats ─────────────────────────────────────────────────────────────────────

class EditionStats(BaseModel):
    edition_id: int
    edition_name: str
    participant_count: int
    sport_count: int
    result_count: int
    match_count: int


class SportHistoryEntry(BaseModel):
    year: int
    edition_name: str
    winner_name: str | None
    best_score: float | None


class SportStats(BaseModel):
    sport_id: int
    sport_name: str
    history: list[SportHistoryEntry]


class ParticipantSportStat(BaseModel):
    sport_id: int
    sport_name: str
    score: float | None
    rank: int | None
    wins: int | None
    losses: int | None
    draws: int | None


class ParticipantEditionStats(BaseModel):
    edition_id: int
    edition_name: str
    year: int
    sports: list[ParticipantSportStat]
    overall_rank: int | None


class ParticipantStats(BaseModel):
    participant_id: int
    participant_name: str
    editions: list[ParticipantEditionStats]
