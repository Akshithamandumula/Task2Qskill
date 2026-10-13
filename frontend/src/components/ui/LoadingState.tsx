import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading dataset & ML metrics...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 glass-card rounded-2xl border border-slate-800/80">
      <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-spin">
        <Loader2 className="w-8 h-8" />
      </div>
      <p className="text-sm font-medium text-slate-300 animate-pulse">{message}</p>
    </div>
  );
};
