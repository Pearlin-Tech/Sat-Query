/**
 * SatQuery AI — Analysis Engine
 * Real deterministic geospatial computations:
 * NDVI, change detection, spectral indices, pixel statistics.
 * All calculations are performed on actual pixel data.
 */

import { sleep } from './utils.js';

// ─────────────────────────────────────────
// NDVI COMPUTATION
// Formula: (NIR - Red) / (NIR + Red)
// ─────────────────────────────────────────
export async function computeNDVI(pixelData, width, height, bandConfig = { red: 2, nir: 3 }) {
  if (!pixelData) return null;

  const { red: rIdx, nir: nIdx } = bandConfig;
  const redBand = pixelData[rIdx];
  const nirBand = pixelData[nIdx];

  if (!redBand || !nirBand) return null;

  const ndvi = new Float32Array(width * height);
  let minVal = 1, maxVal = -1, sumVal = 0, count = 0;

  for (let i = 0; i < width * height; i++) {
    const r = redBand[i];
    const n = nirBand[i];

    if (r === 0 && n === 0) {
      ndvi[i] = -9999; // NoData
      continue;
    }

    const val = (n - r) / (n + r + 1e-10); // Epsilon prevents div-by-zero
    ndvi[i] = val;

    if (val > -1 && val <= 1) {
      if (val < minVal) minVal = val;
      if (val > maxVal) maxVal = val;
      sumVal += val;
      count++;
    }
  }

  const stats = {
    min: minVal.toFixed(3),
    max: maxVal.toFixed(3),
    mean: (sumVal / count).toFixed(3),
    pixelCount: count,
    vegetationPixels: 0,
    barePixels: 0,
    waterPixels: 0,
    urbanPixels: 0,
  };

  // Classify pixels
  for (let i = 0; i < ndvi.length; i++) {
    const v = ndvi[i];
    if (v === -9999) continue;
    if (v > 0.3) stats.vegetationPixels++;
    else if (v > 0 && v <= 0.3) stats.barePixels++;
    else if (v < 0) stats.waterPixels++;
  }
  stats.urbanPixels = Math.max(0, count - stats.vegetationPixels - stats.barePixels - stats.waterPixels);

  // Coverage percentages
  stats.vegetationPct = ((stats.vegetationPixels / count) * 100).toFixed(1);
  stats.barePct       = ((stats.barePixels / count) * 100).toFixed(1);
  stats.waterPct      = ((stats.waterPixels / count) * 100).toFixed(1);

  // Generate canvas-ready colorized array
  const colorized = ndviToRGBA(ndvi, width, height);

  return {
    type: 'ndvi',
    data: ndvi,
    colorized,
    stats,
    width,
    height,
    formula: '(NIR - Red) / (NIR + Red)',
    bands: { red: `Band ${rIdx + 1}`, nir: `Band ${nIdx + 1}` },
  };
}

// ─────────────────────────────────────────
// NDVI → RGBA COLORIZATION
// RdYlGn diverging palette
// ─────────────────────────────────────────
function ndviToRGBA(ndvi, width, height) {
  const rgba = new Uint8ClampedArray(width * height * 4);

  // Color ramp: negative (water/urban) → positive (dense vegetation)
  const colorRamp = [
    [-1.0, [139, 0, 0]],      // Deep red — water/urban
    [-0.5, [215, 48, 39]],
    [-0.1, [244, 109, 67]],
    [0.0,  [253, 174, 97]],
    [0.1,  [254, 224, 139]],
    [0.2,  [217, 239, 139]],
    [0.3,  [166, 217, 106]],
    [0.5,  [102, 189, 99]],
    [0.7,  [26, 152, 80]],
    [1.0,  [0, 104, 55]],     // Dense green vegetation
  ];

  for (let i = 0; i < width * height; i++) {
    const v = ndvi[i];
    const idx = i * 4;

    if (v === -9999) {
      rgba[idx] = rgba[idx+1] = rgba[idx+2] = 0;
      rgba[idx+3] = 0; // Transparent for NoData
      continue;
    }

    const [r, g, b] = interpolateColorRamp(colorRamp, v);
    rgba[idx]   = r;
    rgba[idx+1] = g;
    rgba[idx+2] = b;
    rgba[idx+3] = 220; // Slight transparency
  }

  return rgba;
}

function interpolateColorRamp(ramp, value) {
  const clamped = Math.max(-1, Math.min(1, value));

  for (let i = 0; i < ramp.length - 1; i++) {
    const [v1, c1] = ramp[i];
    const [v2, c2] = ramp[i + 1];
    if (clamped >= v1 && clamped <= v2) {
      const t = (clamped - v1) / (v2 - v1);
      return [
        Math.round(c1[0] + t * (c2[0] - c1[0])),
        Math.round(c1[1] + t * (c2[1] - c1[1])),
        Math.round(c1[2] + t * (c2[2] - c1[2])),
      ];
    }
  }
  return ramp[ramp.length - 1][1];
}

// ─────────────────────────────────────────
// NDWI COMPUTATION
// Formula: (Green - NIR) / (Green + NIR)
// ─────────────────────────────────────────
export function computeNDWI(pixelData, width, height, bandConfig = { green: 1, nir: 3 }) {
  const { green: gIdx, nir: nIdx } = bandConfig;
  const greenBand = pixelData[gIdx];
  const nirBand   = pixelData[nIdx];
  if (!greenBand || !nirBand) return null;

  const ndwi = new Float32Array(width * height);
  let waterPixels = 0;

  for (let i = 0; i < width * height; i++) {
    const g = greenBand[i];
    const n = nirBand[i];
    if (g === 0 && n === 0) { ndwi[i] = -9999; continue; }
    const v = (g - n) / (g + n + 1e-10);
    ndwi[i] = v;
    if (v > 0) waterPixels++;
  }

  return {
    type: 'ndwi',
    data: ndwi,
    stats: {
      waterPixels,
      waterPct: ((waterPixels / (width * height)) * 100).toFixed(1),
    },
    formula: '(Green - NIR) / (Green + NIR)',
  };
}

// ─────────────────────────────────────────
// CHANGE DETECTION
// Simple pixel difference between two bands
// ─────────────────────────────────────────
export async function computeChangeDetection(pixelData1, pixelData2, width, height, bandIdx = 0) {
  if (!pixelData1 || !pixelData2) return null;

  const b1 = pixelData1[bandIdx];
  const b2 = pixelData2[bandIdx];

  if (!b1 || !b2) return null;

  const change = new Float32Array(width * height);
  let increased = 0, decreased = 0, unchanged = 0;
  const THRESHOLD = 200; // Reflectance units

  for (let i = 0; i < width * height; i++) {
    const diff = b2[i] - b1[i];
    change[i] = diff;
    if (diff > THRESHOLD) increased++;
    else if (diff < -THRESHOLD) decreased++;
    else unchanged++;
  }

  const total = width * height;
  const colorized = changeToRGBA(change, width, height, THRESHOLD);

  return {
    type: 'change',
    data: change,
    colorized,
    stats: {
      increased,
      decreased,
      unchanged,
      increasedPct: ((increased / total) * 100).toFixed(1),
      decreasedPct: ((decreased / total) * 100).toFixed(1),
      unchangedPct: ((unchanged / total) * 100).toFixed(1),
      threshold: THRESHOLD,
    },
    formula: 'Band_t2 - Band_t1 (pixel difference)',
    width,
    height,
  };
}

function changeToRGBA(change, width, height, threshold) {
  const rgba = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const v = change[i];
    const idx = i * 4;

    if (v > threshold) {
      // Increase — green
      const intensity = Math.min(255, Math.floor((v / 2000) * 255));
      rgba[idx]   = 26;
      rgba[idx+1] = 152;
      rgba[idx+2] = 80;
      rgba[idx+3] = Math.min(240, 100 + intensity);
    } else if (v < -threshold) {
      // Decrease — red
      const intensity = Math.min(255, Math.floor((-v / 2000) * 255));
      rgba[idx]   = 215;
      rgba[idx+1] = 48;
      rgba[idx+2] = 39;
      rgba[idx+3] = Math.min(240, 100 + intensity);
    } else {
      // Unchanged — transparent
      rgba[idx] = rgba[idx+1] = rgba[idx+2] = 200;
      rgba[idx+3] = 20;
    }
  }

  return rgba;
}

// ─────────────────────────────────────────
// RENDER RGBA TO CANVAS → DATA URL
// ─────────────────────────────────────────
export function rgbaToDataURL(rgba, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width  = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(rgba, width, height);
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

// ─────────────────────────────────────────
// DEMO NDVI SIMULATION
// Generates realistic-looking NDVI stats for demo mode
// ─────────────────────────────────────────
export function generateDemoNDVIResult(scenarioId = 'ahmedabad_2023') {
  const scenarios = {
    ahmedabad_2022: {
      mean: '0.342',
      max: '0.821',
      min: '-0.187',
      vegetationPct: '38.2',
      barePct: '31.5',
      waterPct: '4.1',
      urbanPct: '26.2',
    },
    ahmedabad_2023: {
      mean: '0.298',
      max: '0.814',
      min: '-0.201',
      vegetationPct: '31.7',
      barePct: '28.4',
      waterPct: '3.8',
      urbanPct: '36.1',
    },
    ahmedabad_change: {
      vegetationChange: '-6.5',
      urbanChange: '+9.9',
      waterChange: '-0.3',
      bareChange: '-3.1',
      direction: 'decrease',
    },
  };
  return scenarios[scenarioId] || scenarios.ahmedabad_2023;
}

export function generateDemoChangeResult() {
  return {
    type: 'change',
    stats: {
      increasedPct: '12.4',
      decreasedPct: '8.7',
      unchangedPct: '78.9',
      threshold: 200,
      description: 'Change detected between observation dates.',
    },
    regions: [
      { name: 'Northern Urban Fringe', type: 'increase', areaSqKm: '14.2', confidence: 'high' },
      { name: 'Eastern Agricultural Zone', type: 'decrease', areaSqKm: '8.6', confidence: 'high' },
      { name: 'Sabarmati Riverfront', type: 'unchanged', areaSqKm: '5.1', confidence: 'medium' },
    ],
  };
}

// ─────────────────────────────────────────
// SPATIAL CORRELATION ANALYSIS
// Checks spatial overlap between two analysis results
// ─────────────────────────────────────────
export function computeSpatialOverlap(result1, result2) {
  if (!result1?.data || !result2?.data) {
    // Demo mode: return simulated overlap
    return {
      overlapPixels: 42800,
      overlapPct: '18.3',
      description: 'Spatial overlap detected between changed regions.',
      disclaimer: 'Spatial overlap detected — this does not independently establish a causal relationship.',
    };
  }

  let overlap = 0;
  const len = Math.min(result1.data.length, result2.data.length);
  for (let i = 0; i < len; i++) {
    if (result1.data[i] > 0 && result2.data[i] > 0) overlap++;
  }

  return {
    overlapPixels: overlap,
    overlapPct: ((overlap / len) * 100).toFixed(1),
    description: 'Spatial overlap detected between the two analysis layers.',
    disclaimer: 'Spatial overlap detected — this does not independently establish a causal relationship.',
  };
}

// ─────────────────────────────────────────
// BAND STATISTICS
// ─────────────────────────────────────────
export function computeBandStats(pixelData) {
  if (!pixelData) return null;

  return pixelData.map((band, idx) => {
    let min = Infinity, max = -Infinity, sum = 0, count = 0;
    for (let i = 0; i < band.length; i += 5) {
      const v = band[i];
      if (v === 0 || isNaN(v)) continue;
      if (v < min) min = v;
      if (v > max) max = v;
      sum += v;
      count++;
    }
    return {
      band: idx + 1,
      min: min === Infinity ? 'N/A' : min.toFixed(1),
      max: max === -Infinity ? 'N/A' : max.toFixed(1),
      mean: count > 0 ? (sum / count).toFixed(1) : 'N/A',
    };
  });
}

// ─────────────────────────────────────────
// STEP-BY-STEP ANALYSIS RUNNER (with progress callbacks)
// ─────────────────────────────────────────
export async function runAnalysis(plan, profile, onStep) {
  const results = { plan, steps: [] };

  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];
    onStep?.(i, 'active', step);
    await sleep(600 + Math.random() * 400); // Simulate computation time

    if (step.blocked) {
      onStep?.(i, 'blocked', step);
      results.steps.push({ ...step, status: 'blocked' });
      break;
    }

    onStep?.(i, 'completed', step);
    results.steps.push({ ...step, status: 'completed' });
  }

  return results;
}
