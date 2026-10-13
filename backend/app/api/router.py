from fastapi import APIRouter
from app.api.dataset import router as dataset_router
from app.api.model import router as model_router
from app.api.predict import router as predict_router
from app.api.insights import router as insights_router
from app.api.history import router as history_router

api_router = APIRouter()

api_router.include_router(dataset_router)
api_router.include_router(model_router)
api_router.include_router(predict_router)
api_router.include_router(insights_router)
api_router.include_router(history_router)
