import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text
from app.database.session import Base

class PredictionRecord(Base):
    __tablename__ = "prediction_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    features_json = Column(Text, nullable=False)
    predicted_price = Column(Float, nullable=False)
    model_version = Column(String, default="1.0.0")
    dataset_identifier = Column(String, default="kc_house_data.csv")
    notes = Column(Text, nullable=True)
