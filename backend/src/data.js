// A/B Testing Power & Milestone Roadmap Simulator Dataset

export const experiments = [
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

export const roadmapMilestones = [
  { id: "M1", title: "Checkout Architecture Redesign", sprint: "Sprint 24", status: "ON_TRACK", dependencies: [] },
  { id: "M2", title: "Vector Search Infrastructure", sprint: "Sprint 24-25", status: "AT_RISK", dependencies: ["Elasticsearch Migration"] },
  { id: "M3", title: "Pricing & Billing Engine Refactor", sprint: "Sprint 25", status: "ON_TRACK", dependencies: ["M1"] },
  { id: "M4", title: "Real-time Telemetry WebSocket Bus", sprint: "Sprint 26", status: "ON_TRACK", dependencies: [] }
];
