import React from 'react';
import { 
  FlaskConical, 
  RefreshCw, 
  DollarSign, 
  CheckCircle, 
  Layers,
  Activity,
  Calendar
} from 'lucide-react';

export default function Navbar({ onRefresh, loading, summary }) {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 font-mono">Experiment Program: Growth & Conversion</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Power Simulation Calibrated</span>
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {summary && (
          <div className="hidden lg:flex items-center space-x-4 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Projected Lift:</span>
              <span className="font-semibold text-emerald-400">${(summary.projectedTotalLiftUsd / 1000000).toFixed(2)}M</span>
            </div>
            <div className="w-px h-3 bg-slate-700" />
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Active Tests:</span>
              <span className="font-semibold text-cyan-400">{summary.runningCount}</span>
            </div>
            <div className="w-px h-3 bg-slate-700" />
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Total Hypotheses:</span>
              <span className="font-semibold text-purple-400">{summary.totalExperiments}</span>
            </div>
          </div>
        )}

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Sync Plan</span>
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-cyan-500/30">
          PM
        </div>
      </div>
    </header>
  );
}
