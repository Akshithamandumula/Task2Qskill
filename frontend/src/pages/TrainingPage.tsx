import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sliders,
  Layers,
  Database,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { ModelStatus } from '../types';

interface TrainingPageProps {
  modelStatus: ModelStatus | null;
  refreshModel: () => void;
  setActivePage: (page: string) => void;
}

export const TrainingPage: React.FC<TrainingPageProps> = ({
  modelStatus,
  refreshModel,
  setActivePage
}) => {
  const [testSize, setTestSize] = useState(0.2);
  const [randomState, setRandomState] = useState(42);
  const [targetColumn, setTargetColumn] = useState('price');
  const [numImpute, setNumImpute] = useState('median');
  const [scaleNumeric, setScaleNumeric] = useState(true);
  const [logTransform, setLogTransform] = useState(false);
  const [training, setTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    setTraining(true);
    setError(null);
    try {
      await api.trainModel({
        test_size: testSize,
        random_state: randomState,
        target_column: targetColumn,
        numeric_impute_strategy: numImpute,
        scale_numeric: scaleNumeric,
        log_transform_target: logTransform,
        remove_duplicates: true,
      });
      refreshModel();
    } catch (err: any) {
      setError(err.message || 'Model training failed.');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <BrainCircuit className="w-3.5 h-3.5" /> Machine Learning Training Lab
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            Model Training Lab
          </h2>
          <p className="text-xs text-slate-400">
            Train a scikit-learn Linear Regression model pipeline with reproducible train/test validation splits.
          </p>
        </div>

        <button
          onClick={() => setActivePage('evaluation')}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all shrink-0"
        >
          <span>View Model Evaluation</span>
          <ArrowRight className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Training Form */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-slate-800/80 space-y-6">
          <form onSubmit={handleTrain} className="space-y-5">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-3">
              Validation & Split Parameters
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Hold-out Test Split Ratio ({Math.round(testSize * 100)}%)
                </label>
                <span className="text-xs text-emerald-400 font-bold">
                  Train: {Math.round((1 - testSize) * 100)}% / Test: {Math.round(testSize * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.5}
                step={0.05}
                value={testSize}
                onChange={(e) => setTestSize(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Random Seed (Reproducibility)
                </label>
                <input
                  type="number"
                  value={randomState}
                  onChange={(e) => setRandomState(parseInt(e.target.value) || 42)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Column Name
                </label>
                <input
                  type="text"
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300">
                Pipeline Preprocessing Steps
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="trainScale"
                  checked={scaleNumeric}
                  onChange={(e) => setScaleNumeric(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0"
                />
                <label htmlFor="trainScale" className="text-xs text-slate-300">
                  Standardize Numerical Features (StandardScaler)
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="trainLog"
                  checked={logTransform}
                  onChange={(e) => setLogTransform(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0"
                />
                <label htmlFor="trainLog" className="text-xs text-slate-300">
                  Log-Transform Target Variable log1p(price)
                </label>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={training}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {training ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Fitting Linear Regression Pipeline...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5" />
                  <span>Train Linear Regression Model</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Training Artifact Metadata */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-slate-800/80 space-y-6">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-3">
            Trained Model Artifact Status
          </h3>

          {modelStatus?.is_trained ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-slate-100">Linear Regression Active</h4>
                  <p className="text-slate-300 text-[11px]">Model successfully persisted with Joblib pipeline.</p>
                </div>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-800">
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">R² Score (Test Split)</span>
                  <span className="font-bold text-emerald-400">{modelStatus.metrics?.r2_score.toFixed(3)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Mean Absolute Error (MAE)</span>
                  <span className="font-bold text-slate-100">${Math.round(modelStatus.metrics?.mae ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Root Mean Sq Error (RMSE)</span>
                  <span className="font-bold text-slate-100">${Math.round(modelStatus.metrics?.rmse ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Test Samples</span>
                  <span className="font-bold text-slate-100">{modelStatus.metrics?.test_samples}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Trained Timestamp</span>
                  <span className="font-medium text-slate-300">
                    {modelStatus.trained_at ? new Date(modelStatus.trained_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <BrainCircuit className="w-8 h-8 mx-auto text-slate-600" />
              <p>No model trained yet. Configure parameters and click "Train Linear Regression Model".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
