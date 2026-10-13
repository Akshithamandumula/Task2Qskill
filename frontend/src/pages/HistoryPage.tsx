import React, { useState, useEffect } from 'react';
import {
  History,
  Trash2,
  Download,
  Search,
  Eye,
  X,
  AlertTriangle,
  Calendar,
  DollarSign,
  Building,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { HistoryItem } from '../types';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory(100, 0);
      setHistory(res.items);
    } catch (err: any) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteHistoryItem(id);
      setHistory(history.filter((item) => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.clearHistory();
      setHistory([]);
      setSelectedItem(null);
      setConfirmClear(false);
    } catch (err: any) {
      alert(`Clear failed: ${err.message}`);
    }
  };

  const exportHistoryCSV = () => {
    if (history.length === 0) return;
    const headers = 'ID,Timestamp,PredictedPrice,Bedrooms,Bathrooms,SqFtLiving,ZIPCode\n';
    const rows = history
      .map((item) => {
        const f = item.features;
        return `${item.id},${item.created_at},${item.predicted_price},${f.bedrooms ?? ''},${f.bathrooms ?? ''},${f.sqft_living ?? ''},${f.zipcode ?? ''}`;
      })
      .join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'estately_prediction_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHistory = history.filter((item) => {
    const s = search.toLowerCase();
    const f = item.features;
    return (
      item.id.toLowerCase().includes(s) ||
      item.formatted_price.toLowerCase().includes(s) ||
      (f.zipcode && String(f.zipcode).includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5" /> Persistent SQLite Log
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            Prediction History
          </h2>
          <p className="text-xs text-slate-400">
            Persistent database history of property valuations calculated by trained models.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportHistoryCSV}
            disabled={history.length === 0}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Export CSV
          </button>
          <button
            onClick={() => setConfirmClear(true)}
            disabled={history.length === 0}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs border border-rose-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Clear History
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmClear && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>Are you sure you want to clear all prediction history from the database?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-lg bg-rose-500 text-slate-950 font-bold hover:bg-rose-400"
            >
              Yes, Clear All
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table & Toolbar */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search saved predictions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          {filteredHistory.length > 0 ? (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Prediction ID</th>
                  <th className="px-4 py-3 font-semibold">Timestamp</th>
                  <th className="px-4 py-3 font-semibold">Estimated Price</th>
                  <th className="px-4 py-3 font-semibold">Specs (Bed / Bath / SqFt)</th>
                  <th className="px-4 py-3 font-semibold">ZIP Code</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      {item.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400">
                      {item.formatted_price}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {item.features.bedrooms ?? '-'} bds • {item.features.bathrooms ?? '-'} ba • {item.features.sqft_living ?? '-'} sqft
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {item.features.zipcode ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              No prediction history found. Use "Predict Price" to generate saved estimates.
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl border border-slate-800 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Prediction Specification Detail
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
              <span className="text-xs text-slate-400">Valuation Price</span>
              <h4 className="text-2xl font-extrabold text-emerald-400">
                {selectedItem.formatted_price}
              </h4>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-800 max-h-60 overflow-y-auto">
              {Object.entries(selectedItem.features).map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5">
                  <span className="text-slate-400 capitalize">{k.replace('_', ' ')}</span>
                  <span className="font-semibold text-slate-200">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
