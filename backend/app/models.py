from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Edition(Base):
    __tablename__ = "editions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    year: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    start_date: Mapped[str | None] = mapped_column(String(10))
    end_date: Mapped[str | None] = mapped_column(String(10))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    participants: Mapped[list["EditionParticipant"]] = relationship(back_populates="edition", cascade="all, delete-orphan")
    results: Mapped[list["Result"]] = relationship(back_populates="edition", cascade="all, delete-orphan")
    matches: Mapped[list["Match"]] = relationship(back_populates="edition", cascade="all, delete-orphan")
    photos: Mapped[list["Photo"]] = relationship(back_populates="edition")


class Sport(Base):
    __tablename__ = "sports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    match_type: Mapped[str] = mapped_column(String(20), nullable=False)  # "individual" | "head_to_head"
    scoring_type: Mapped[str] = mapped_column(String(20), nullable=False)  # "points" | "wins" | "time" | "strokes"
    lower_is_better: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    results: Mapped[list["Result"]] = relationship(back_populates="sport")
    matches: Mapped[list["Match"]] = relationship(back_populates="sport")


class Participant(Base):
    __tablename__ = "participants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    nickname: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    editions: Mapped[list["EditionParticipant"]] = relationship(back_populates="participant")
    results: Mapped[list["Result"]] = relationship(back_populates="participant")
    user: Mapped["User | None"] = relationship(back_populates="participant", uselist=False)


class EditionParticipant(Base):
    __tablename__ = "edition_participants"
    __table_args__ = (UniqueConstraint("edition_id", "participant_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    edition_id: Mapped[int] = mapped_column(ForeignKey("editions.id"), nullable=False)
    participant_id: Mapped[int] = mapped_column(ForeignKey("participants.id"), nullable=False)

    edition: Mapped["Edition"] = relationship(back_populates="participants")
    participant: Mapped["Participant"] = relationship(back_populates="editions")


class Result(Base):
    __tablename__ = "results"
    __table_args__ = (UniqueConstraint("edition_id", "sport_id", "participant_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    edition_id: Mapped[int] = mapped_column(ForeignKey("editions.id"), nullable=False)
    sport_id: Mapped[int] = mapped_column(ForeignKey("sports.id"), nullable=False)
    participant_id: Mapped[int] = mapped_column(ForeignKey("participants.id"), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    edition: Mapped["Edition"] = relationship(back_populates="results")
    sport: Mapped["Sport"] = relationship(back_populates="results")
    participant: Mapped["Participant"] = relationship(back_populates="results")


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    edition_id: Mapped[int] = mapped_column(ForeignKey("editions.id"), nullable=False)
    sport_id: Mapped[int] = mapped_column(ForeignKey("sports.id"), nullable=False)
    player_a_id: Mapped[int] = mapped_column(ForeignKey("participants.id"), nullable=False)
    player_b_id: Mapped[int] = mapped_column(ForeignKey("participants.id"), nullable=False)
    score_a: Mapped[str | None] = mapped_column(String(100))
    score_b: Mapped[str | None] = mapped_column(String(100))
    winner_id: Mapped[int | None] = mapped_column(ForeignKey("participants.id"))
    played_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text)

    edition: Mapped["Edition"] = relationship(back_populates="matches")
    sport: Mapped["Sport"] = relationship(back_populates="matches")
    player_a: Mapped["Participant"] = relationship(foreign_keys=[player_a_id])
    player_b: Mapped["Participant"] = relationship(foreign_keys=[player_b_id])
    winner: Mapped["Participant | None"] = relationship(foreign_keys=[winner_id])


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    participant_id: Mapped[int | None] = mapped_column(ForeignKey("participants.id"), unique=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # "admin" | "participant"
    must_change_password: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    participant: Mapped["Participant | None"] = relationship(back_populates="user")


class Photo(Base):
    __tablename__ = "photos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    edition_id: Mapped[int | None] = mapped_column(ForeignKey("editions.id"))
    filename: Mapped[str] = mapped_column(String(200), nullable=False)
    thumbnail_filename: Mapped[str | None] = mapped_column(String(200))
    original_name: Mapped[str | None] = mapped_column(String(200))
    caption: Mapped[str | None] = mapped_column(Text)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    edition: Mapped["Edition | None"] = relationship(back_populates="photos")
