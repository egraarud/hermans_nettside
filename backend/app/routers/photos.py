import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query, UploadFile
from PIL import Image

from app import models
from app.dependencies import AdminUser, DbDep
from app.schemas import PhotoOut, PhotoUpdate

router = APIRouter(prefix="/photos", tags=["photos"])

UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_THUMBNAIL_WIDTH = 800


def _save_photo(file: UploadFile) -> tuple[str, str]:
    suffix = Path(file.filename or "photo.jpg").suffix.lower() or ".jpg"
    stem = uuid.uuid4().hex
    filename = stem + suffix
    thumb_filename = stem + "_thumb" + suffix

    dest = UPLOAD_DIR / filename
    thumb_dest = UPLOAD_DIR / thumb_filename

    with dest.open("wb") as f:
        f.write(file.file.read())

    with Image.open(dest) as img:
        img = img.convert("RGB")
        if img.width > MAX_THUMBNAIL_WIDTH:
            ratio = MAX_THUMBNAIL_WIDTH / img.width
            new_size = (MAX_THUMBNAIL_WIDTH, int(img.height * ratio))
            img = img.resize(new_size, Image.LANCZOS)
        img.save(thumb_dest, quality=85)

    return filename, thumb_filename


@router.get("", response_model=list[PhotoOut])
def list_photos(db: DbDep, edition_id: int | None = Query(default=None)):
    q = db.query(models.Photo).order_by(models.Photo.uploaded_at.desc())
    if edition_id:
        q = q.filter(models.Photo.edition_id == edition_id)
    return q.all()


@router.post("", response_model=PhotoOut, status_code=201)
def upload_photo(
    db: DbDep,
    _: AdminUser,
    file: UploadFile,
    edition_id: int | None = Query(default=None),
    caption: str | None = Query(default=None),
):
    filename, thumb_filename = _save_photo(file)
    photo = models.Photo(
        edition_id=edition_id,
        filename=filename,
        thumbnail_filename=thumb_filename,
        original_name=file.filename,
        caption=caption,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@router.patch("/{photo_id}", response_model=PhotoOut)
def update_photo(photo_id: int, body: PhotoUpdate, db: DbDep, _: AdminUser):
    photo = db.get(models.Photo, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Bilde ikke funnet")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(photo, field, value)
    db.commit()
    db.refresh(photo)
    return photo


@router.delete("/{photo_id}", status_code=204)
def delete_photo(photo_id: int, db: DbDep, _: AdminUser):
    photo = db.get(models.Photo, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Bilde ikke funnet")
    # Remove files from disk
    for fname in (photo.filename, photo.thumbnail_filename):
        if fname:
            p = UPLOAD_DIR / fname
            if p.exists():
                p.unlink()
    db.delete(photo)
    db.commit()
