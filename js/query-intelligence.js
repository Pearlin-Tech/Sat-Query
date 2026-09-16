/**
 * SatQuery AI — Query Intelligence Layer
 * Converts natural language queries into structured analysis plans.
 * Deterministic NLP — no external API required.
 * Architecture supports future LLM swap via config flag.
 */

import { formatTimestamp } from './utils.js';

// ─────────────────────────────────────────
// INTENT PATTERNS
// ─────────────────────────────────────────
const INTENT_PATTERNS = [
  {
    intent: 'vegetation_change',
    label: 'Vegetation Change Analysis',
    icon: '🌿',
    keywords: ['vegetation', 'ndvi', 'green', 'plant', 'forest', 'crop', 'farm', 'biomass', 'chlorophyll', 'tree', 'grass'],
    changeKeywords: ['change', 'decrease', 'increase', 'loss', 'gain', 'differ', 'compare', 'between', 'over time', 'trend'],
    requiredBands: ['Red', 'NIR'],
    operations: ['NDVI', 'temporal_comparison'],
    sensor: 'Optical Multispectral',
    output: ['map', 'statistics', 'explanation'],
    temporalRequired: true,
    color: 'var(--green-400)',
  },
  {
    intent: 'vegetation_current',
    label: 'Vegetation Analysis',
    icon: '🌱',
    keywords: ['vegetation', 'ndvi', 'green', 'plant', 'forest', 'crop', 'farm', 'biomass'],
    changeKeywords: [],
    requiredBands: ['Red', 'NIR'],
    operations: ['NDVI'],
    sensor: 'Optical Multispectral',
    output: ['map', 'statistics'],
    temporalRequired: false,
    color: 'var(--green-300)',
  },
  {
    intent: 'urban_expansion',
    label: 'Urban / Built-up Analysis',
    icon: '🏗️',
    keywords: ['urban', 'built', 'city', 'town', 'construction', 'infrastructure', 'building', 'settlement', 'expansion'],
    changeKeywords: ['change', 'expand', 'grow', 'spread', 'increase', 'new', 'develop'],
    requiredBands: ['Red', 'NIR', 'SWIR'],
    operations: ['NDBI', 'change_detection'],
    sensor: 'Optical Multispectral',
    output: ['map', 'statistics', 'explanation'],
    temporalRequired: false,
    color: 'var(--amber-400)',
  },
  {
    intent: 'water_detection',
    label: 'Water Body Analysis',
    icon: '💧',
    keywords: ['water', 'flood', 'lake', 'river', 'reservoir', 'wetland', 'inundation', 'submerged'],
    changeKeywords: ['extent', 'change', 'flood', 'dry', 'fill', 'increase', 'decrease'],
    requiredBands: ['Green', 'NIR'],
    operations: ['NDWI', 'water_extraction'],
    sensor: 'Optical or SAR',
    output: ['map', 'statistics'],
    temporalRequired: false,
    color: 'var(--blue-400)',
  },
  {
    intent: 'change_detection',
    label: 'Change Detection',
    icon: '🔄',
    keywords: ['change', 'differ', 'before', 'after', 'compare', 'changed', 'difference', 'temporal'],
    changeKeywords: [],
    requiredBands: ['RGB or any spectral'],
    operations: ['change_detection', 'temporal_comparison'],
    sensor: 'Any multitemporal',
    output: ['change_map', 'statistics', 'explanation'],
    temporalRequired: true,
    color: 'var(--amber-300)',
  },
  {
    intent: 'combined_urban_vegetation',
    label: 'Urban Expansion + Vegetation Analysis',
    icon: '⚖️',
    keywords: ['urban', 'vegetation', 'built', 'green', 'city', 'forest'],
    changeKeywords: ['compare', 'both', 'and', 'while', 'relationship', 'correlation'],
    requiredBands: ['Red', 'NIR', 'SWIR'],
    operations: ['NDVI', 'NDBI', 'change_detection', 'spatial_overlap'],
    sensor: 'Optical Multispectral',
    output: ['map', 'statistics', 'spatial_correlation', 'explanation'],
    temporalRequired: false,
    multiTool: true,
    color: 'var(--purple-400)',
  },
  {
    intent: 'flood_analysis',
    label: 'Flood / Inundation Analysis',
    icon: '🌊',
    keywords: ['flood', 'inundation', 'submerged', 'waterlogging', 'deluge'],
    changeKeywords: [],
    requiredBands: ['SAR C-band or Green + NIR'],
    operations: ['NDWI', 'SAR_coherence', 'change_detection'],
    sensor: 'SAR preferred (optical as fallback)',
    output: ['flood_extent_map', 'statistics'],
    temporalRequired: true,
    color: 'var(--blue-300)',
  },
];

// ─────────────────────────────────────────
// LOCATION PATTERNS
// ─────────────────────────────────────────
const LOCATION_PATTERNS = {
  ahmedabad:   { name: 'Ahmedabad', center: [23.0225, 72.5714], zoom: 11, state: 'Gujarat', country: 'India' },
  surat:       { name: 'Surat',     center: [21.1702, 72.8311], zoom: 11, state: 'Gujarat', country: 'India' },
  vadodara:    { name: 'Vadodara',  center: [22.3072, 73.1812], zoom: 11, state: 'Gujarat', country: 'India' },
  gandhinagar: { name: 'Gandhinagar', center: [23.2156, 72.6369], zoom: 11, state: 'Gujarat', country: 'India' },
  rajkot:      { name: 'Rajkot',    center: [22.3039, 70.8022], zoom: 11, state: 'Gujarat', country: 'India' },
  mumbai:      { name: 'Mumbai',    center: [19.0760, 72.8777], zoom: 11, state: 'Maharashtra', country: 'India' },
  delhi:       { name: 'Delhi',     center: [28.6139, 77.2090], zoom: 11, state: 'Delhi', country: 'India' },
  bangalore:   { name: 'Bangalore', center: [12.9716, 77.5946], zoom: 11, state: 'Karnataka', country: 'India' },
  gujarat:     { name: 'Gujarat',   center: [22.2587, 71.1924], zoom: 7, state: 'Gujarat', country: 'India' },
  india:       { name: 'India',     center: [20.5937, 78.9629], zoom: 5, country: 'India' },
  'this area': { name: 'Current AOI', center: null, zoom: null },
  'selected region': { name: 'Selected Region', center: null, zoom: null },
};

// ─────────────────────────────────────────
// TEMPORAL PATTERNS
// ─────────────────────────────────────────
const TEMPORAL_PATTERNS = [
  { pattern: /(\d{4})\s*(?:to|-)\s*(\d{4})/, label: (m) => `${m[1]}–${m[2]}` },
  { pattern: /last\s+(\d+)\s+years?/, label: (m) => `Last ${m[1]} year(s)` },
  { pattern: /last\s+(\d+)\s+months?/, label: (m) => `Last ${m[1]} month(s)` },
  { pattern: /recent\s+\d+\s+years?/, label: (m) => m[0] },
  { pattern: /between\s+(\w+)\s+and\s+(\w+)/, label: (m) => `${m[1]} to ${m[2]}` },
  { pattern: /20\d\d/, label: (m) => m[0] },
];

// ─────────────────────────────────────────
// QUERY PARSER
// ─────────────────────────────────────────
export function parseQuery(queryText, datasetProfile = null) {
  const text = queryText.toLowerCase().trim();
  const words = text.split(/\s+/);

  // 1. Detect intent
  const intent = detectIntent(text, words);

  // 2. Detect location
  const location = detectLocation(text);

  // 3. Detect temporal range
  const timeRange = detectTemporal(text);

  // 4. Detect if change comparison is requested
  const isChangeQuery = /change|before|after|over time|compar|between|differ|trend|increase|decrease|loss|gain/.test(text);

  // 5. Validate against dataset capabilities
  const validation = validateAgainstDataset(intent, datasetProfile);

  // 6. Build structured plan
  const plan = buildAnalysisPlan(intent, location, timeRange, isChangeQuery, validation, queryText);

  return plan;
}

function detectIntent(text, words) {
  // Check for combined intents first (most specific)
  const combined = INTENT_PATTERNS.find(p => p.intent === 'combined_urban_vegetation');
  const hasUrban = combined.keywords.filter(k => text.includes(k) && k === 'urban' || k === 'built' || k === 'city' || k === 'construction').length > 0;
  const hasVeg = ['vegetation', 'ndvi', 'green', 'plant', 'forest'].some(k => text.includes(k));
  if ((hasUrban && hasVeg) || text.includes('and') && hasUrban) {
    // Check for both urban AND vegetation mentions
    if (hasVeg && hasUrban) return combined;
  }

  // Score each pattern
  const scores = INTENT_PATTERNS.map(pattern => {
    let score = 0;
    for (const kw of pattern.keywords) {
      if (text.includes(kw)) score += 2;
    }
    for (const kw of pattern.changeKeywords) {
      if (text.includes(kw)) score += 1;
    }
    return { pattern, score };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores[0].score > 0 ? scores[0].pattern : INTENT_PATTERNS.find(p => p.intent === 'change_detection');
}

function detectLocation(text) {
  for (const [key, loc] of Object.entries(LOCATION_PATTERNS)) {
    if (text.includes(key)) return loc;
  }
  return { name: 'Unknown / Current AOI', center: null, zoom: null };
}

function detectTemporal(text) {
  for (const tp of TEMPORAL_PATTERNS) {
    const m = text.match(tp.pattern);
    if (m) return tp.label(m);
  }
  if (/recent|latest|current|now/.test(text)) return 'Recent imagery';
  return 'Not specified — two comparable observations required';
}

function validateAgainstDataset(intent, profile) {
  if (!profile) return { valid: true, warnings: [], blockers: [] };

  const warnings = [];
  const blockers = [];

  // Check band availability
  if (intent?.requiredBands) {
    const required = intent.requiredBands;
    const available = profile.bands || [];

    if (required.includes('NIR') && !profile.hasNIR) {
      blockers.push({
        type: 'missing_band',
        band: 'NIR',
        message: 'NIR band not detected — NDVI-based analysis unavailable.',
        suggestion: 'Upload a multispectral image (Sentinel-2, Landsat) with NIR band.'
      });
    }
    if (required.includes('SWIR') && !profile.hasSWIR) {
      warnings.push({ type: 'missing_band', band: 'SWIR', message: 'SWIR band unavailable — built-up index limited.' });
    }
  }

  // Check temporal
  if (intent?.temporalRequired && !profile.hasMultipleImages) {
    blockers.push({
      type: 'single_image',
      message: 'Change detection requires at least two comparable observations.',
      suggestion: 'Upload a second image from a different date.'
    });
  }

  // Check CRS
  if (profile.crs && profile.crs !== 'UNKNOWN' && profile.crs2 && profile.crs !== profile.crs2) {
    warnings.push({ type: 'crs_mismatch', message: 'Images have different coordinate reference systems — alignment may be required.' });
  }

  // Cloudy
  if (profile.cloudy) {
    warnings.push({ type: 'cloud_cover', message: 'Cloud cover detected — optical analysis may be affected.' });
  }

  return { valid: blockers.length === 0, warnings, blockers };
}

function buildAnalysisPlan(intent, location, timeRange, isChangeQuery, validation, originalQuery) {
  if (!intent) {
    return buildUnknownPlan(originalQuery);
  }

  const plan = {
    id: crypto.randomUUID?.() ?? Date.now().toString(),
    timestamp: formatTimestamp(),
    originalQuery,
    intent: intent.intent,
    intentLabel: intent.label,
    intentIcon: intent.icon,
    location,
    timeRange,
    isChangeQuery,
    requiredBands: intent.requiredBands,
    operations: intent.operations,
    sensor: intent.sensor,
    output: intent.output,
    multiTool: intent.multiTool || false,
    temporalRequired: intent.temporalRequired,
    validation,
    color: intent.color,
    steps: buildSteps(intent, validation),
    evidenceRequired: true,
  };

  return plan;
}

function buildSteps(intent, validation) {
  const steps = [
    {
      id: 1,
      title: 'Understand question',
      detail: `Intent recognized as: ${intent.label}. Query parsed for location, temporal context, and required analysis type.`,
      status: 'pending',
    },
    {
      id: 2,
      title: 'Inspect dataset',
      detail: `Checking band availability (${intent.requiredBands.join(', ')}), CRS, resolution, NoData values, and acquisition metadata.`,
      status: 'pending',
    },
    {
      id: 3,
      title: 'Select analysis method',
      detail: `Selected: ${intent.operations.join(' → ')}. Method chosen based on query intent and available spectral bands.`,
      status: 'pending',
    },
    {
      id: 4,
      title: 'Run computation',
      detail: `Performing ${intent.operations.join(', ')} on loaded raster data. All computations are deterministic.`,
      status: 'pending',
    },
    {
      id: 5,
      title: 'Validate result',
      detail: 'Checking output for data gaps, CRS consistency, NoData regions, and computation integrity.',
      status: 'pending',
    },
    {
      id: 6,
      title: 'Generate evidence',
      detail: 'Assembling visual evidence: before/after layers, change map, statistics, source metadata.',
      status: 'pending',
    },
    {
      id: 7,
      title: 'Explain result',
      detail: 'Generating structured explanation with KNOWN / INFERRED / CANNOT DETERMINE distinction.',
      status: 'pending',
    },
  ];

  if (validation.blockers.length > 0) {
    steps[3].detail = `⚠️ Blocked: ${validation.blockers.map(b => b.message).join('; ')}`;
    steps[3].blocked = true;
    steps[4].blocked = true;
    steps[5].blocked = true;
    steps[6].blocked = true;
  }

  return steps;
}

function buildUnknownPlan(query) {
  return {
    id: Date.now().toString(),
    timestamp: formatTimestamp(),
    originalQuery: query,
    intent: 'unknown',
    intentLabel: 'Unrecognized Query',
    intentIcon: '❓',
    location: { name: 'Unknown' },
    timeRange: 'Unknown',
    requiredBands: [],
    operations: [],
    output: [],
    validation: {
      valid: false,
      blockers: [{ type: 'unknown_intent', message: 'Query intent could not be determined.', suggestion: 'Try asking about vegetation, urban areas, water bodies, or change detection.' }],
      warnings: [],
    },
    steps: [],
    evidenceRequired: false,
  };
}

// ─────────────────────────────────────────
// NATURAL LANGUAGE SUGGESTIONS
// ─────────────────────────────────────────
export function generateSuggestions(datasetProfile = null) {
  const suggestions = [
    {
      icon: '🌿',
      category: 'Vegetation',
      query: 'Where is vegetation strongest?',
      intent: 'vegetation_current',
      requiredBands: ['NIR'],
      unavailableReason: 'NDVI suggestions unavailable — NIR band not detected.',
    },
    {
      icon: '🔄',
      category: 'Change',
      query: 'What changed between the available dates?',
      intent: 'change_detection',
      requiredBands: [],
      temporalRequired: true,
      unavailableReason: 'Temporal comparison unavailable — only one image loaded.',
    },
    {
      icon: '🏗️',
      category: 'Built-up',
      query: 'Where are major built-up regions?',
      intent: 'urban_expansion',
      requiredBands: [],
    },
    {
      icon: '💧',
      category: 'Water',
      query: 'Where are water-like regions visible?',
      intent: 'water_detection',
      requiredBands: ['NIR'],
      unavailableReason: 'Water index unavailable — NIR band not detected.',
    },
    {
      icon: '⚖️',
      category: 'Combined',
      query: 'Has urban expansion increased while vegetation decreased?',
      intent: 'combined_urban_vegetation',
      requiredBands: ['NIR'],
      unavailableReason: 'Combined analysis unavailable — NIR band not detected.',
    },
    {
      icon: '📍',
      category: 'Region',
      query: 'What is happening around this selected region?',
      intent: 'change_detection',
      requiredBands: [],
    },
  ];

  if (!datasetProfile) return suggestions;

  return suggestions.map(s => {
    let available = true;
    let reason = null;

    if (s.requiredBands?.includes('NIR') && !datasetProfile.hasNIR) {
      available = false;
      reason = s.unavailableReason;
    }
    if (s.temporalRequired && !datasetProfile.hasMultipleImages) {
      available = false;
      reason = s.unavailableReason;
    }

    return { ...s, available, unavailableReason: reason };
  });
}

// ─────────────────────────────────────────
// NLP MAP COMMANDS
// ─────────────────────────────────────────
export function parseMapCommand(text) {
  const t = text.toLowerCase().trim();

  if (/zoom.*change|focus.*change/.test(t))  return { action: 'zoom_to_change' };
  if (/show.*vegetation|vegetation.*only/.test(t))  return { action: 'show_layer', layer: 'ndvi' };
  if (/show.*water/.test(t))   return { action: 'show_layer', layer: 'water' };
  if (/show.*built|show.*urban/.test(t))     return { action: 'show_layer', layer: 'buildup' };
  if (/show.*change|change.*layer/.test(t))  return { action: 'show_layer', layer: 'change' };
  if (/hide.*original|remove.*image/.test(t)) return { action: 'hide_layer', layer: 'base' };
  if (/before.*after|compare.*date/.test(t)) return { action: 'toggle_comparison' };
  if (/largest.*change|biggest.*change/.test(t)) return { action: 'highlight_largest_change' };
  if (/reset.*map|clear.*map/.test(t))       return { action: 'reset_map' };
  if (/zoom.*in/.test(t))   return { action: 'zoom', direction: 'in' };
  if (/zoom.*out/.test(t))  return { action: 'zoom', direction: 'out' };
  if (/north|south|east|west/.test(t)) {
    const dir = t.match(/(north|south|east|west)/)[1];
    return { action: 'pan', direction: dir };
  }

  return { action: 'unknown', text };
}
