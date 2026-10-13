import numpy as np
import pandas as pd
from typing import List, Tuple, Dict, Any
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

def identify_feature_types(df: pd.DataFrame, target_col: str, feature_cols: List[str] = None) -> Tuple[List[str], List[str]]:
    if feature_cols is None:
        feature_cols = [col for col in df.columns if col != target_col and col not in ['id', 'date']]
    
    numeric_cols = []
    categorical_cols = []
    
    for col in feature_cols:
        if col not in df.columns:
            continue
        # If low cardinality integer or object/string, treat as categorical if appropriate
        if pd.api.types.is_numeric_dtype(df[col]):
            # Zipcode, waterfront, view, condition, grade can be treated as numeric or categorical
            if col in ['zipcode'] or df[col].dtype == object:
                categorical_cols.append(col)
            else:
                numeric_cols.append(col)
        else:
            categorical_cols.append(col)
            
    return numeric_cols, categorical_cols

def build_preprocessor(
    numeric_cols: List[str],
    categorical_cols: List[str],
    numeric_impute_strategy: str = "median",
    scale_numeric: bool = True
) -> ColumnTransformer:
    
    num_steps = [('imputer', SimpleImputer(strategy=numeric_impute_strategy))]
    if scale_numeric:
        num_steps.append(('scaler', StandardScaler()))
    num_pipeline = Pipeline(steps=num_steps)
    
    cat_steps = [
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse=False))
    ]
    cat_pipeline = Pipeline(steps=cat_steps)
    
    transformers = []
    if numeric_cols:
        transformers.append(('num', num_pipeline, numeric_cols))
    if categorical_cols:
        transformers.append(('cat', cat_pipeline, categorical_cols))
        
    return ColumnTransformer(transformers=transformers, remainder='drop')

def get_transformed_feature_names(preprocessor: ColumnTransformer, numeric_cols: List[str], categorical_cols: List[str]) -> List[str]:
    feature_names = list(numeric_cols)
    
    if categorical_cols and 'cat' in preprocessor.named_transformers_:
        cat_transformer = preprocessor.named_transformers_['cat']
        if hasattr(cat_transformer, 'named_steps') and 'encoder' in cat_transformer.named_steps:
            encoder = cat_transformer.named_steps['encoder']
            if hasattr(encoder, 'get_feature_names_out'):
                cat_names = encoder.get_feature_names_out(categorical_cols)
                feature_names.extend(list(cat_names))
            else:
                feature_names.extend(categorical_cols)
    return feature_names
