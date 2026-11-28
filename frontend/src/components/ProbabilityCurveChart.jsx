import React, { useState, useMemo } from 'react';
import { TrendingUp, Calendar, AlertCircle, CheckCircle2, Sliders, ShieldCheck } from 'lucide-react';

/**
 * Probability Distribution Curve for Project Launch Milestones
 * Renders Monte Carlo P10, P50, and P90 confidence interval distributions
 * with interactive probability density curves, shaded confidence regions, and milestone switcher.
 */

const DEFAULT_MILESTONES = [
  {
    id: 'm-checkout',
    name: 'Checkout Architecture Redesign',
    sprint: 'Sprint 24',
    p10Days: 14,
    p50Days: 21,
    p90Days: 32,
    stdDev: 5.5,
    targetDate: '2026-12-18',
    confidenceScorePct: 88.5
  },
  {
    id: 'm-vector-search',
    name: 'Vector Search & Pricing Refactor',
    sprint: 'Sprint 25',
    p10Days: 22,
    p50Days: 35,
    p90Days: 54,
    stdDev: 9.8,
    targetDate: '2027-01-15',
    confidenceScorePct: 64.2
  },
  {
    id: 'm-passkey',
    name: 'Passkey Auth & One-Click Upsell',
    sprint: 'Sprint 27',
    p10Days: 10,
    p50Days: 16,
    p90Days: 24,
    stdDev: 4.2,
    targetDate: '2027-02-05',
    confidenceScorePct: 92.0
  }
];

export default function ProbabilityCurveChart({ milestones = DEFAULT_MILESTONES }) {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(milestones[0]?.id || 'm-checkout');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const activeMilestone = useMemo(() => {
    return milestones.find(m => m.id === selectedMilestoneId) || milestones[0];
  }, [milestones, selectedMilestoneId]);

  // Generate continuous probability distribution points (Gaussian / Log-Normal approximation)
  const chartData = useMemo(() => {
    if (!activeMilestone) return { points: [], minX: 0, maxX: 100, maxY: 1 };

    const mu = activeMilestone.p50Days;
    const sigma = activeMilestone.stdDev || 5.0;

    const minX = Math.max(1, Math.floor(mu - 3.2 * sigma));
    const maxX = Math.ceil(mu + 3.5 * sigma);
    const step = (maxX - minX) / 80;

    let points = [];
    let maxY = 0;

    for (let x = minX; x <= maxX; x += step) {
      // Gaussian Probability Density Function
      const exponent = -Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2));
      const pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
      
      // Cumulative Distribution Function approximation (Error function)
      const z = (x - mu) / (sigma * Math.sqrt(2));
      const cdf = 0.5 * (1 + Math.sign(z) * Math.sqrt(1 - Math.exp(-Math.pow(z, 2) * (4 / Math.PI + 0.147 * Math.pow(z, 2)) / (1 + 0.147 * Math.pow(z, 2)))));

      if (pdf > maxY) maxY = pdf;

      points.push({
        days: Number(x.toFixed(1)),
        pdf: Number(pdf.toFixed(4)),
        cdf: Math.min(100, Math.max(0, Number((cdf * 100).toFixed(1)))),
        inP10P90Zone: x >= activeMilestone.p10Days && x <= activeMilestone.p90Days
      });
    }

    return { points, minX, maxX, maxY: maxY * 1.15 };
  }, [activeMilestone]);

  // SVG coordinate transformation
  const svgWidth = 720;
  const svgHeight = 260;
  const padding = { top: 25, right: 35, bottom: 40, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const scaleX = x => padding.left + ((x - chartData.minX) / (chartData.maxX - chartData.minX || 1)) * graphWidth;
  const scaleY = y => padding.top + graphHeight - (y / (chartData.maxY || 1)) * graphHeight;

  // Path generators
  const fullCurvePath = useMemo(() => {
    if (!chartData.points.length) return '';
    return chartData.points.reduce((acc, pt, i) => {
      const x = scaleX(pt.days);
      const y = scaleY(pt.pdf);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [chartData]);

  const p10P90AreaPath = useMemo(() => {
    const zonePoints = chartData.points.filter(p => p.inP10P90Zone);
    if (!zonePoints.length) return '';
    const startX = scaleX(zonePoints[0].days);
    const endX = scaleX(zonePoints[zonePoints.length - 1].days);
    const baselineY = scaleY(0);

    const curvePart = zonePoints.map(pt => `L ${scaleX(pt.days)} ${scaleY(pt.pdf)}`).join(' ');
    return `M ${startX} ${baselineY} ${curvePart} L ${endX} ${baselineY} Z`;
  }, [chartData]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
      {/* Header and Milestone Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Monte Carlo Delivery Probability Curve</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Statistical confidence distribution forecasting delivery milestone completion timelines.
          </p>
        </div>

        {/* Milestone switcher dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-mono">Milestone:</span>
          <select
            value={selectedMilestoneId}
            onChange={e => setSelectedMilestoneId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-mono"
          >
            {milestones.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.sprint})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-950/80 border border-emerald-900/40 rounded-lg p-3">
          <div className="text-[11px] font-mono text-emerald-400 flex items-center justify-between">
            <span>P10 (Optimistic)</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px]">10% Chance</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {activeMilestone.p10Days} <span className="text-xs font-normal text-slate-400">days</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-indigo-900/40 rounded-lg p-3">
          <div className="text-[11px] font-mono text-indigo-400 flex items-center justify-between">
            <span>P50 (Median)</span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px]">Expected</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {activeMilestone.p50Days} <span className="text-xs font-normal text-slate-400">days</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-amber-900/40 rounded-lg p-3">
          <div className="text-[11px] font-mono text-amber-400 flex items-center justify-between">
            <span>P90 (Conservative)</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px]">90% Certain</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {activeMilestone.p90Days} <span className="text-xs font-normal text-slate-400">days</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>On-Time Confidence</span>
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {activeMilestone.confidenceScorePct}%
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative bg-slate-950 border border-slate-800/80 rounded-xl p-3 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto cursor-crosshair"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="p10P90Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding.left} y1={scaleY(0)} x2={svgWidth - padding.right} y2={scaleY(0)} stroke="#334155" strokeWidth="1" />
          
          {/* Shaded 80% Confidence Region (P10 to P90) */}
          <path d={p10P90AreaPath} fill="url(#p10P90Grad)" />

          {/* Full Distribution Curve */}
          <path d={fullCurvePath} fill="none" stroke="#818cf8" strokeWidth="2.5" />

          {/* Vertical Milestone Markers */}
          {/* P10 Marker */}
          <line
            x1={scaleX(activeMilestone.p10Days)}
            y1={padding.top}
            x2={scaleX(activeMilestone.p10Days)}
            y2={scaleY(0)}
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text x={scaleX(activeMilestone.p10Days)} y={padding.top - 6} fill="#10b981" fontSize="10" textAnchor="middle" fontFamily="monospace">
            P10 ({activeMilestone.p10Days}d)
          </text>

          {/* P50 Marker */}
          <line
            x1={scaleX(activeMilestone.p50Days)}
            y1={padding.top}
            x2={scaleX(activeMilestone.p50Days)}
            y2={scaleY(0)}
            stroke="#6366f1"
            strokeWidth="2"
          />
          <text x={scaleX(activeMilestone.p50Days)} y={padding.top - 6} fill="#818cf8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            P50 ({activeMilestone.p50Days}d)
          </text>

          {/* P90 Marker */}
          <line
            x1={scaleX(activeMilestone.p90Days)}
            y1={padding.top}
            x2={scaleX(activeMilestone.p90Days)}
            y2={scaleY(0)}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text x={scaleX(activeMilestone.p90Days)} y={padding.top - 6} fill="#f59e0b" fontSize="10" textAnchor="middle" fontFamily="monospace">
            P90 ({activeMilestone.p90Days}d)
          </text>

          {/* Axis Labels */}
          <text x={padding.left} y={scaleY(0) + 20} fill="#64748b" fontSize="10" fontFamily="monospace">
            {chartData.minX} days
          </text>
          <text x={svgWidth - padding.right} y={scaleY(0) + 20} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">
            {chartData.maxX} days
          </text>
          <text x={svgWidth / 2} y={scaleY(0) + 24} fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="monospace">
            Calendar Delivery Duration (Days)
          </text>
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-5 mt-2 text-xs text-slate-400 font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 rounded"></span>
            <span>P10: 10% Chance (Aggressive)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-indigo-500 rounded"></span>
            <span>P50: 50% Median (Expected)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-amber-500 rounded"></span>
            <span>P90: 90% Commitment (Buffer)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-indigo-500/30 border border-indigo-400/50 rounded-sm"></span>
            <span>80% Confidence Interval</span>
          </div>
        </div>
      </div>
    </div>
  );
}
