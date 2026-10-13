export interface DatasetStatus {
  is_loaded: boolean;
  filename?: string;
  row_count: number;
  column_count: number;
  file_size_bytes: number;
  columns: string[];
  target_column: string;
}

export interface DatasetPreview {
  columns: string[];
  dtypes: Record<string, string>;
  data: Record<string, any>[];
  total_rows: number;
}

export interface DatasetSummary {
  numerical_summary: Record<string, {
    count: number;
    mean: number;
    std: number;
    min: number;
    '25%': number;
    '50%': number;
    '75%': number;
    max: number;
  }>;
  categorical_summary: Record<string, {
    unique_values: number;
    top_counts: Record<string, number>;
  }>;
  correlations: Record<string, Record<string, number>>;
  column_types: Record<string, string>;
}

export interface DatasetQuality {
  missing_counts: Record<string, number>;
  missing_percentages: Record<string, number>;
  duplicate_rows: number;
  data_quality_score: number;
  warnings: string[];
}

export interface ModelMetrics {
  r2_score: number;
  mae: number;
  rmse: number;
  mape?: number;
  test_samples: number;
  train_samples: number;
}

export interface ModelStatus {
  is_trained: boolean;
  model_name: string;
  target_column?: string;
  feature_names: string[];
  metrics?: ModelMetrics;
  trained_at?: string;
  dataset_name?: string;
  feature_coefficients: Record<string, number>;
  intercept: number;
  actual_vs_predicted: Array<{ actual: number; predicted: number; residual: number }>;
  residual_distribution: Array<{ bin: string; count: number; range_min: number; range_max: number }>;
}

export interface FeatureContribution {
  feature: string;
  value: any;
  coefficient: number;
  contribution: number;
  percentage_impact: number;
}

export interface PredictionResponse {
  prediction_id: string;
  predicted_price: number;
  formatted_price: string;
  features: Record<string, any>;
  model_version: string;
  metrics_summary?: ModelMetrics;
  feature_contributions: FeatureContribution[];
  disclaimer: string;
}

export interface ScenarioResult {
  scenario_id: number;
  label: string;
  features: Record<string, any>;
  predicted_price: number;
  formatted_price: string;
  price_difference: number;
}

export interface HistoryItem {
  id: string;
  created_at: string;
  features: Record<string, any>;
  predicted_price: number;
  formatted_price: string;
  model_version: string;
  dataset_identifier: string;
  notes?: string;
}

export interface CoefficientInsights {
  intercept: number;
  total_features: number;
  positive_features: Array<{ feature: string; coefficient: number }>;
  negative_features: Array<{ feature: string; coefficient: number }>;
  all_coefficients: Record<string, number>;
  interpretation_guide: string;
}
