import React, { useState } from 'react';
import { 
  FlaskConical, 
  Sliders, 
  Play, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  DollarSign
} from 'lucide-react';

export default function MdePowerCalculatorView({ experiments }) {
  const [baselineRate, setBaselineRate] = useState(3.2); // 3.2%
  const [mdeRelative, setMdeRelative] = useState(5.0); // 5% lift target
  const [dailyVisitors, setDailyVisitors] = useState(15000);
  const [power, setPower] = useState(80); // 80%

  // Compute sample size using two-proportion z-test formula
  const p1 = baselineRate / 100;
  const delta = p1 * (mdeRelative / 100);
  const p2 = p1 + delta;
  const pBar = (p1 + p2) / 2;
  const zAlpha = 1.96; // 95% confidence
  const zBeta = power === 90 ? 1.28 : 0.84; // 80% or 90% power

  const numerator = Math.pow(zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
  const denominator = Math.pow(p2 - p1, 2);
  const samplePerVariant = Math.round(numerator / (denominator || 0.0001));
  const totalSample = samplePerVariant * 2;
  const requiredDays = Math.max(1, Math.ceil(totalSample / dailyVisitors));

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Sample Per Variant (N)</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-cyan-400 font-mono">
              {samplePerVariant.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">users / arm</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Total sample required: {totalSample.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Required Runtime</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {requiredDays} Days
            </span>
            <span className="text-xs text-emerald-500/80 font-medium">Full Cycles</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Avoid day-of-week seasonality bias
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Statistical Significance</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-purple-400 font-mono">95% Conf</span>
            <span className="text-xs text-slate-400">α = 0.05</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            False positive risk capped at 5%
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Statistical Power (1 - β)</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-blue-400 font-mono">{power}% Power</span>
            <span className="text-xs text-blue-500/80 font-medium">β = 0.20</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Guaranteed probability of detecting true lift
          </div>
        </div>
      </div>

      {/* Main Grid: Left Interactive Calculator / Right Experiments Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive MDE Slider Workbench */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Pre-Experiment MDE Simulator</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tune baseline and target lift to avoid underpowered test launches.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Baseline Conversion Rate (%):</span>
                  <span className="font-mono text-cyan-400 font-bold">{baselineRate}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="25.0"
                  step="0.5"
                  value={baselineRate}
                  onChange={(e) => setBaselineRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Minimum Detectable Effect (Relative Lift %):</span>
                  <span className="font-mono text-cyan-400 font-bold">+{mdeRelative}%</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="25.0"
                  step="0.5"
                  value={mdeRelative}
                  onChange={(e) => setMdeRelative(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="text-[10px] text-slate-500">
                  Target conversion: {(baselineRate * (1 + mdeRelative/100)).toFixed(2)}%
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Daily Eligible Visitors:</span>
                  <span className="font-mono text-cyan-400 font-bold">{dailyVisitors.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="50000"
                  step="1000"
                  value={dailyVisitors}
                  onChange={(e) => setDailyVisitors(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Statistical Power Threshold</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPower(80)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                      power === 80 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' 
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    80% Power (Industry Standard)
                  </button>
                  <button
                    onClick={() => setPower(90)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                      power === 90 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' 
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    90% Power (High Rigor)
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300 block">Sample Size Recommendation:</span>
              <p className="text-[11px] leading-relaxed">
                To reliably detect a <strong>+{mdeRelative}% relative increase</strong> from {baselineRate}%, run for at least <strong>{requiredDays} days</strong> with <strong>{samplePerVariant.toLocaleString()} users</strong> per variant.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Registered Hypotheses Directory */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              A/B Testing Hypothesis Backlog ({experiments.length})
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Sprint Planned</span>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {experiments.map((exp) => {
              const isRunning = exp.status === 'RUNNING';
              const isBlocked = exp.status === 'BLOCKED';

              return (
                <div
                  key={exp.id}
                  className="p-4 rounded-xl border bg-slate-900/60 border-slate-800 hover:bg-slate-900 transition"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-cyan-400 font-bold">{exp.id}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-slate-400 text-[11px]">{exp.sprint}</span>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isRunning 
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : isBlocked
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    }`}>
                      {exp.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">{exp.title}</h4>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Sample Req:</span>
                      <span className="text-slate-200">{exp.samplePerVariant.toLocaleString()} / arm</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Min Days:</span>
                      <span className="text-slate-200">{exp.durationDays} days</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px]">Projected Lift:</span>
                      <span className="text-emerald-400 font-bold">${(exp.projectedAnnualLiftUsd / 1000000).toFixed(2)}M</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
