import os
import json
import joblib
import datetime
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline

from app.ml.preprocessing import identify_feature_types, build_preprocessor, get_transformed_feature_names
from app.ml.evaluate import evaluate_model_performance
from app.core.config import settings

def train_linear_regression(
    df: pd.DataFrame,
    target_column: str = "price",
    feature_columns: Optional[List[str]] = None,
    test_size: float = 0.2,
    random_state: int = 42,
    numeric_impute_strategy: str = "median",
    scale_numeric: bool = True,
    log_transform_target: bool = False,
    remove_duplicates: bool = True,
    dataset_name: str = "kc_house_data.csv"
) -> Dict[str, Any]:

    data = df.copy()
    
    if remove_duplicates:
        data = data.drop_duplicates()
        
    # Drop rows with missing target
    data = data.dropna(subset=[target_column])
    
    # Identify features
    numeric_cols, categorical_cols = identify_feature_types(data, target_column, feature_columns)
    all_feature_cols = numeric_cols + categorical_cols
    
    X = data[all_feature_cols]
    y = data[target_column].values
    
    if log_transform_target:
        y_train_target = np.log1p(y)
    else:
        y_train_target = y
        
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_train_target, test_size=test_size, random_state=random_state
    )
    
    # Build preprocessing pipeline
    preprocessor = build_preprocessor(
        numeric_cols, categorical_cols, numeric_impute_strategy, scale_numeric
    )
    
    model = LinearRegression()
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', model)
    ])
    
    # Fit pipeline ONLY on train split
    pipeline.fit(X_train, y_train)
    
    # Predict on test split
    y_pred_transformed = pipeline.predict(X_test)
    
    if log_transform_target:
        y_pred = np.expm1(y_pred_transformed)
        y_test_original = y[X_test.index]
    else:
        y_pred = y_pred_transformed
        y_test_original = y_test
        
    eval_results = evaluate_model_performance(y_test_original, y_pred)
    eval_results["metrics"]["train_samples"] = len(X_train)
    
    # Get feature names and coefficients
    transformed_feature_names = get_transformed_feature_names(preprocessor, numeric_cols, categorical_cols)
    regressor = pipeline.named_steps['regressor']
    coefficients = regressor.coef_.tolist() if hasattr(regressor, 'coef_') else []
    intercept = float(regressor.intercept_) if hasattr(regressor, 'intercept_') else 0.0
    
    feature_coef_dict = {
        name: round(float(coef), 4)
        for name, coef in zip(transformed_feature_names, coefficients)
    }
    
    # Save model pipeline
    os.makedirs(settings.ARTIFACTS_DIR, exist_ok=True)
    joblib.dump(pipeline, settings.MODEL_PATH)
    
    metadata = {
        "is_trained": True,
        "model_name": "Linear Regression",
        "target_column": target_column,
        "raw_feature_names": all_feature_cols,
        "numeric_features": numeric_cols,
        "categorical_features": categorical_cols,
        "transformed_feature_names": transformed_feature_names,
        "metrics": eval_results["metrics"],
        "trained_at": datetime.datetime.utcnow().isoformat(),
        "dataset_name": dataset_name,
        "feature_coefficients": feature_coef_dict,
        "intercept": intercept,
        "log_transform_target": log_transform_target,
        "actual_vs_predicted": eval_results["actual_vs_predicted"],
        "residual_distribution": eval_results["residual_distribution"]
    }
    
    with open(settings.METADATA_PATH, 'w') as f:
        json.dump(metadata, f, indent=2)
        
    return metadata
