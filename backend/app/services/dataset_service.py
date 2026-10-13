import os
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from app.core.config import settings

class DatasetService:
    _instance = None
    
    def __init__(self):
        self.active_dataset_path = settings.DEFAULT_DATASET_PATH
        self.df: Optional[pd.DataFrame] = None
        self._load_dataset()
        
    def _load_dataset(self, path: Optional[str] = None):
        target_path = path or self.active_dataset_path
        if os.path.exists(target_path):
            try:
                self.df = pd.read_csv(target_path)
                self.active_dataset_path = target_path
            except Exception as e:
                self.df = None
                print(f"Error loading dataset: {e}")
        else:
            self.df = None

    def get_status(self) -> Dict[str, Any]:
        if self.df is None or self.df.empty:
            return {
                "is_loaded": False,
                "filename": None,
                "row_count": 0,
                "column_count": 0,
                "file_size_bytes": 0,
                "columns": [],
                "target_column": "price"
            }
        
        file_size = os.path.getsize(self.active_dataset_path) if os.path.exists(self.active_dataset_path) else 0
        return {
            "is_loaded": True,
            "filename": os.path.basename(self.active_dataset_path),
            "row_count": len(self.df),
            "column_count": len(self.df.columns),
            "file_size_bytes": file_size,
            "columns": list(self.df.columns),
            "target_column": "price" if "price" in self.df.columns else self.df.columns[-1]
        }

    def get_preview(self, limit: int = 25, search: str = "", sort_by: Optional[str] = None, sort_desc: bool = False) -> Dict[str, Any]:
        if self.df is None or self.df.empty:
            return {"columns": [], "dtypes": {}, "data": [], "total_rows": 0}

        df_filtered = self.df.copy()
        
        if search:
            search_str = search.lower()
            mask = np.column_stack([
                df_filtered[col].astype(str).str.lower().str.contains(search_str, na=False)
                for col in df_filtered.columns
            ]).any(axis=1)
            df_filtered = df_filtered[mask]
            
        if sort_by and sort_by in df_filtered.columns:
            df_filtered = df_filtered.sort_values(by=sort_by, ascending=not sort_desc)
            
        dtypes_dict = {col: str(df_filtered[col].dtype) for col in df_filtered.columns}
        preview_data = df_filtered.head(limit).replace({np.nan: None}).to_dict(orient="records")
        
        return {
            "columns": list(self.df.columns),
            "dtypes": dtypes_dict,
            "data": preview_data,
            "total_rows": len(df_filtered)
        }

    def get_summary(self) -> Dict[str, Any]:
        if self.df is None or self.df.empty:
            return {"numerical_summary": {}, "categorical_summary": {}, "correlations": {}, "column_types": {}}

        num_df = self.df.select_dtypes(include=[np.number])
        cat_df = self.df.select_dtypes(exclude=[np.number])

        num_summary = {}
        if not num_df.empty:
            desc = num_df.describe().to_dict()
            for col, stats in desc.items():
                num_summary[col] = {
                    "count": int(stats.get("count", 0)),
                    "mean": round(float(stats.get("mean", 0)), 2),
                    "std": round(float(stats.get("std", 0)), 2),
                    "min": round(float(stats.get("min", 0)), 2),
                    "25%": round(float(stats.get("25%", 0)), 2),
                    "50%": round(float(stats.get("50%", 0)), 2),
                    "75%": round(float(stats.get("75%", 0)), 2),
                    "max": round(float(stats.get("max", 0)), 2)
                }

        cat_summary = {}
        if not cat_df.empty:
            for col in cat_df.columns:
                val_counts = cat_df[col].value_counts().head(5).to_dict()
                cat_summary[col] = {
                    "unique_values": int(cat_df[col].nunique()),
                    "top_counts": {str(k): int(v) for k, v in val_counts.items()}
                }

        # Calculate Pearson correlations for top numerical features
        correlations = {}
        if not num_df.empty:
            corr_matrix = num_df.corr().replace({np.nan: 0.0})
            for col in corr_matrix.columns:
                correlations[col] = {
                    other: round(float(val), 3)
                    for other, val in corr_matrix[col].items()
                }

        col_types = {col: str(self.df[col].dtype) for col in self.df.columns}

        return {
            "numerical_summary": num_summary,
            "categorical_summary": cat_summary,
            "correlations": correlations,
            "column_types": col_types
        }

    def get_quality(self) -> Dict[str, Any]:
        if self.df is None or self.df.empty:
            return {
                "missing_counts": {},
                "missing_percentages": {},
                "duplicate_rows": 0,
                "data_quality_score": 0.0,
                "warnings": ["No active dataset loaded."]
            }

        total_rows = len(self.df)
        missing_counts = self.df.isnull().sum().to_dict()
        missing_pcts = {
            col: round((count / max(total_rows, 1)) * 100, 2)
            for col, count in missing_counts.items()
        }
        duplicate_rows = int(self.df.duplicated().sum())

        warnings = []
        if duplicate_rows > 0:
            warnings.append(f"Found {duplicate_rows} duplicate rows in the dataset.")

        for col, pct in missing_pcts.items():
            if pct > 10.0:
                warnings.append(f"Column '{col}' has {pct}% missing values.")

        if "price" in self.df.columns:
            negative_prices = (self.df["price"] <= 0).sum()
            if negative_prices > 0:
                warnings.append(f"Found {negative_prices} rows with non-positive price values.")

        # Quality score out of 100
        total_cells = total_rows * len(self.df.columns)
        missing_cells = sum(missing_counts.values())
        missing_ratio = missing_cells / max(total_cells, 1)
        duplicate_ratio = duplicate_rows / max(total_rows, 1)

        quality_score = max(0.0, round((1.0 - missing_ratio - (duplicate_ratio * 0.5)) * 100, 1))

        return {
            "missing_counts": {k: int(v) for k, v in missing_counts.items()},
            "missing_percentages": missing_pcts,
            "duplicate_rows": duplicate_rows,
            "data_quality_score": quality_score,
            "warnings": warnings
        }

    def save_uploaded_csv(self, filename: str, content: bytes) -> Dict[str, Any]:
        file_path = os.path.join(settings.DATA_DIR, filename)
        with open(file_path, "wb") as f:
            f.write(content)
        self._load_dataset(file_path)
        return self.get_status()

dataset_service = DatasetService()
