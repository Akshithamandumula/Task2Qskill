import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  Search,
  ArrowUpDown,
  Download,
  AlertCircle,
  CheckCircle2,
  Filter,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { DatasetStatus, DatasetPreview, DatasetQuality } from '../types';

interface ExplorerPageProps {
  datasetStatus: DatasetStatus | null;
  refreshDataset: () => void;
}

export const ExplorerPage: React.FC<ExplorerPageProps> = ({ datasetStatus, refreshDataset }) => {
  const [preview, setPreview] = useState<DatasetPreview | null>(null);
  const [quality, setQuality] = useState<DatasetQuality | null>(null);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(25);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDesc, setSortDesc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prevData, qualData] = await Promise.all([
        api.getDatasetPreview(limit, search, sortBy, sortDesc),
        api.getDatasetQuality(),
      ]);
      setPreview(prevData);
      setQuality(qualData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dataset preview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [limit, search, sortBy, sortDesc]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    setError(null);
    try {
      await api.uploadDataset(file);
      refreshDataset();
      await loadData();
    } catch (err: any) {
      setError(err.message || 'CSV upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(col);
      setSortDesc(false);
    }
  };

  const exportToCSV = () => {
    if (!preview || preview.data.length === 0) return;
    const headers = preview.columns.join(',');
    const rows = preview.data.map((row) =>
      preview.columns.map((col) => JSON.stringify(row[col] ?? '')).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `estately_filtered_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
            <Database className="w-3.5 h-3.5" /> Data Inspection & Exploration
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            Dataset Explorer
          </h2>
          <p className="text-xs text-slate-400">
            Inspect raw housing records, search columns, sort fields, and review missing value distributions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 cursor-pointer flex items-center gap-2 transition-all">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>{uploading ? 'Uploading...' : 'Upload Custom CSV'}</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Total Rows</span>
          <h4 className="text-xl font-bold text-slate-100 mt-1">
            {datasetStatus?.row_count.toLocaleString() ?? 0}
          </h4>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Total Features</span>
          <h4 className="text-xl font-bold text-slate-100 mt-1">
            {datasetStatus?.column_count ?? 0} Columns
          </h4>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Duplicates Found</span>
          <h4 className="text-xl font-bold text-slate-100 mt-1">
            {quality?.duplicate_rows ?? 0} Rows
          </h4>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Data Health Score</span>
          <h4 className="text-xl font-bold text-emerald-400 mt-1">
            {quality?.data_quality_score ?? 0}%
          </h4>
        </div>
      </div>

      {/* Table Filters & Toolbar */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search dataset records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Show:</span>
            {[10, 25, 50, 100].map((num) => (
              <button
                key={num}
                onClick={() => setLimit(num)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  limit === num
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
              <span>Filtering records...</span>
            </div>
          ) : preview && preview.data.length > 0 ? (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  {preview.columns.map((col) => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className="px-4 py-3 font-semibold cursor-pointer hover:text-emerald-400 select-none whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col}</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {preview.data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                    {preview.columns.map((col) => (
                      <td key={col} className="px-4 py-2.5 whitespace-nowrap">
                        {col === 'price' && typeof row[col] === 'number'
                          ? `$${row[col].toLocaleString()}`
                          : row[col] !== null
                          ? String(row[col])
                          : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              No matching records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
