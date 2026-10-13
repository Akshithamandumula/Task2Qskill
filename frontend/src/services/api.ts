import {
  DatasetStatus,
  DatasetPreview,
  DatasetSummary,
  DatasetQuality,
  ModelStatus,
  PredictionResponse,
  ScenarioResult,
  HistoryItem,
  CoefficientInsights
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred.';
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errData.message || errorMsg;
    } catch {
      errorMsg = response.statusText;
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export const api = {
  async getDatasetStatus(): Promise<DatasetStatus> {
    const res = await fetch(`${API_BASE}/dataset/status`);
    return handleResponse<DatasetStatus>(res);
  },

  async uploadDataset(file: File): Promise<DatasetStatus> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/dataset/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<DatasetStatus>(res);
  },

  async getDatasetPreview(limit = 25, search = '', sortBy?: string, sortDesc = false): Promise<DatasetPreview> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      search,
      sort_desc: sortDesc.toString(),
    });
    if (sortBy) params.append('sort_by', sortBy);
    const res = await fetch(`${API_BASE}/dataset/preview?${params.toString()}`);
    return handleResponse<DatasetPreview>(res);
  },

  async getDatasetSummary(): Promise<DatasetSummary> {
    const res = await fetch(`${API_BASE}/dataset/summary`);
    return handleResponse<DatasetSummary>(res);
  },

  async getDatasetQuality(): Promise<DatasetQuality> {
    const res = await fetch(`${API_BASE}/dataset/quality`);
    return handleResponse<DatasetQuality>(res);
  },

  async getModelStatus(): Promise<ModelStatus> {
    const res = await fetch(`${API_BASE}/model/status`);
    return handleResponse<ModelStatus>(res);
  },

  async trainModel(payload: {
    test_size: number;
    random_state: number;
    target_column: string;
    numeric_impute_strategy: string;
    scale_numeric: boolean;
    log_transform_target: boolean;
    remove_duplicates: boolean;
  }): Promise<ModelStatus> {
    const res = await fetch(`${API_BASE}/model/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<ModelStatus>(res);
  },

  async predictPrice(features: Record<string, any>, notes?: string): Promise<PredictionResponse> {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features, notes }),
    });
    return handleResponse<PredictionResponse>(res);
  },

  async compareScenarios(scenarios: Array<{ label: string; features: Record<string, any> }>): Promise<ScenarioResult[]> {
    const res = await fetch(`${API_BASE}/predict/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarios }),
    });
    return handleResponse<ScenarioResult[]>(res);
  },

  async getHistory(limit = 50, offset = 0): Promise<{ items: HistoryItem[]; total: number }> {
    const res = await fetch(`${API_BASE}/predictions?limit=${limit}&offset=${offset}`);
    return handleResponse<{ items: HistoryItem[]; total: number }>(res);
  },

  async deleteHistoryItem(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/predictions/${id}`, { method: 'DELETE' });
    await handleResponse(res);
  },

  async clearHistory(): Promise<void> {
    const res = await fetch(`${API_BASE}/predictions`, { method: 'DELETE' });
    await handleResponse(res);
  },

  async getInsights(): Promise<CoefficientInsights> {
    const res = await fetch(`${API_BASE}/insights/coefficients`);
    return handleResponse<CoefficientInsights>(res);
  },
};
