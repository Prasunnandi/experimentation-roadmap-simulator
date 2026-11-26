import React, { useState, useMemo } from 'react';

/**
 * Multi-Team Engineering Capacity Planning & Allocation Grid
 * Simulates engineering bandwidth across Squads (Growth, Core, AI, Platform)
 * and disciplines (Frontend, Backend, ML, QA) with over-allocation bottleneck detection.
 */

const DEFAULT_SQUADS = [
  {
    id: 'squad-growth',
    name: 'Growth & Onboarding',
    color: '#3b82f6',
    members: {
      frontend: 3,
      backend: 2,
      ml: 1,
      qa: 1
    },
    initiatives: [
      { id: 'init-1', name: 'Self-Serve Checkout Funnel v2', fePts: 18, bePts: 14, mlPts: 0, qaPts: 8 },
      { id: 'init-2', name: 'Referral & Social Share Virality', fePts: 12, bePts: 8, mlPts: 5, qaPts: 5 }
    ]
  },
  {
    id: 'squad-ai',
    name: 'AI & Personalization',
    color: '#8b5cf6',
    members: {
      frontend: 1,
      backend: 3,
      ml: 4,
      qa: 1
    },
    initiatives: [
      { id: 'init-3', name: 'Real-time Vector Search Reranker', fePts: 5, bePts: 22, mlPts: 35, qaPts: 8 },
      { id: 'init-4', name: 'Contextual Bandit Recommendations', fePts: 4, bePts: 12, mlPts: 25, qaPts: 6 }
    ]
  },
  {
    id: 'squad-core',
    name: 'Core Experience & Web',
    color: '#10b981',
    members: {
      frontend: 4,
      backend: 3,
      ml: 0,
      qa: 2
    },
    initiatives: [
      { id: 'init-5', name: 'Design System Migration (Tokens)', fePts: 28, bePts: 6, mlPts: 0, qaPts: 12 },
      { id: 'init-6', name: 'GraphQL Federation & Client Cache', fePts: 16, bePts: 24, mlPts: 0, qaPts: 10 }
    ]
  },
  {
    id: 'squad-platform',
    name: 'Platform & Infra SRE',
    color: '#f59e0b',
    members: {
      frontend: 0,
      backend: 4,
      ml: 1,
      qa: 1
    },
    initiatives: [
      { id: 'init-7', name: 'Zero-Downtime Multi-Region Failover', fePts: 0, bePts: 32, mlPts: 8, qaPts: 14 },
      { id: 'init-8', name: 'Kafka Partition Rebalance & Tracing', fePts: 0, bePts: 20, mlPts: 0, qaPts: 6 }
    ]
  }
];

const DISCIPLINE_CONFIG = [
  { key: 'frontend', label: 'Frontend (FE)', ptsKey: 'fePts', badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { key: 'backend', label: 'Backend (BE)', ptsKey: 'bePts', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { key: 'ml', label: 'ML / Data', ptsKey: 'mlPts', badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { key: 'qa', label: 'QA / Automation', ptsKey: 'qaPts', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
];

export function CapacityGrid({
  pointsPerEngineerPerSprint = 10,
  sprintWeeks = 2
}) {
  const [squads, setSquads] = useState(DEFAULT_SQUADS);
  const [availabilityPct, setAvailabilityPct] = useState(85); // 85% focus factor (leaves 15% for meetings/on-call)
  const [activeTab, setActiveTab] = useState('all');

  // Compute capacity and allocations
  const simulation = useMemo(() => {
    let totalEngineers = 0;
    let totalCapPoints = 0;
    let totalCommittedPoints = 0;

    const squadSummaries = squads.map((squad) => {
      let squadEngineers = 0;
      let squadCapacity = 0;
      let squadCommitted = 0;

      const roles = {};

      DISCIPLINE_CONFIG.forEach((d) => {
        const headcount = squad.members[d.key] || 0;
        const grossCapacity = headcount * pointsPerEngineerPerSprint;
        const netCapacity = Math.round(grossCapacity * (availabilityPct / 100));

        const committed = squad.initiatives.reduce((sum, init) => sum + (init[d.ptsKey] || 0), 0);
        const utilization = netCapacity > 0 ? Math.round((committed / netCapacity) * 100) : committed > 0 ? 999 : 0;

        roles[d.key] = {
          headcount,
          netCapacity,
          committed,
          utilization,
          isOverAllocated: committed > netCapacity
        };

        squadEngineers += headcount;
        squadCapacity += netCapacity;
        squadCommitted += committed;
      });

      totalEngineers += squadEngineers;
      totalCapPoints += squadCapacity;
      totalCommittedPoints += squadCommitted;

      const squadUtil = squadCapacity > 0 ? Math.round((squadCommitted / squadCapacity) * 100) : 0;

      return {
        ...squad,
        squadEngineers,
        squadCapacity,
        squadCommitted,
        squadUtil,
        roles,
        hasBottleneck: Object.values(roles).some((r) => r.isOverAllocated)
      };
    });

    const overallUtil = totalCapPoints > 0 ? Math.round((totalCommittedPoints / totalCapPoints) * 100) : 0;

    return {
      totalEngineers,
      totalCapPoints,
      totalCommittedPoints,
      overallUtil,
      squadSummaries
    };
  }, [squads, pointsPerEngineerPerSprint, availabilityPct]);

  // Handle initiative point adjustment
  const updateInitiativePoints = (squadId, initId, field, delta) => {
    setSquads((prev) =>
      prev.map((sq) => {
        if (sq.id !== squadId) return sq;
        return {
          ...sq,
          initiatives: sq.initiatives.map((init) => {
            if (init.id !== initId) return init;
            const current = init[field] || 0;
            const updated = Math.max(0, current + delta);
            return { ...init, [field]: updated };
          })
        };
      })
    );
  };

  const filteredSquads = activeTab === 'all'
    ? simulation.squadSummaries
    : simulation.squadSummaries.filter((s) => s.id === activeTab);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
      {/* Header & Global KPIs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/50" />
            <h2 className="text-xl font-bold tracking-tight">Engineering Capacity Planning Grid</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate sprint commitments ({sprintWeeks}-week cycle) across engineering disciplines with automated bottleneck alerts.
          </p>
        </div>

        {/* Global KPI Chips */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Headcount</div>
            <div className="text-sm font-bold text-white font-mono">{simulation.totalEngineers} Eng</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Net Bandwidth</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">{simulation.totalCapPoints} pts</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Committed</div>
            <div className="text-sm font-bold text-indigo-400 font-mono">{simulation.totalCommittedPoints} pts</div>
          </div>
          <div className={`border px-3 py-1.5 rounded-xl text-center ${
            simulation.overallUtil > 100
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
          }`}>
            <div className="text-[10px] uppercase font-mono">Total Load</div>
            <div className="text-sm font-bold font-mono">{simulation.overallUtil}%</div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4 border-b border-slate-800/80">
        {/* Squad Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Squads ({simulation.squadSummaries.length})
          </button>
          {simulation.squadSummaries.map((sq) => (
            <button
              key={sq.id}
              onClick={() => setActiveTab(sq.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === sq.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sq.color }} />
              {sq.name}
              {sq.hasBottleneck && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Bottleneck!" />}
            </button>
          ))}
        </div>

        {/* Availability / Focus Slider */}
        <div className="flex items-center gap-3 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/50">
          <label className="text-xs text-slate-300 font-medium">Sprint Focus:</label>
          <input
            type="range"
            min="60"
            max="100"
            step="5"
            value={availabilityPct}
            onChange={(e) => setAvailabilityPct(Number(e.target.value))}
            className="w-24 accent-indigo-500 cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-indigo-400">{availabilityPct}%</span>
        </div>
      </div>

      {/* Squad Cards Grid */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        {filteredSquads.map((squad) => (
          <div
            key={squad.id}
            className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 hover:border-slate-700/80 transition-all"
          >
            {/* Squad Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700/50 gap-2">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: squad.color }} />
                <h3 className="text-base font-semibold text-white">{squad.name}</h3>
                <span className="text-xs text-slate-400 font-mono">({squad.squadEngineers} Engineers)</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-slate-400">
                  Allocated: <b className="text-white">{squad.squadCommitted}</b> / {squad.squadCapacity} pts
                </span>
                <span className={`px-2 py-0.5 rounded font-bold ${
                  squad.squadUtil > 100
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {squad.squadUtil}% Load
                </span>
              </div>
            </div>

            {/* Discipline Bandwidth Meters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 border-b border-slate-700/40">
              {DISCIPLINE_CONFIG.map((d) => {
                const role = squad.roles[d.key];
                const pct = Math.min(role.utilization, 150);
                return (
                  <div key={d.key} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">{d.label}</span>
                      <span className="font-mono text-[11px] text-slate-400">{role.headcount} eng</span>
                    </div>
                    <div className="flex items-baseline justify-between font-mono text-xs mb-2">
                      <span className="text-white font-bold">{role.committed} pts</span>
                      <span className="text-slate-500 text-[11px]">/ {role.netCapacity} pts</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          role.isOverAllocated ? 'bg-rose-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    {role.isOverAllocated && (
                      <div className="text-[10px] text-rose-400 font-medium mt-1.5 flex items-center gap-1">
                        <span>⚠️ Deficit: -{role.committed - role.netCapacity} pts</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Initiatives Allocation Table */}
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Sprint Initiatives & Story Point Allocations
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800 pb-1">
                      <th className="py-2 font-medium">Initiative</th>
                      {DISCIPLINE_CONFIG.map((d) => (
                        <th key={d.key} className="py-2 text-center font-medium">{d.label}</th>
                      ))}
                      <th className="py-2 text-right font-medium">Total Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {squad.initiatives.map((init) => {
                      const initTotal =
                        (init.fePts || 0) + (init.bePts || 0) + (init.mlPts || 0) + (init.qaPts || 0);
                      return (
                        <tr key={init.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 font-sans font-medium text-slate-200">
                            {init.name}
                          </td>
                          {DISCIPLINE_CONFIG.map((d) => (
                            <td key={d.key} className="py-2.5 text-center">
                              <div className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                                <button
                                  onClick={() => updateInitiativePoints(squad.id, init.id, d.ptsKey, -2)}
                                  className="text-slate-500 hover:text-rose-400 px-1 font-bold"
                                  title="Reduce 2 pts"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center text-white">{init[d.ptsKey] || 0}</span>
                                <button
                                  onClick={() => updateInitiativePoints(squad.id, init.id, d.ptsKey, 2)}
                                  className="text-slate-500 hover:text-emerald-400 px-1 font-bold"
                                  title="Add 2 pts"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                          ))}
                          <td className="py-2.5 text-right font-bold text-indigo-300">
                            {initTotal} pts
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CapacityGrid;
