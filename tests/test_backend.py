import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.dataset_service import dataset_service
from app.ml.predict import predict_property_price

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["dataset_loaded"] is True

def test_dataset_status():
    response = client.get("/api/dataset/status")
    assert response.status_code == 200
    data = response.json()
    assert data["is_loaded"] is True
    assert data["row_count"] > 0
    assert "price" in data["columns"]

def test_dataset_preview():
    response = client.get("/api/dataset/preview?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 10
    assert "price" in data["columns"]

def test_dataset_summary_and_quality():
    res_summary = client.get("/api/dataset/summary")
    assert res_summary.status_code == 200
    summary = res_summary.json()
    assert "numerical_summary" in summary
    assert "price" in summary["numerical_summary"]

    res_quality = client.get("/api/dataset/quality")
    assert res_quality.status_code == 200
    quality = res_quality.json()
    assert "data_quality_score" in quality

def test_model_training_and_status():
    train_payload = {
        "test_size": 0.2,
        "random_state": 42,
        "target_column": "price",
        "numeric_impute_strategy": "median",
        "scale_numeric": True
    }
    res_train = client.post("/api/model/train", json=train_payload)
    assert res_train.status_code == 200
    train_data = res_train.json()
    assert train_data["is_trained"] is True
    assert train_data["metrics"]["r2_score"] > 0.60
    assert "mae" in train_data["metrics"]

    res_status = client.get("/api/model/status")
    assert res_status.status_code == 200
    status_data = res_status.json()
    assert status_data["is_trained"] is True

def test_prediction_endpoint():
    sample_property = {
        "features": {
            "bedrooms": 3,
            "bathrooms": 2.5,
            "sqft_living": 2400,
            "sqft_lot": 6000,
            "floors": 2.0,
            "waterfront": 0,
            "view": 0,
            "condition": 3,
            "grade": 8,
            "sqft_above": 1800,
            "sqft_basement": 600,
            "yr_built": 2005,
            "yr_renovated": 0,
            "zipcode": 98052,
            "lat": 47.67,
            "long": -122.12,
            "sqft_living15": 2300,
            "sqft_lot15": 5800
        },
        "notes": "Test valuation query"
    }
    res_pred = client.post("/api/predict", json=sample_property)
    assert res_pred.status_code == 200
    pred_data = res_pred.json()
    assert pred_data["predicted_price"] > 100000
    assert "prediction_id" in pred_data
    assert len(pred_data["feature_contributions"]) > 0

def test_prediction_history():
    res_hist = client.get("/api/predictions")
    assert res_hist.status_code == 200
    hist_data = res_hist.json()
    assert hist_data["total"] >= 1

def test_insights_coefficients():
    res_coef = client.get("/api/insights/coefficients")
    assert res_coef.status_code == 200
    coef_data = res_coef.json()
    assert "intercept" in coef_data
    assert len(coef_data["positive_features"]) > 0
