from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import Optional
from app.schemas.dataset import (
    DatasetStatusResponse,
    DatasetPreviewResponse,
    DatasetSummaryResponse,
    DatasetQualityResponse
)
from app.services.dataset_service import dataset_service

router = APIRouter(prefix="/dataset", tags=["Dataset"])

@router.get("/status", response_model=DatasetStatusResponse)
def get_dataset_status():
    return dataset_service.get_status()

@router.post("/upload", response_model=DatasetStatusResponse)
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    try:
        content = await file.read()
        return dataset_service.save_uploaded_csv(file.filename, content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV file: {str(e)}")

@router.get("/preview", response_model=DatasetPreviewResponse)
def get_dataset_preview(
    limit: int = Query(25, ge=1, le=500),
    search: str = Query(""),
    sort_by: Optional[str] = Query(None),
    sort_desc: bool = Query(False)
):
    return dataset_service.get_preview(limit, search, sort_by, sort_desc)

@router.get("/summary", response_model=DatasetSummaryResponse)
def get_dataset_summary():
    return dataset_service.get_summary()

@router.get("/quality", response_model=DatasetQualityResponse)
def get_dataset_quality():
    return dataset_service.get_quality()
