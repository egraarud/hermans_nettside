from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routers import (
    admin_users,
    auth,
    editions,
    leaderboard,
    matches,
    participants,
    photos,
    results,
    sports,
    stats,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hermans Turnering", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"
for router in [
    auth.router,
    admin_users.router,
    editions.router,
    sports.router,
    participants.router,
    results.router,
    matches.router,
    leaderboard.router,
    stats.router,
    photos.router,
]:
    app.include_router(router, prefix=API_PREFIX)

# Serve uploaded photos
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Serve built frontend (production); only mount if dist exists
FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")
