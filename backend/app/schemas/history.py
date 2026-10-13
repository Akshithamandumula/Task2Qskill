from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict

class HistoryItemResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    id: str
    created_at: str
    features: Dict[str, Any]
    predicted_price: float
    formatted_price: str
    model_version: str
    dataset_identifier: str
    notes: Optional[str] = None

class HistoryListResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    items: List[HistoryItemResponse]
    total: int
