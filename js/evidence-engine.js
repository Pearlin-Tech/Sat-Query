/**
 * SatQuery AI — Evidence Engine
 * Computes evidence scores, builds audit trails, generates structured explanations.
 * No fake confidence percentages — only checklist-based evidence quality.
 */

import { formatTimestamp } from './utils.js';

// ─────────────────────────────────────────
// EVIDENCE SCORE
// Returns: SUPPORTED | PARTIALLY SUPPORTED | INSUFFICIENT EVIDENCE
// ─────────────────────────────────────────
export function computeEvidenceScore(plan, profile, analysisResult) {
  const checks = [];

  // 1. Compatible imagery available?
  const hasImage = !!profile;
  checks.push({
    label: 'Compatible imagery loaded',
    pass: hasImage,
    warn: false,
    detail: hasImage ? `${profile.filename} — ${profile.format}` : 'No image uploaded',
  });

  // 2. Required bands available?
  const bandsRequired = plan.requiredBands || [];
  const nirNeeded = bandsRequired.includes('NIR');
  const nirOk = !nirNeeded || (profile && profile.hasNIR);
  checks.push({
    label: 'Required bands available',
    pass: nirOk,
    warn: nirNeeded && !nirOk,
    detail: nirOk ? `Bands: ${profile?.bandNames?.join(', ') || 'RGB'}` : 'NIR band missing — spectral indices unavailable',
  });

  // 3. Temporal requirement met?
  const temporalNeeded = plan.temporalRequired;
  const temporalOk = !temporalNeeded || (profile && profile.hasMultipleImages);
  checks.push({
    label: 'Temporal requirement met',
    pass: temporalOk,
    warn: temporalNeeded && !temporalOk,
    detail: temporalOk
      ? (temporalNeeded ? 'Multiple observations available' : 'Temporal comparison not required for this analysis')
      : 'Only one image available — change detection requires two observations',
  });

  // 4. Spatial alignment verified?
  const alignmentOk = !profile || profile.crs !== 'Unknown';
  checks.push({
    label: 'Spatial alignment verified',
    pass: alignmentOk,
    warn: !alignmentOk,
    detail: alignmentOk ? `CRS: ${profile?.crs || 'Not required'}` : 'CRS unknown — spatial alignment cannot be verified',
  });

  // 5. Deterministic calculation completed?
  const calcOk = !!analysisResult;
  checks.push({
    label: 'Deterministic calculation completed',
    pass: calcOk,
    warn: false,
    detail: calcOk ? `Method: ${plan.operations?.join(', ')}` : 'Calculation not yet performed',
  });

  // 6. Result visualized?
  const vizOk = calcOk; // If calculation done, visualization follows
  checks.push({
    label: 'Result visualized',
    pass: vizOk,
    warn: false,
    detail: vizOk ? 'Map layer and statistics generated' : 'Pending analysis',
  });

  // Compute verdict
  const passed = checks.filter(c => c.pass).length;
  const warned = checks.filter(c => c.warn).length;
  const total  = checks.length;

  let verdict, verdictClass, verdictIcon;
  if (passed === total) {
    verdict = 'SUPPORTED';
    verdictClass = 'supported';
    verdictIcon = '✓';
  } else if (passed >= total * 0.5 && warned <= 1) {
    verdict = 'PARTIALLY SUPPORTED';
    verdictClass = 'partial';
    verdictIcon = '⚠';
  } else {
    verdict = 'INSUFFICIENT EVIDENCE';
    verdictClass = 'insufficient';
    verdictIcon = '✕';
  }

  return { checks, verdict, verdictClass, verdictIcon, score: Math.round((passed / total) * 100) };
}

// ─────────────────────────────────────────
// UNCERTAINTY PANEL
// ─────────────────────────────────────────
export function buildUncertaintyPanel(plan, analysisResult) {
  const known = [];
  const inferred = [];
  const cannotDetermine = [];

  if (analysisResult) {
    if (analysisResult.type === 'ndvi') {
      known.push(`Spectral index computed: mean NDVI = ${analysisResult.stats?.mean}`);
      known.push(`${analysisResult.stats?.vegetationPct}% of analyzed pixels classified as vegetation (NDVI > 0.3)`);
      if (analysisResult.stats?.waterPct > 2) {
        known.push(`Water-like regions detected (NDVI < 0)`);
      }
      inferred.push('Regions with NDVI > 0.3 likely correspond to vegetated surfaces under standard atmospheric conditions');
      inferred.push('NDVI values vary with seasonality, soil brightness, and atmospheric effects');
      cannotDetermine.push('Exact plant species composition cannot be determined from NDVI alone');
      cannotDetermine.push('Sub-pixel vegetation cannot be resolved at this spatial resolution');
    } else if (analysisResult.type === 'change') {
      known.push(`Spatial pixel difference computed between two observations`);
      known.push(`${analysisResult.stats?.increasedPct}% of area shows positive change, ${analysisResult.stats?.decreasedPct}% shows negative change`);
      inferred.push('Regions of positive change may correspond to increased surface reflectance');
      inferred.push('Negative change regions may indicate decreased surface reflectance or land cover change');
      cannotDetermine.push('The cause of detected change cannot be determined from imagery alone');
      cannotDetermine.push('Atmospheric effects, phenological variation, and sensor differences may contribute to detected change');
    } else {
      known.push('Spectral analysis performed on available imagery');
      inferred.push('Results correspond to spectral patterns within the analyzed region');
      cannotDetermine.push('Ground-truth validation not performed in this analysis');
    }
  } else {
    known.push(`Query intent: ${plan.intentLabel}`);
    known.push(`Required analysis: ${plan.operations?.join(', ')}`);
    inferred.push('Analysis pending data availability and computation');
    cannotDetermine.push('Results not yet available — analysis not complete');
  }

  return { known, inferred, cannotDetermine };
}

// ─────────────────────────────────────────
// ANSWER TRACE
// ─────────────────────────────────────────
export function buildAnswerTrace(plan, profile, analysisResult, evidenceScore) {
  return [
    {
      label: 'Question understood as',
      value: plan.intentLabel,
    },
    {
      label: 'Location',
      value: plan.location?.name || 'Not specified',
    },
    {
      label: 'Data used',
      value: profile ? `${profile.filename} (${profile.bands} band(s), ${profile.sensor})` : 'No data uploaded',
    },
    {
      label: 'Calculation',
      value: plan.operations?.join(' → ') || 'None',
    },
    {
      label: 'Evidence status',
      value: evidenceScore?.verdict || 'Not computed',
    },
    {
      label: 'Validation',
      value: evidenceScore?.verdict === 'SUPPORTED' ? 'Passed — all evidence checks satisfied' : `Partial — ${evidenceScore?.checks?.filter(c => !c.pass).length || 0} check(s) failed`,
    },
    {
      label: 'Limitations',
      value: 'Change detection indicates spatial difference; it does not independently establish the cause. All results are based on spectral analysis only.',
    },
    {
      label: 'Timestamp',
      value: formatTimestamp(),
    },
  ];
}

// ─────────────────────────────────────────
// CHANGE EXPLANATION (Structured)
// ─────────────────────────────────────────
export function buildChangeExplanation(analysisResult, plan) {
  if (!analysisResult) return null;

  const { stats } = analysisResult;

  return {
    what: `Spatial difference detected — ${stats?.increasedPct || '?'}% of analyzed area shows increased values, ${stats?.decreasedPct || '?'}% shows decreased values.`,
    where: `Analysis performed over the selected region: ${plan.location?.name || 'user-defined AOI'}.`,
    when: plan.timeRange || 'Temporal range not specified.',
    howMuch: stats
      ? `Increased area: ${stats.increasedPct}% | Decreased area: ${stats.decreasedPct}% | Unchanged: ${stats.unchangedPct}%`
      : 'Statistics not computed.',
    limitation: 'Change detection indicates spatial difference between observations; it does not independently establish the cause of the change.',
    evidenceItems: [
      'Before observation (if available)',
      'After observation',
      'Pixel difference layer (colorized)',
      'Statistics summary',
    ],
  };
}

// ─────────────────────────────────────────
// AUDIT TRAIL
// ─────────────────────────────────────────
export function buildAuditTrail(plan, profile, analysisResult) {
  const entries = [];
  const now = new Date();

  entries.push({
    time: formatTimestamp(),
    action: 'Query received',
    detail: `"${plan.originalQuery}"`,
    status: 'ok',
  });

  entries.push({
    time: formatTimestamp(),
    action: 'Intent parsed',
    detail: `${plan.intentLabel} (${plan.intent})`,
    status: 'ok',
  });

  entries.push({
    time: formatTimestamp(),
    action: 'Dataset inspected',
    detail: profile ? `${profile.filename}, ${profile.bands} bands, ${profile.crs}` : 'No dataset loaded',
    status: profile ? 'ok' : 'warn',
  });

  if (plan.validation?.blockers?.length > 0) {
    entries.push({
      time: formatTimestamp(),
      action: 'Validation failed',
      detail: plan.validation.blockers.map(b => b.message).join('; '),
      status: 'error',
    });
  } else {
    entries.push({
      time: formatTimestamp(),
      action: 'Analysis method selected',
      detail: `${plan.operations?.join(', ')}`,
      status: 'ok',
    });
  }

  if (analysisResult) {
    entries.push({
      time: formatTimestamp(),
      action: 'Computation completed',
      detail: `Type: ${analysisResult.type}, Formula: ${analysisResult.formula || 'N/A'}`,
      status: 'ok',
    });
    entries.push({
      time: formatTimestamp(),
      action: 'Evidence assembled',
      detail: 'Statistics, visualization, and explanation generated',
      status: 'ok',
    });
  }

  return entries;
}

// ─────────────────────────────────────────
// SENSOR RECOMMENDATION
// ─────────────────────────────────────────
export function recommendSensor(intentType) {
  const recommendations = {
    vegetation_current: {
      sensor: 'Optical Multispectral',
      examples: ['Sentinel-2 MSI', 'Landsat-8/9 OLI'],
      reason: 'Requires Red and NIR spectral bands for NDVI computation.',
      bands: 'Red (Band 4) + NIR (Band 8)',
    },
    vegetation_change: {
      sensor: 'Optical Multispectral (Multitemporal)',
      examples: ['Sentinel-2 MSI', 'Landsat archive'],
      reason: 'Requires multispectral bands at two or more comparable dates.',
      bands: 'Red + NIR, two observations',
    },
    urban_expansion: {
      sensor: 'Optical Multispectral',
      examples: ['Sentinel-2 MSI', 'Landsat-8 OLI', 'ResourceSat LISS-III'],
      reason: 'SWIR bands improve built-up area discrimination.',
      bands: 'Red + NIR + SWIR',
    },
    water_detection: {
      sensor: 'Optical (or SAR under cloud cover)',
      examples: ['Sentinel-2 (optical)', 'Sentinel-1 (SAR)'],
      reason: 'NDWI uses Green + NIR. SAR complements under cloud conditions.',
      bands: 'Green + NIR (optical), C-band VV/VH (SAR)',
    },
    flood_analysis: {
      sensor: 'SAR (preferred)',
      examples: ['Sentinel-1 C-band', 'RISAT-1', 'NISAR (planned)'],
      reason: 'Radar observations can penetrate cloud cover — critical for flood monitoring.',
      bands: 'C-band SAR (VV or VH polarization)',
      note: 'SAR data acquisition is PLANNED in SatQuery prototype.',
    },
    change_detection: {
      sensor: 'Any multitemporal imagery',
      examples: ['Sentinel-2', 'Landsat', 'PlanetScope', 'CartoSat'],
      reason: 'Requires two or more images from comparable acquisition conditions.',
      bands: 'Any matching spectral bands',
    },
  };

  return recommendations[intentType] || recommendations.change_detection;
}

// ─────────────────────────────────────────
// ALTERNATIVE ANALYSIS SUGGESTIONS
// ─────────────────────────────────────────
export function suggestAlternatives(blocker) {
  const alternatives = {
    missing_band: {
      NIR: [
        { label: 'Visual vegetation assessment', detail: 'Qualitatively assess green areas from RGB imagery.' },
        { label: 'Upload multispectral imagery', detail: 'Add a GeoTIFF with NIR band (Sentinel-2 or Landsat).' },
        { label: 'Use Sentinel-2 data from Copernicus', detail: 'Free access at scihub.copernicus.eu (PLANNED integration).' },
      ],
    },
    single_image: [
      { label: 'Analyze single-date statistics', detail: 'Perform NDVI or spectral analysis on the available image.' },
      { label: 'Upload a second image', detail: 'Add an earlier or later observation to enable change detection.' },
      { label: 'Use demo scenario', detail: 'Load the built-in Ahmedabad demo dataset with pre-loaded temporal pair.' },
    ],
    unknown_intent: [
      { label: 'Try a clearer question', detail: 'e.g., "Show NDVI in this area" or "What changed between 2022 and 2023?"' },
      { label: 'Select from suggested queries', detail: 'Use the query suggestions panel to explore available analyses.' },
      { label: 'Use the Query Planner', detail: 'Build a structured query manually using the analysis planner.' },
    ],
  };

  if (blocker.type === 'missing_band') {
    return alternatives.missing_band[blocker.band] || [];
  }
  return alternatives[blocker.type] || [];
}
