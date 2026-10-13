from typing import Dict, Any, List, Optional
from pydantic import BaseModel, ConfigDict

class PredictionInput(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    features: Dict[str, Any]
    notes: Optional[str] = None

class ScenarioInput(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    scenarios: List[Dict[str, Any]]

class FeatureContribution(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    feature: str
    value: Any
    coefficient: float
    contribution: float
    percentage_impact: float

class PredictionResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    prediction_id: str
    predicted_price: float
    formatted_price: str
    features: Dict[str, Any]
    model_version: str
    metrics_summary: Optional[Dict[str, float]] = None
    feature_contributions: List[FeatureContribution] = []
    disclaimer: str = "This value is a machine-learning statistical estimate based on historical King County property sales, not a certified real estate appraisal."

class ScenarioResult(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    scenario_id: int
    label: str
    features: Dict[str, Any]
    predicted_price: float
    formatted_price: str
    price_difference: float
