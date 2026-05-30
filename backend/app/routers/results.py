from fastapi import APIRouter, HTTPException, Query, status

from app import models
from app.dependencies import AdminUser, CurrentUser, DbDep
from app.schemas import ResultCreate, ResultOut

router = APIRouter(prefix="/editions/{edition_id}/results", tags=["results"])


@router.get("", response_model=list[ResultOut])
def list_results(edition_id: int, db: DbDep, sport_id: int | None = Query(default=None)):
    q = db.query(models.Result).filter(models.Result.edition_id == edition_id)
    if sport_id:
        q = q.filter(models.Result.sport_id == sport_id)
    return q.all()


@router.post("", response_model=ResultOut, status_code=201)
def upsert_result(edition_id: int, body: ResultCreate, db: DbDep, current_user: CurrentUser):
    if current_user.role != "admin" and current_user.participant_id != body.participant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Du kan kun registrere dine egne resultater")

    existing = (
        db.query(models.Result)
        .filter(
            models.Result.edition_id == edition_id,
            models.Result.sport_id == body.sport_id,
            models.Result.participant_id == body.participant_id,
        )
        .first()
    )
    if existing:
        existing.score = body.score
        existing.notes = body.notes
        db.commit()
        db.refresh(existing)
        return existing

    result = models.Result(edition_id=edition_id, **body.model_dump())
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


@router.delete("/{result_id}", status_code=204)
def delete_result(edition_id: int, result_id: int, db: DbDep, _: AdminUser):
    result = db.get(models.Result, result_id)
    if not result or result.edition_id != edition_id:
        raise HTTPException(status_code=404, detail="Resultat ikke funnet")
    db.delete(result)
    db.commit()
