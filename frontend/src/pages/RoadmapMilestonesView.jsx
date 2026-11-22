import React from 'react';
import { 
  Calendar, 
  GitCommit, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function RoadmapMilestonesView({ milestones }) {
  const sprintTracks = [
    {
      sprint: "Sprint 24 (Current)",
      milestone: "Checkout Architecture Redesign",
      experiments: ["EXP-301 (Single-Page Apple Pay)", "EXP-302 (Gamified Onboarding)"],
      status: "ON_TRACK",
      risk: "LOW"
    },
    {
      sprint: "Sprint 25",
      milestone: "Vector Search Infrastructure & Pricing Refactor",
      experiments: ["EXP-303 (AI Semantic Autocomplete)", "EXP-304 (Annual Billing Toggle)"],
      status: "AT_RISK",
      risk: "HIGH",
      blocker: "Waiting on Elasticsearch to Pinecone cluster migration"
    },
    {
      sprint: "Sprint 26",
      milestone: "Real-time Telemetry WebSocket Bus",
      experiments: ["EXP-305 (Social Proof Toasts)", "EXP-306 (Dynamic Personalization)"],
      status: "ON_TRACK",
      risk: "MEDIUM"
    },
    {
      sprint: "Sprint 27",
      milestone: "One-Click Upsell & Passkey Auth Flow",
      experiments: ["EXP-307 (Post-Purchase Upsell)", "EXP-308 (Magic Link Login)"],
      status: "PLANNED",
      risk: "LOW"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span>Critical-Path Sprint Roadmap & Dependency Graph</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Synchronizes experiment runtime duration with engineering milestone releases.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 px-2.5 py-1 rounded-lg">
            Sprint Horizon: Q1 S24 - S27
          </span>
        </div>
      </div>

      {/* Gantt Milestone Timeline Cards */}
      <div className="space-y-4">
        {sprintTracks.map((track, idx) => {
          const isAtRisk = track.status === 'AT_RISK';
          const isCurrent = idx === 0;

          return (
            <div 
              key={idx}
              className={`p-5 rounded-xl border transition ${
                isCurrent
                  ? 'bg-slate-900 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300 text-xs font-mono font-bold">
                    {track.sprint}
                  </span>
                  <h3 className="text-sm font-bold text-white">{track.milestone}</h3>
                </div>

                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full w-fit ${
                  isAtRisk 
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' 
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {track.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Dependent Product Experiments:
                  </span>
                  <div className="space-y-1.5">
                    {track.experiments.map((exp, eIdx) => (
                      <div key={eIdx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 text-xs font-mono text-slate-200 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        <span>{exp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Engineering Dependency & Trade-off:
                  </span>
                  {track.blocker ? (
                    <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/60 text-xs text-rose-300 flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">Critical Path Blocked:</strong>
                        <span className="text-[11px] leading-relaxed">{track.blocker}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>All prerequisite services operational and instrumented.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
