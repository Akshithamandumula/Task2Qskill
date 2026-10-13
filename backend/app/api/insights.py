import os
import json
from fastapi import APIRouter, HTTPException
from app.core.config import settings

router = APIRouter(prefix="/insights", tags=["Insights"])

@router.get("/coefficients")
def get_model_coefficients():
    if not os.path.exists(settings.METADATA_PATH):
        raise HTTPException(status_code=404, detail="No trained model found.")
        
    try:
        with open(settings.METADATA_PATH, 'r') as f:
            metadata = json.load(f)
            
        coefs = metadata.get("feature_coefficients", {})
        intercept = metadata.get("intercept", 0.0)
        
        sorted_coefs = sorted(coefs.items(), key=lambda item: item[1], reverse=True)
        positive_features = [{"feature": k, "coefficient": v} for k, v in sorted_coefs if v > 0]
        negative_features = [{"feature": k, "coefficient": v} for k, v in sorted_coefs if v < 0]
        
        return {
            "intercept": intercept,
            "total_features": len(coefs),
            "positive_features": positive_features,
            "negative_features": negative_features,
            "all_coefficients": coefs,
            "interpretation_guide": (
                "Linear regression coefficients represent the estimated expected change in target price ($) "
                "for a 1-unit increase in the feature, keeping all other property features constant. "
                "These indicate conditional model correlations, not direct causal claims."
            )
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch coefficients: {str(e)}")
