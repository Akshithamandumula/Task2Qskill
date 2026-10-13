import os
import json
from fastapi import APIRouter, HTTPException
from app.schemas.model import ModelTrainRequest, ModelStatusResponse, ModelMetrics
from app.services.dataset_service import dataset_service
from app.ml.train import train_linear_regression
from app.core.config import settings

router = APIRouter(prefix="/model", tags=["Model"])

@router.get("/status", response_model=ModelStatusResponse)
def get_model_status():
    if not os.path.exists(settings.METADATA_PATH):
        return ModelStatusResponse(is_trained=False)
        
    try:
        with open(settings.METADATA_PATH, 'r') as f:
            metadata = json.load(f)
            
        metrics = ModelMetrics(**metadata["metrics"]) if metadata.get("metrics") else None
        return ModelStatusResponse(
            is_trained=True,
            model_name=metadata.get("model_name", "Linear Regression"),
            target_column=metadata.get("target_column"),
            feature_names=metadata.get("raw_feature_names", []),
            metrics=metrics,
            trained_at=metadata.get("trained_at"),
            dataset_name=metadata.get("dataset_name"),
            feature_coefficients=metadata.get("feature_coefficients", {}),
            intercept=metadata.get("intercept", 0.0),
            actual_vs_predicted=metadata.get("actual_vs_predicted", []),
            residual_distribution=metadata.get("residual_distribution", [])
        )
    except Exception as e:
        return ModelStatusResponse(is_trained=False)

@router.post("/train", response_model=ModelStatusResponse)
def train_model(req: ModelTrainRequest):
    if dataset_service.df is None or dataset_service.df.empty:
        raise HTTPException(status_code=400, detail="No active dataset loaded. Please upload or load a dataset first.")
        
    if req.target_column not in dataset_service.df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Target column '{req.target_column}' does not exist in the dataset. Available columns: {list(dataset_service.df.columns)}"
        )
        
    try:
        metadata = train_linear_regression(
            df=dataset_service.df,
            target_column=req.target_column,
            feature_columns=req.feature_columns,
            test_size=req.test_size,
            random_state=req.random_state,
            numeric_impute_strategy=req.numeric_impute_strategy,
            scale_numeric=req.scale_numeric,
            log_transform_target=req.log_transform_target,
            remove_duplicates=req.remove_duplicates,
            dataset_name=os.path.basename(dataset_service.active_dataset_path)
        )
        
        metrics = ModelMetrics(**metadata["metrics"])
        return ModelStatusResponse(
            is_trained=True,
            model_name=metadata["model_name"],
            target_column=metadata["target_column"],
            feature_names=metadata["raw_feature_names"],
            metrics=metrics,
            trained_at=metadata["trained_at"],
            dataset_name=metadata["dataset_name"],
            feature_coefficients=metadata["feature_coefficients"],
            intercept=metadata["intercept"],
            actual_vs_predicted=metadata["actual_vs_predicted"],
            residual_distribution=metadata["residual_distribution"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")

@router.get("/metrics", response_model=ModelMetrics)
def get_model_metrics():
    status = get_model_status()
    if not status.is_trained or status.metrics is None:
        raise HTTPException(status_code=404, detail="No trained model metrics available.")
    return status.metrics
