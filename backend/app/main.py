import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router
from app.database.session import engine, Base
from app.services.dataset_service import dataset_service
from app.ml.train import train_linear_regression

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    # If no model is trained yet, train default initial model on kc_house_data.csv
    if not os.path.exists(settings.METADATA_PATH) and dataset_service.df is not None:
        try:
            print("Training initial default model on King County dataset...")
            train_linear_regression(
                df=dataset_service.df,
                target_column="price",
                dataset_name="kc_house_data.csv"
            )
            print("Initial default model successfully trained and ready.")
        except Exception as e:
            print(f"Initial training warning: {e}")

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "dataset_loaded": dataset_service.df is not None,
        "model_ready": os.path.exists(settings.METADATA_PATH)
    }
