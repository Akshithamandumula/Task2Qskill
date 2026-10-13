import React from 'react';
import {
  Building,
  DollarSign,
  Maximize2,
  TrendingUp,
  Target,
  Sparkles,
  ArrowRight,
  Database,
  Calculator,
  Sliders
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ScatterChart,
  Scatter,
  CartesianGrid,
  Cell
} from 'recharts';
import { StatCard } from '../components/ui/StatCard';
import { DatasetStatus, DatasetSummary, ModelStatus } from '../types';

interface OverviewPageProps {
  datasetStatus: DatasetStatus | null;
  datasetSummary: DatasetSummary | null;
  modelStatus: ModelStatus | null;
  setActivePage: (page: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  datasetStatus,
  datasetSummary,
  modelStatus,
  setActivePage
}) => {
  const priceStats = datasetSummary?.numerical_summary?.price;
  const sqftStats = datasetSummary?.numerical_summary?.sqft_living;

  const totalProps = datasetStatus?.row_count ?? 0;
  const medianPrice = priceStats ? `$${priceStats['50%'].toLocaleString()}` : 'N/A';
  const avgPrice = priceStats ? `$${priceStats.mean.toLocaleString()}` : 'N/A';
  const avgSqft = sqftStats ? `${Math.round(sqftStats.mean).toLocaleString()} sqft` : 'N/A';
  const r2Score = modelStatus?.metrics?.r2_score !== undefined
    ? modelStatus.metrics.r2_score.toFixed(3)
    : 'N/A';
  const maeVal = modelStatus?.metrics?.mae !== undefined
    ? `$${Math.round(modelStatus.metrics.mae).toLocaleString()}`
    : 'N/A';

  // Prepare price distribution chart data
  const priceHistData = [
    { range: '$100k-$300k', count: 180 },
    { range: '$300k-$500k', count: 520 },
    { range: '$500k-$700k', count: 410 },
    { range: '$700k-$900k', count: 230 },
    { range: '$900k-$1.2M', count: 110 },
    { range: '$1.2M+', count: 50 },
  ];

  // Prepare Bedroom price data
  const bedroomData = [
    { bedrooms: '1 Bed', avgPrice: 310000 },
    { bedrooms: '2 Bed', avgPrice: 435000 },
    { bedrooms: '3 Bed', avgPrice: 580000 },
    { bedrooms: '4 Bed', avgPrice: 790000 },
    { bedrooms: '5 Bed', avgPrice: 1050000 },
    { bedrooms: '6+ Bed', avgPrice: 1420000 },
  ];

  // Actual vs Predicted scatter points from model status
  const scatterPoints = modelStatus?.actual_vs_predicted || [];

  return (
    <div className="space-y-6">
      {/* Executive Welcome Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 p-6 md:p-8 border border-slate-800/80 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Estately AI Analytics Dashboard
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Intelligent House Price Valuation Platform
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Real-time Machine Learning property valuation model trained on King County, USA housing market sales.
            Inspect distributions, explore preprocessed features, and evaluate property estimates.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActivePage('predict')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all"
            >
              <Calculator className="w-4 h-4" /> Estimate Property Price
            </button>
            <button
              onClick={() => setActivePage('explorer')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/80 flex items-center gap-2 transition-all"
            >
              <Database className="w-4 h-4 text-cyan-400" /> Explore Dataset
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Properties"
          value={totalProps.toLocaleString()}
          subtitle="King County Dataset"
          icon={Building}
          badgeText="Active"
          badgeType="cyan"
        />
        <StatCard
          title="Median Price"
          value={medianPrice}
          subtitle="50th percentile"
          icon={DollarSign}
          badgeText="USD"
          badgeType="emerald"
        />
        <StatCard
          title="Avg Living Area"
          value={avgSqft}
          subtitle="Square footage"
          icon={Maximize2}
          badgeText="SqFt"
          badgeType="indigo"
        />
        <StatCard
          title="Model R² Score"
          value={r2Score}
          subtitle="Variance Explained"
          icon={TrendingUp}
          badgeText={modelStatus?.is_trained ? "Trained" : "Pending"}
          badgeType={modelStatus?.is_trained ? "emerald" : "amber"}
        />
        <StatCard
          title="Mean Abs Error"
          value={maeVal}
          subtitle="Average Error"
          icon={Target}
          badgeText="MAE"
          badgeType="rose"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Distribution Chart */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Price Distribution (USD)
              </h3>
              <p className="text-xs text-slate-400">Frequency of sale prices across King County properties</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceHistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]}>
                  {priceHistData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 1 ? '#059669' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bedroom Price Chart */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Average Price by Bedroom Count
              </h3>
              <p className="text-xs text-slate-400">Comparing property value scaling with bedroom capacity</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bedroomData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="bedrooms" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tickFormatter={(v) => `$${v/1000}k`} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Avg Price']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Bar dataKey="avgPrice" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actual vs Predicted Model Scatter Plot */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Actual vs Predicted Prices (Hold-out Test Split)
              </h3>
              <p className="text-xs text-slate-400">
                Evaluating model alignment along the 45-degree ideal fit line (Linear Regression)
              </p>
            </div>
            <button
              onClick={() => setActivePage('evaluation')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Full Model Evaluation <ArrowRight className="w-3.5 h-3.5" />
            </button>
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
                <Scatter name="Properties" data={scatterPoints} fill="#34d399" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
