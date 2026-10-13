import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  Settings2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { DatasetQuality } from '../types';

export const PreprocessingPage: React.FC = () => {
  const [quality, setQuality] = useState<DatasetQuality | null>(null);
  const [numImpute, setNumImpute] = useState('median');
  const [catImpute, setCatImpute] = useState('most_frequent');
  const [scaleNumeric, setScaleNumeric] = useState(true);
  const [logTransform, setLogTransform] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getDatasetQuality().then(setQuality).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Scikit-Learn Preprocessing Pipeline
        </div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
          Data Preprocessing Workspace
        </h2>
        <p className="text-xs text-slate-400">
          Configure feature transformation, imputation strategies, scaling, and categorical encoding pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Preprocessing Controls */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-slate-800/80 space-y-6">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-3">
            Pipeline Configuration
          </h3>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Numerical Imputation Strategy
              </label>
              <select
                value={numImpute}
                onChange={(e) => setNumImpute(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:border-emerald-500"
              >
                <option value="median">Median Imputation (Robust to Outliers)</option>
                <option value="mean">Mean Imputation</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Replaces missing numerical features with median value.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Numerical Feature Scaling
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="scaleNumeric"
                  checked={scaleNumeric}
                  onChange={(e) => setScaleNumeric(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0"
                />
                <label htmlFor="scaleNumeric" className="text-xs text-slate-200 font-medium">
                  Apply Standard Scaling (Zero mean, unit variance)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Variable Log Transformation
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="logTransform"
                  checked={logTransform}
                  onChange={(e) => setLogTransform(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0"
                />
                <label htmlFor="logTransform" className="text-xs text-slate-200 font-medium">
                  Apply Log Transformation log1p(price) for Skew Reduction
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duplicate Row Removal
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="removeDuplicates"
                  checked={removeDuplicates}
                  onChange={(e) => setRemoveDuplicates(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0"
                />
                <label htmlFor="removeDuplicates" className="text-xs text-slate-200 font-medium">
                  Drop exact duplicate rows before training split
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Data Quality Report */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-slate-800/80 space-y-6">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-3">
            Data Quality Audit
          </h3>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Health Score</span>
              <span className="font-bold text-emerald-400">{quality?.data_quality_score ?? 100}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${quality?.data_quality_score ?? 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase">Quality Warnings</h4>
            {quality?.warnings && quality.warnings.length > 0 ? (
              quality.warnings.map((w, i) => (
                <div key={i} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{w}</span>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>No severe data quality anomalies detected.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
