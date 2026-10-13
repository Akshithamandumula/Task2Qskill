import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.core.config import settings

def predict_property_price(input_features: Dict[str, Any]) -> Dict[str, Any]:
    if not os.path.exists(settings.MODEL_PATH) or not os.path.exists(settings.METADATA_PATH):
        raise ValueError("No trained model found. Please train a model first in the Model Training Lab.")
        
    pipeline = joblib.load(settings.MODEL_PATH)
    with open(settings.METADATA_PATH, 'r') as f:
        metadata = json.load(f)
        
    # Build single row dataframe with required raw features
    raw_features = metadata.get("raw_feature_names", [])
    row_data = {}
    for col in raw_features:
        if col in input_features:
            row_data[col] = [input_features[col]]
        else:
            row_data[col] = [np.nan] # Will be imputed by preprocessor
            
    df_input = pd.DataFrame(row_data)
    
    # Run prediction
    pred_raw = pipeline.predict(df_input)[0]
    if metadata.get("log_transform_target", False):
        predicted_price = float(np.expm1(pred_raw))
    else:
        predicted_price = float(pred_raw)
        
    predicted_price = max(10000.0, predicted_price) # Safety floor for house price
    
    # Calculate feature contributions for explanation
    contributions = []
    feature_coefs = metadata.get("feature_coefficients", {})
    num_cols = metadata.get("numeric_features", [])
    
    total_abs_contrib = 0.0
    raw_contribs = []
    
    for num_col in num_cols:
        val = input_features.get(num_col)
        coef = feature_coefs.get(num_col, 0.0)
        if val is not None and isinstance(val, (int, float)):
            contrib = float(val * coef)
            total_abs_contrib += abs(contrib)
            raw_contribs.append({
                "feature": num_col,
                "value": val,
                "coefficient": round(coef, 2),
                "contribution": round(contrib, 2),
            })
            
    for item in raw_contribs:
        pct = round((abs(item["contribution"]) / max(total_abs_contrib, 1.0)) * 100, 1)
        item["percentage_impact"] = pct
        contributions.append(item)
        
    contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
    
    formatted_price = f"${predicted_price:,.2f}"
    
    return {
        "predicted_price": round(predicted_price, 2),
        "formatted_price": formatted_price,
        "features": input_features,
        "model_version": "1.0.0",
        "metrics_summary": metadata.get("metrics"),
        "feature_contributions": contributions,
        "disclaimer": "This estimated value is produced by a trained Linear Regression ML pipeline based on King County real estate historical data, not a certified appraisal."
    }
