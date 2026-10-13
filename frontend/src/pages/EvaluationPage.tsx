import React from 'react';
import {
  BarChart3,
  Target,
  TrendingUp,
  DollarSign,
  Activity,
  CheckCircle2,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';
import { StatCard } from '../components/ui/StatCard';
import { ModelStatus } from '../types';

interface EvaluationPageProps {
  modelStatus: ModelStatus | null;
}

export const EvaluationPage: React.FC<EvaluationPageProps> = ({ modelStatus }) => {
  const metrics = modelStatus?.metrics;
  const scatterPoints = modelStatus?.actual_vs_predicted || [];
  const residualHist = modelStatus?.residual_distribution || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5" /> Statistical Performance Assessment
        </div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
          Model Evaluation Dashboard
        </h2>
        <p className="text-xs text-slate-400">
          Hold-out test dataset validation metrics, actual vs predicted regressions, and residual error distributions.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="R² Score (Variance)"
          value={metrics ? metrics.r2_score.toFixed(3) : 'N/A'}
          subtitle="Proportion of variance explained"
          icon={TrendingUp}
          badgeText="Good Fit"
          badgeType="emerald"
        />
        <StatCard
          title="Mean Absolute Error"
          value={metrics ? `$${Math.round(metrics.mae).toLocaleString()}` : 'N/A'}
          subtitle="Average absolute error"
          icon={DollarSign}
          badgeText="MAE"
          badgeType="cyan"
        />
        <StatCard
          title="Root Mean Sq Error"
          value={metrics ? `$${Math.round(metrics.rmse).toLocaleString()}` : 'N/A'}
          subtitle="Penalizes large residual outliers"
          icon={Target}
          badgeText="RMSE"
          badgeType="indigo"
        />
        <StatCard
          title="Mean Abs Pct Error"
          value={metrics?.mape ? `${metrics.mape.toFixed(1)}%` : 'N/A'}
          subtitle="Percentage error on test set"
          icon={Activity}
          badgeText="MAPE"
          badgeType="emerald"
        />
      </div>

      {/* Evaluation Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actual vs Predicted Scatter */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Actual vs Predicted Prices
              </h3>
              <p className="text-xs text-slate-400">Linear regression fit alignment along hold-out test set</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="actual"
                  name="Actual Price"
                  unit="$"
                  stroke="#64748b"
                  tickFormatter={(v) => `$${v/1000}k`}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="predicted"
                  name="Predicted Price"
                  unit="$"
                  stroke="#64748b"
                  tickFormatter={(v) => `$${v/1000}k`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Scatter name="Test Properties" data={scatterPoints} fill="#10b981" opacity={0.75} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Residual Error Distribution */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Residual Error Distribution
              </h3>
              <p className="text-xs text-slate-400">Histogram of prediction errors (Actual - Predicted)</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={residualHist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="bin" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Metric Interpretations Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-3">
        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4" /> Metric Interpretation Guide
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          The <strong>R² score</strong> measures how much of the variation in house prices is captured by property features (e.g. sqft_living, grade, waterfront, zipcode).
          An R² above 0.70 demonstrates strong predictive power for King County residential real estate.
        </p>
      </div>
    </div>
  );
};
