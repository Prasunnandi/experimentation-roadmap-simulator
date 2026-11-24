/**
 * Monte Carlo Sprint Velocity & Delivery Date Simulator
 * Executes 10,000 stochastic iterations modeling delivery probabilities under backlog scope and velocity variance.
 */

export class MonteCarloSprintSimulator {
  /**
   * @param {Object} options
   * @param {number} [options.iterations=10000] - Number of simulation trials
   * @param {number} [options.sprintDurationDays=14] - Length of a single sprint in calendar days
   */
  constructor(options = {}) {
    this.iterations = options.iterations || 10000;
    this.sprintDurationDays = options.sprintDurationDays || 14;
  }

  /**
   * Simulate roadmap delivery timeline
   * @param {Object} params
   * @param {Object} params.backlogScope - Story points or item counts
   * @param {number} params.backlogScope.optimistic - Low estimate (points)
   * @param {number} params.backlogScope.mostLikely - Nominal estimate (points)
   * @param {number} params.backlogScope.pessimistic - High estimate with scope creep (points)
   * @param {Array<number>} params.historicalVelocities - Array of points completed in past sprints
   * @param {string} [params.startDate] - ISO start date (defaults to current date)
   * @returns {Object} Forecast distribution with 50%, 85%, and 95% delivery confidence percentiles
   */
  simulate(params) {
    const { backlogScope, historicalVelocities, startDate } = params;

    if (!historicalVelocities || historicalVelocities.length === 0) {
      throw new Error('Historical velocities array must contain at least one past sprint record');
    }

    const start = startDate ? new Date(startDate) : new Date();
    const simulatedSprints = new Array(this.iterations);

    for (let i = 0; i < this.iterations; i++) {
      // Sample total backlog scope using PERT / triangular distribution
      const scope = this._samplePert(
        backlogScope.optimistic,
        backlogScope.mostLikely,
        backlogScope.pessimistic
      );

      let remaining = scope;
      let sprintsCount = 0;

      // Simulate sprint-by-sprint completion until backlog is depleted
      while (remaining > 0) {
        sprintsCount++;
        // Randomly sample velocity from empirical history with Gaussian jitter
        const velocitySample = this._sampleVelocity(historicalVelocities);
        remaining -= velocitySample;

        // Safety circuit breaker
        if (sprintsCount > 200) break;
      }

      simulatedSprints[i] = sprintsCount;
    }

    // Sort to compute empirical percentiles
    simulatedSprints.sort((a, b) => a - b);

    const p50Sprints = simulatedSprints[Math.floor(this.iterations * 0.50)];
    const p75Sprints = simulatedSprints[Math.floor(this.iterations * 0.75)];
    const p85Sprints = simulatedSprints[Math.floor(this.iterations * 0.85)];
    const p95Sprints = simulatedSprints[Math.floor(this.iterations * 0.95)];

    const p50Date = this._addDays(start, p50Sprints * this.sprintDurationDays);
    const p85Date = this._addDays(start, p85Sprints * this.sprintDurationDays);
    const p95Date = this._addDays(start, p95Sprints * this.sprintDurationDays);

    // Generate probability histogram
    const histogram = {};
    for (const val of simulatedSprints) {
      histogram[val] = (histogram[val] || 0) + 1;
    }

    const cdf = [];
    let cumulative = 0;
    const sortedKeys = Object.keys(histogram).map(Number).sort((a, b) => a - b);

    for (const key of sortedKeys) {
      cumulative += histogram[key];
      cdf.push({
        sprints: key,
        days: key * this.sprintDurationDays,
        targetDate: this._addDays(start, key * this.sprintDurationDays).toISOString().split('T')[0],
        probability: Number(((histogram[key] / this.iterations) * 100).toFixed(2)),
        cumulativeConfidencePct: Number(((cumulative / this.iterations) * 100).toFixed(2))
      });
    }

    return {
      simulationIterations: this.iterations,
      sprintDurationDays: this.sprintDurationDays,
      forecast: {
        p50: {
          sprintsNeeded: p50Sprints,
          totalDays: p50Sprints * this.sprintDurationDays,
          estimatedDate: p50Date.toISOString().split('T')[0],
          confidenceLevel: '50% (Median / Coin Flip)'
        },
        p85: {
          sprintsNeeded: p85Sprints,
          totalDays: p85Sprints * this.sprintDurationDays,
          estimatedDate: p85Date.toISOString().split('T')[0],
          confidenceLevel: '85% (Agile Target Commitment)'
        },
        p95: {
          sprintsNeeded: p95Sprints,
          totalDays: p95Sprints * this.sprintDurationDays,
          estimatedDate: p95Date.toISOString().split('T')[0],
          confidenceLevel: '95% (High Assurance / Contractual SLA)'
        }
      },
      distribution: cdf
    };
  }

  _samplePert(opt, likely, pess) {
    // Modified PERT Beta distribution approximation
    const u = Math.random();
    const mean = (opt + 4 * likely + pess) / 6;
    const stdDev = (pess - opt) / 6;
    // Box-Muller transform for normal perturbation around PERT mean
    const z = Math.sqrt(-2.0 * Math.log(Math.max(1e-6, Math.random()))) * Math.cos(2.0 * Math.PI * Math.random());
    const sample = mean + (z * stdDev);
    return Math.max(opt, Math.min(pess, sample));
  }

  _sampleVelocity(velocities) {
    const rawPick = velocities[Math.floor(Math.random() * velocities.length)];
    // Apply slight standard deviation variance (+/- 10%)
    const variance = (Math.random() - 0.5) * 0.2 * rawPick;
    return Math.max(1, rawPick + variance);
  }

  _addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

export default MonteCarloSprintSimulator;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MonteCarloSprintSimulator;
  module.exports.MonteCarloSprintSimulator = MonteCarloSprintSimulator;
}
