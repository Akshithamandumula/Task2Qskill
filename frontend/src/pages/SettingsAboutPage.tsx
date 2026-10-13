import React from 'react';
import {
  Settings,
  Database,
  ExternalLink,
  Key,
  ShieldCheck,
  Building,
  Terminal,
  FileCode,
  Info
} from 'lucide-react';

export const SettingsAboutPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5" /> Documentation & Environment Guide
        </div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
          Settings & Dataset Setup Guide
        </h2>
        <p className="text-xs text-slate-400">
          Kaggle House Sales in King County dataset setup, architecture details, and Kaggle API configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kaggle Dataset Instructions */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Database className="w-4 h-4 text-emerald-400" /> Kaggle Dataset Download Guide
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The platform is pre-loaded with the <strong>King County, USA House Sales dataset</strong> (2014-2015).
            You can download the full original dataset directly from Kaggle:
          </p>

          <a
            href="https://www.kaggle.com/datasets/harlfoxem/housesalesprediction"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-semibold text-xs border border-emerald-500/30 transition-all"
          >
            <span>Kaggle House Sales Dataset Reference</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-200">Manual Setup Location:</h4>
            <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800">
              backend/data/kc_house_data.csv
            </div>
          </div>
        </div>

        {/* Kaggle API Setup Guide */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Terminal className="w-4 h-4 text-cyan-400" /> Kaggle API Downloading
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            To use the Kaggle CLI tool to download updates directly into the backend directory:
          </p>

          <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1">
            <p className="text-slate-500"># Install Kaggle CLI</p>
            <p className="text-emerald-400">pip install kaggle</p>
            <p className="text-slate-500 pt-1"># Place kaggle.json in ~/.kaggle/</p>
            <p className="text-emerald-400">kaggle datasets download -d harlfoxem/housesalesprediction -p backend/data/ --unzip</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Never commit Kaggle API tokens or secrets to source control repositories.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
