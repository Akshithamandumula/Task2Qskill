from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class DatasetStatusResponse(BaseModel):
    is_loaded: bool
    filename: Optional[str] = None
    row_count: int = 0
    column_count: int = 0
    file_size_bytes: int = 0
    columns: List[str] = []
    target_column: Optional[str] = "price"

class DatasetPreviewResponse(BaseModel):
    columns: List[str]
    dtypes: Dict[str, str]
    data: List[Dict[str, Any]]
    total_rows: int

class DatasetSummaryResponse(BaseModel):
    numerical_summary: Dict[str, Dict[str, Any]]
    categorical_summary: Dict[str, Dict[str, Any]]
    correlations: Dict[str, Dict[str, float]]
    column_types: Dict[str, str]

class DatasetQualityResponse(BaseModel):
    missing_counts: Dict[str, int]
    missing_percentages: Dict[str, float]
    duplicate_rows: int
    data_quality_score: float
    warnings: List[str]
