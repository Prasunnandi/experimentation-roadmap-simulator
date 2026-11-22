import express from 'express';
import cors from 'cors';
import { experiments, roadmapMilestones } from './data.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

let experimentList = [...experiments];

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'experimentation-roadmap-simulator', timestamp: new Date().toISOString() });
});

app.get('/api/experiments', (req, res) => {
  res.json({
    experiments: experimentList,
    summary: {
      totalExperiments: experimentList.length,
      runningCount: experimentList.filter(e => e.status === 'RUNNING').length,
      blockedCount: experimentList.filter(e => e.status === 'BLOCKED').length,
      projectedTotalLiftUsd: experimentList.reduce((acc, e) => acc + e.projectedAnnualLiftUsd, 0)
    }
  });
});

// Dynamic MDE Sample Size Calculator (Two-Proportion Z-Test)
app.post('/api/mde-calculate', (req, res) => {
  const { baselineRatePct, mdeRelativePct, powerPct = 80, alpha = 0.05, dailyVisitors = 10000 } = req.body;
  
  const p1 = Number(baselineRatePct) / 100;
  const delta = p1 * (Number(mdeRelativePct) / 100);
  const p2 = p1 + delta;
  const pBar = (p1 + p2) / 2;

  // Z-scores: alpha=0.05 (two-tailed) -> 1.96, power=80% -> 0.84, power=90% -> 1.28
  const zAlpha = 1.96;
  const zBeta = powerPct >= 90 ? 1.28 : 0.84;

  const numerator = Math.pow(zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
  const denominator = Math.pow(p2 - p1, 2);
  const samplePerVariant = Math.round(numerator / denominator);
  const totalSample = samplePerVariant * 2;
  const requiredDays = Math.ceil(totalSample / Number(dailyVisitors));

  res.json({
    baselineRatePct: Number(baselineRatePct),
    mdeRelativePct: Number(mdeRelativePct),
    samplePerVariant,
    totalSample,
    estimatedDays: requiredDays,
    statisticalPowerPct: powerPct,
    confidenceLevelPct: 95
  });
});

app.get('/api/roadmap', (req, res) => {
  res.json({ milestones: roadmapMilestones });
});

app.listen(PORT, () => {
  console.log(`Experimentation Roadmap Simulator API running on port ${PORT}`);
});
