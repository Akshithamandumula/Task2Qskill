import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Estately AI — Intelligent House Price Prediction Platform"
    API_V1_STR: str = "/api"
    
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    ARTIFACTS_DIR: str = os.path.join(BASE_DIR, "artifacts")
    DEFAULT_DATASET_PATH: str = os.path.join(DATA_DIR, "kc_house_data.csv")
    MODEL_PATH: str = os.path.join(ARTIFACTS_DIR, "trained_model.joblib")
    METADATA_PATH: str = os.path.join(ARTIFACTS_DIR, "model_metadata.json")
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'estately.db')}"
    
    CORS_ORIGINS: list = ["http://localhost:5173", "http://127.0.0.1:5173", "*"]

settings = Settings()
os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.ARTIFACTS_DIR, exist_ok=True)
