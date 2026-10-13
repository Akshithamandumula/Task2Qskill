import uuid
import json
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.predict import PredictionInput, PredictionResponse, ScenarioInput, ScenarioResult, FeatureContribution
from app.ml.predict import predict_property_price
from app.database.session import get_db
from app.database.models import PredictionRecord

router = APIRouter(tags=["Predict"])

@router.post("/predict", response_model=PredictionResponse)
def estimate_price(payload: PredictionInput, db: Session = Depends(get_db)):
    try:
        res = predict_property_price(payload.features)
        pred_id = str(uuid.uuid4())
        
        # Save to database
        record = PredictionRecord(
            id=pred_id,
            features_json=json.dumps(payload.features),
            predicted_price=res["predicted_price"],
            model_version=res["model_version"],
            notes=payload.notes
        )
        db.add(record)
        db.commit()
        
        contribs = [FeatureContribution(**c) for c in res["feature_contributions"]]
        
        return PredictionResponse(
            prediction_id=pred_id,
            predicted_price=res["predicted_price"],
            formatted_price=res["formatted_price"],
            features=res["features"],
            model_version=res["model_version"],
            metrics_summary=res["metrics_summary"],
            feature_contributions=contribs,
            disclaimer=res["disclaimer"]
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/predict/scenario", response_model=List[ScenarioResult])
def compare_scenarios(payload: ScenarioInput):
    results = []
    base_price = None
    
    for idx, sc in enumerate(payload.scenarios):
        sc_label = sc.get("label", f"Scenario {idx + 1}")
        sc_features = sc.get("features", {})
        try:
            res = predict_property_price(sc_features)
            pred_price = res["predicted_price"]
            if base_price is None:
                base_price = pred_price
                diff = 0.0
            else:
                diff = pred_price - base_price
                
            results.append(ScenarioResult(
                scenario_id=idx + 1,
                label=sc_label,
                features=sc_features,
                predicted_price=pred_price,
                formatted_price=res["formatted_price"],
                price_difference=round(diff, 2)
            ))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Scenario '{sc_label}' failed: {str(e)}")
            
    return results
