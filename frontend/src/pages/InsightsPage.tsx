import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Info,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { api } from '../services/api';
import { CoefficientInsights } from '../types';

export const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<CoefficientInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getInsights()
      .then(setInsights)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const positiveData = insights?.positive_features.slice(0, 10) || [];
  const negativeData = insights?.negative_features.slice(0, 10) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
          <Lightbulb className="w-3.5 h-3.5" /> Feature Coefficients & Model Interpretability
        </div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
          Feature Insights & Linear Regression Coefficients
        </h2>
        <p className="text-xs text-slate-400">
          Understand how individual features contribute to property price estimates in the trained Linear Regression model.
        </p>
      </div>

      {/* Model Intercept Callout */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Model Intercept (Base Offset)
          </span>
          <h3 className="text-3xl font-extrabold text-emerald-400 tracking-tight mt-1">
            ${Math.round(insights?.intercept ?? 0).toLocaleString()}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            The base constant estimated by the Linear Regression model when zero-mean features are evaluated.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          Total Trained Features: <strong>{insights?.total_features ?? 0}</strong>
        </div>
      </div>

      {/* Coefficients Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Positive Coefficients */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Positive Feature Drivers
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={positiveData}
                margin={{ top: 10, right: 30, left: 60, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `$${v/1000}k`} tick={{ fontSize: 11 }} />
                <YAxis dataKey="feature" type="category" stroke="#64748b" tick={{ fontSize: 11 }} width={90} />
                <Tooltip
                  formatter={(val: number) => [`+$${val.toLocaleString()}`, 'Coefficient Weight']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Bar dataKey="coefficient" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Negative / Adjustment Coefficients */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" /> Negative / Relative Adjustments
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={negativeData}
                margin={{ top: 10, right: 30, left: 60, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `$${v/1000}k`} tick={{ fontSize: 11 }} />
                <YAxis dataKey="feature" type="category" stroke="#64748b" tick={{ fontSize: 11 }} width={90} />
                <Tooltip
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Coefficient Weight']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Bar dataKey="coefficient" fill="#f43f5e" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interpretability Note */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-3">
        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4" /> Machine Learning Interpretability Note
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {insights?.interpretation_guide ||
            'Linear regression coefficients represent conditional mathematical associations within the trained model, not causal claims.'}
        </p>
      </div>
    </div>
  );
};
