import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

def evaluate_model_performance(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, Any]:
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    
    r2 = float(r2_score(y_true, y_pred))
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    
    # Calculate MAPE safely (avoiding zero division)
    non_zero_mask = y_true != 0
    if np.any(non_zero_mask):
        mape = float(np.mean(np.abs((y_true[non_zero_mask] - y_pred[non_zero_mask]) / y_true[non_zero_mask])) * 100)
    else:
        mape = None
        
    residuals = y_true - y_pred
    
    # Subsample max 150 points for responsive interactive plotting
    sample_indices = np.linspace(0, len(y_true) - 1, min(150, len(y_true)), dtype=int)
    actual_vs_predicted = [
        {
            "actual": round(float(y_true[i]), 2),
            "predicted": round(float(y_pred[i]), 2),
            "residual": round(float(residuals[i]), 2)
        }
        for i in sample_indices
    ]
    
    # Compute residual distribution histogram (15 bins)
    hist, bin_edges = np.histogram(residuals, bins=15)
    residual_distribution = [
        {
            "bin": f"${int(bin_edges[i]/1000)}k to ${int(bin_edges[i+1]/1000)}k",
            "count": int(hist[i]),
            "range_min": float(bin_edges[i]),
            "range_max": float(bin_edges[i+1])
        }
        for i in range(len(hist))
    ]
    
    return {
        "metrics": {
            "r2_score": round(r2, 4),
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "mape": round(mape, 2) if mape is not None else None,
            "test_samples": len(y_true),
            "train_samples": 0
        },
        "actual_vs_predicted": actual_vs_predicted,
        "residual_distribution": residual_distribution
    }
