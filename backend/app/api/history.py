import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.schemas.history import HistoryItemResponse, HistoryListResponse
from app.database.session import get_db
from app.database.models import PredictionRecord

router = APIRouter(prefix="/predictions", tags=["History"])

@router.get("", response_model=HistoryListResponse)
def get_prediction_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(PredictionRecord).order_by(PredictionRecord.created_at.desc())
    total = query.count()
    records = query.offset(offset).limit(limit).all()
    
    items = []
    for r in records:
        try:
            feats = json.loads(r.features_json)
        except Exception:
            feats = {}
            
        items.append(HistoryItemResponse(
            id=r.id,
            created_at=r.created_at.isoformat(),
            features=feats,
            predicted_price=r.predicted_price,
            formatted_price=f"${r.predicted_price:,.2f}",
            model_version=r.model_version,
            dataset_identifier=r.dataset_identifier,
            notes=r.notes
        ))
        
    return HistoryListResponse(items=items, total=total)

@router.get("/{prediction_id}", response_model=HistoryItemResponse)
def get_prediction_detail(prediction_id: str, db: Session = Depends(get_db)):
    record = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
        
    try:
        feats = json.loads(record.features_json)
    except Exception:
        feats = {}
        
    return HistoryItemResponse(
        id=record.id,
        created_at=record.created_at.isoformat(),
        features=feats,
        predicted_price=record.predicted_price,
        formatted_price=f"${record.predicted_price:,.2f}",
        model_version=record.model_version,
        dataset_identifier=record.dataset_identifier,
        notes=record.notes
    )

@router.delete("/{prediction_id}")
def delete_prediction(prediction_id: str, db: Session = Depends(get_db)):
    record = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
    db.delete(record)
    db.commit()
    return {"status": "success", "message": f"Deleted prediction {prediction_id}"}

@router.delete("")
def clear_all_predictions(db: Session = Depends(get_db)):
    count = db.query(PredictionRecord).delete()
    db.commit()
    return {"status": "success", "deleted_count": count}
