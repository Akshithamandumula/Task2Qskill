from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict

class ModelTrainRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    test_size: float = Field(0.2, ge=0.05, le=0.5)
    random_state: int = 42
    target_column: str = "price"
    feature_columns: Optional[List[str]] = None
    numeric_impute_strategy: str = "median" # median, mean
    scale_numeric: bool = True
    log_transform_target: bool = False
    remove_duplicates: bool = True

class ModelMetrics(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    r2_score: float
    mae: float
    rmse: float
    mape: Optional[float] = None
    test_samples: int
    train_samples: int

class ModelStatusResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    is_trained: bool
    model_name: str = "Linear Regression"
    target_column: Optional[str] = None
    feature_names: List[str] = []
    metrics: Optional[ModelMetrics] = None
    trained_at: Optional[str] = None
    dataset_name: Optional[str] = None
    feature_coefficients: Dict[str, float] = {}
    intercept: float = 0.0
    actual_vs_predicted: List[Dict[str, float]] = []
    residual_distribution: List[Dict[str, Any]] = []
