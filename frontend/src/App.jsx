import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MdePowerCalculatorView from './pages/MdePowerCalculatorView';
import RoadmapMilestonesView from './pages/RoadmapMilestonesView';

const INITIAL_EXPERIMENTS = [
  {
    id: "EXP-301",
    title: "Single-Page Checkout with Apple Pay vs Multi-Step",
    baselineConversion: 3.2,
    mdePct: 5.0,
    power: 80,
    alpha: 0.05,
    samplePerVariant: 124500,
    durationDays: 14,
    sprint: "Sprint 24",
    dependency: "Stripe SDK Integration",
    status: "READY",
    risk: "MEDIUM",
    dailyTraffic: 18000,
    projectedAnnualLiftUsd: 1850000
  },
  {
    id: "EXP-302",
    title: "Gamified Onboarding Checklist vs Static Modal Wizard",
    baselineConversion: 14.5,
    mdePct: 10.0,
    power: 80,
    alpha: 0.05,
    samplePerVariant: 38200,
    durationDays: 10,
    sprint: "Sprint 24",
    dependency: "None",
    status: "RUNNING",
    risk: "LOW",
    dailyTraffic: 8000,
    projectedAnnualLiftUsd: 920000
  },
  {
    id: "EXP-303",
    title: "AI Semantic Search Autocomplete vs Standard Keyword",
    baselineConversion: 8.0,
    mdePct: 4.0,
    power: 80,
    alpha: 0.05,
    samplePerVariant: 185000,
    durationDays: 21,
    sprint: "Sprint 25",
    dependency: "Vector DB Search Cluster",
    status: "BLOCKED",
    risk: "HIGH",
    dailyTraffic: 22000,
    projectedAnnualLiftUsd: 2400000
  },
  {
    id: "EXP-304",
    title: "Annual Plan Default Toggle vs Monthly Billing on Pricing Table",
    baselineConversion: 6.5,
    mdePct: 8.0,
    power: 85,
    alpha: 0.05,
    samplePerVariant: 52000,
    durationDays: 12,
    sprint: "Sprint 25",
    dependency: "None",
    status: "READY",
    risk: "LOW",
    dailyTraffic: 9500,
    projectedAnnualLiftUsd: 1450000
  },
  {
    id: "EXP-305",
    title: "Social Proof Live Buyer Toast Notifications on Product Page",
    baselineConversion: 2.1,
    mdePct: 12.0,
    power: 80,
    alpha: 0.05,
    samplePerVariant: 68000,
    durationDays: 9,
    sprint: "Sprint 26",
    dependency: "WebSocket Event Bus",
    status: "PLANNED",
    risk: "LOW",
    dailyTraffic: 15000,
    projectedAnnualLiftUsd: 780000
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('mde');
  const [experiments, setExperiments] = useState(INITIAL_EXPERIMENTS);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const summary = {
    totalExperiments: experiments.length,
    runningCount: experiments.filter(e => e.status === 'RUNNING').length,
    blockedCount: experiments.filter(e => e.status === 'BLOCKED').length,
    projectedTotalLiftUsd: experiments.reduce((acc, e) => acc + e.projectedAnnualLiftUsd, 0)
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar 
          onRefresh={handleRefresh} 
          loading={loading} 
          summary={summary} 
        />

        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'mde' ? (
            <MdePowerCalculatorView experiments={experiments} />
          ) : (
            <RoadmapMilestonesView />
          )}
        </main>
      </div>
    </div>
  );
}
