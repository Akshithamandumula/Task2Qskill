import React, { useState } from 'react';
import {
  Calculator,
  Building,
  MapPin,
  Maximize2,
  Calendar,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  Layers,
  ArrowRight,
  TrendingUp,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { PredictionResponse, ScenarioResult, ModelStatus } from '../types';

interface PredictPageProps {
  modelStatus: ModelStatus | null;
}

export const PredictPage: React.FC<PredictPageProps> = ({ modelStatus }) => {
  const [formData, setFormData] = useState({
    bedrooms: 3,
    bathrooms: 2.5,
    sqft_living: 2200,
    sqft_lot: 6500,
    floors: 2.0,
    waterfront: 0,
    view: 0,
    condition: 3,
    grade: 8,
    sqft_above: 1700,
    sqft_basement: 500,
    yr_built: 2004,
    yr_renovated: 0,
    zipcode: 98052,
    lat: 47.67,
    long: -122.12,
    sqft_living15: 2100,
    sqft_lot15: 6200,
    notes: '',
  });

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Scenario comparison state
  const [scenarios, setScenarios] = useState<Array<{ label: string; sqft: number; zip: number }>>([
    { label: 'Base Scenario', sqft: 2200, zip: 98052 },
    { label: '+500 SqFt Addition', sqft: 2700, zip: 98052 },
    { label: 'Bellevue / Medina Location (98004)', sqft: 2200, zip: 98004 },
  ]);
  const [scenarioResults, setScenarioResults] = useState<ScenarioResult[] | null>(null);
  const [comparingScenarios, setComparingScenarios] = useState(false);

  const zipcodes = [
    { code: 98001, label: '98001 - Auburn / Federal Way' },
    { code: 98004, label: '98004 - Bellevue Downtown / Medina' },
    { code: 98006, label: '98006 - Bellevue South / Factorsia' },
    { code: 98033, label: '98033 - Kirkland Waterfront' },
    { code: 98039, label: '98039 - Medina Estate' },
    { code: 98040, label: '98040 - Mercer Island' },
    { code: 98052, label: '98052 - Redmond / Tech Campus' },
    { code: 98074, label: '98074 - Sammamish Plateau' },
    { code: 98103, label: '98103 - Seattle Green Lake / Fremont' },
    { code: 98105, label: '98105 - Seattle University District' },
    { code: 98112, label: '98112 - Seattle Capitol Hill / Madison' },
    { code: 98115, label: '98115 - Seattle Ravenna / Wedgwood' },
    { code: 98119, label: '98119 - Seattle Queen Anne' },
    { code: 98122, label: '98122 - Seattle Central District' },
    { code: 98133, label: '98133 - Seattle Shoreline North' },
    { code: 98155, label: '98155 - Lake Forest Park' },
  ];

  const handleInputChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await api.predictPrice(formData, formData.notes);
      setPrediction(res);
      setSavedSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate property prediction.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunScenarioAnalysis = async () => {
    setComparingScenarios(true);
    try {
      const payload = scenarios.map((s) => ({
        label: s.label,
        features: {
          ...formData,
          sqft_living: s.sqft,
          zipcode: s.zip,
        },
      }));
      const results = await api.compareScenarios(payload);
      setScenarioResults(results);
    } catch (err: any) {
      alert(`Scenario comparison failed: ${err.message}`);
    } finally {
      setComparingScenarios(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Calculator className="w-3.5 h-3.5" /> Interactive Valuation Estimator
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            Predict Property Valuation
          </h2>
          <p className="text-xs text-slate-400">
            Configure property specifications to evaluate real-time Linear Regression price predictions.
          </p>
        </div>

        {modelStatus?.is_trained && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Active Model: <strong>Linear Regression (R²={modelStatus.metrics?.r2_score.toFixed(2)})</strong></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs Workspace */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-slate-800/80 space-y-6">
          <form onSubmit={handleEstimate} className="space-y-6">
            {/* Section 1: Location & Region */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <MapPin className="w-4 h-4" /> 1. Location & Region
              </h3>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  King County ZIP Code & District
                </label>
                <select
                  value={formData.zipcode}
                  onChange={(e) => handleInputChange('zipcode', parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {zipcodes.map((z) => (
                    <option key={z.code} value={z.code}>
                      {z.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section 2: Property Size & Layout */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Maximize2 className="w-4 h-4" /> 2. Space & Layout
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Living Area (SqFt)
                  </label>
                  <input
                    type="number"
                    min={400}
                    max={10000}
                    value={formData.sqft_living}
                    onChange={(e) => handleInputChange('sqft_living', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Lot Area (SqFt)
                  </label>
                  <input
                    type="number"
                    min={500}
                    max={100000}
                    value={formData.sqft_lot}
                    onChange={(e) => handleInputChange('sqft_lot', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Bedrooms
                  </label>
                  <select
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-emerald-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} Bedrooms
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Bathrooms
                  </label>
                  <select
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-emerald-500"
                  >
                    {[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5].map((num) => (
                      <option key={num} value={num}>
                        {num} Bathrooms
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Grade & Condition */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Building className="w-4 h-4" /> 3. Quality & Condition
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Construction Grade (3-12)
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-emerald-500"
                  >
                    {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Condition (1-5)
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-emerald-500"
                  >
                    {[1, 2, 3, 4, 5].map((c) => (
                      <option key={c} value={c}>
                        Level {c} {c === 3 ? '(Average)' : c > 3 ? '(Good)' : '(Fair)'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Waterfront View
                  </label>
                  <select
                    value={formData.waterfront}
                    onChange={(e) => handleInputChange('waterfront', parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-emerald-500"
                  >
                    <option value={0}>No Waterfront</option>
                    <option value={1}>Waterfront Property</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Construction Age */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Calendar className="w-4 h-4" /> 4. Construction Year
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Year Built
                  </label>
                  <input
                    type="number"
                    min={1900}
                    max={2023}
                    value={formData.yr_built}
                    onChange={(e) => handleInputChange('yr_built', parseInt(e.target.value) || 2000)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Year Renovated (0 = Never)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={2023}
                    value={formData.yr_renovated}
                    onChange={(e) => handleInputChange('yr_renovated', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-emerald-500"
                  />
                </div>
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
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Calculator className="w-5 h-5" />
              {loading ? 'Calculating Model Prediction...' : 'Estimate Property Value'}
            </button>
          </form>
        </div>

        {/* Prediction Results & Summary Panel */}
        <div className="lg:col-span-5 space-y-6">
          {prediction ? (
            <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 space-y-6 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Valuation Result
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
                  ID: {prediction.prediction_id.slice(0, 8)}
                </span>
              </div>

              {/* Price Callout */}
              <div className="text-center py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="text-xs text-slate-400 uppercase tracking-wider">
                  Estimated Property Price
                </span>
                <h3 className="text-3xl md:text-4xl font-extrabold text-emerald-400 tracking-tight">
                  {prediction.formatted_price}
                </h3>
                <span className="text-[11px] text-slate-400 block pt-1">
                  King County Market Estimate (USD)
                </span>
              </div>

              {/* Feature Impact Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Key Value Drivers
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {prediction.feature_contributions.map((c) => (
                    <div key={c.feature} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-300 font-medium capitalize">
                        {c.feature.replace('_', ' ')}: {c.value}
                      </span>
                      <span className={`font-semibold ${c.contribution >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {c.contribution >= 0 ? '+' : ''}${Math.round(c.contribution).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{prediction.disclaimer}</span>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 border border-slate-800/80 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Calculator className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-200">
                Ready for Valuation
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Fill out the property specifications on the left and click "Estimate Property Value" to evaluate real model predictions.
              </p>
            </div>
          )}

          {/* Scenario Comparison Tool */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" /> Scenario Comparison Tool
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Evaluate how changing property size or ZIP code impacts model valuation.
            </p>

            <button
              onClick={handleRunScenarioAnalysis}
              disabled={comparingScenarios}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {comparingScenarios ? 'Evaluating Scenarios...' : 'Run Scenario Analysis'}
            </button>

            {scenarioResults && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                {scenarioResults.map((s) => (
                  <div key={s.scenario_id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-200 block">{s.label}</span>
                      <span className="text-[11px] text-slate-400">
                        {s.features.sqft_living} SqFt • ZIP {s.features.zipcode}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-400 block">{s.formatted_price}</span>
                      <span className={`text-[10px] ${s.price_difference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {s.price_difference >= 0 ? '+' : ''}${Math.round(s.price_difference).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
