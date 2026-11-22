// Experimentation Roadmap Simulator API Service
const API_BASE = 'http://localhost:8000';

export async function fetchExperiments() {
  try {
    const res = await fetch(`${API_BASE}/api/experiments`);
    if (!res.ok) throw new Error('Experiments fetch failed');
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function calculateMde(params) {
  try {
    const res = await fetch(`${API_BASE}/api/mde-calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('MDE calculation failed');
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchRoadmap() {
  try {
    const res = await fetch(`${API_BASE}/api/roadmap`);
    if (!res.ok) throw new Error('Roadmap fetch failed');
    return await res.json();
  } catch (e) {
    return null;
  }
}
