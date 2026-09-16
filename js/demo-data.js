/**
 * SatQuery AI — Demo Mode
 * SIH demo orchestration: 3-minute guided walkthrough,
 * curated Ahmedabad scenario data, judge mode data.
 */

import { sleep, typewriter } from './utils.js';

// ─────────────────────────────────────────
// DEMO SCENARIO DATA
// Clearly labeled as DEMO DATASET
// ─────────────────────────────────────────
export const DEMO_SCENARIOS = {
  ahmedabad_vegetation_change: {
    id: 'ahmedabad_vegetation_change',
    label: 'Ahmedabad Vegetation Change',
    query: 'Has vegetation decreased around Ahmedabad between 2022 and 2023?',
    location: { name: 'Ahmedabad', center: [23.0225, 72.5714], zoom: 11 },
    timeRange: '2022–2023',
    intent: 'vegetation_change',
    dataset: {
      name: 'Ahmedabad Sentinel-2 (Demo)',
      sensor: 'Sentinel-2 MSI (Simulated)',
      date1: '2022-11-20',
      date2: '2023-11-15',
      bands: 4,
      crs: 'EPSG:32643',
      note: 'DEMO DATASET — Not real-time satellite acquisition',
    },
    results: {
      ndvi_2022: { mean: '0.342', vegetationPct: '38.2', urbanPct: '26.2', waterPct: '4.1' },
      ndvi_2023: { mean: '0.298', vegetationPct: '31.7', urbanPct: '36.1', waterPct: '3.8' },
      change: { vegetationChange: '-6.5', urbanChange: '+9.9', direction: 'decrease' },
      spatialOverlap: '18.3',
    },
    explanation: {
      what: 'NDVI-based vegetation analysis shows a decrease in mean NDVI from 0.342 to 0.298 between the two observations.',
      where: 'Change is concentrated in the northern and eastern fringe regions of the study area.',
      when: 'Between November 2022 and November 2023 (comparable seasonal observations).',
      howMuch: 'Vegetation cover decreased by approximately 6.5 percentage points. Urban-like spectral signatures increased by 9.9 percentage points.',
      limitation: 'Change detection indicates spatial spectral difference; it does not independently establish the cause of the change.',
    },
    tags: ['DEMO DATASET', 'NOT REAL-TIME'],
  },
};

// ─────────────────────────────────────────
// 3-MINUTE DEMO SCRIPT
// ─────────────────────────────────────────
export const DEMO_SCRIPT = [
  {
    step: 1,
    title: 'Welcome to SatQuery AI',
    duration: 8,
    action: 'intro',
    narration: 'SatQuery AI is an intelligent, evidence-first geospatial analysis platform. It understands natural language questions, validates data, selects specialist tools, and knows when it cannot answer.',
  },
  {
    step: 2,
    title: 'Loading Demo Dataset',
    duration: 5,
    action: 'load_demo_dataset',
    narration: 'Loading curated Ahmedabad Sentinel-2 demo dataset. This is a simulated multispectral dataset — clearly marked as DEMO.',
  },
  {
    step: 3,
    title: 'Dataset Intelligence',
    duration: 6,
    action: 'show_dataset_profile',
    narration: 'SatQuery automatically analyzes the dataset: detecting bands, CRS, resolution, sensor type, and computing a Data Health score.',
  },
  {
    step: 4,
    title: 'Intelligent Query',
    duration: 10,
    action: 'type_query',
    query: 'Has vegetation decreased around Ahmedabad between 2022 and 2023?',
    narration: 'Watch as SatQuery converts this natural language question into a structured analysis plan — showing exactly what it understood.',
  },
  {
    step: 5,
    title: 'Analysis Planning',
    duration: 8,
    action: 'show_agent_plan',
    narration: 'The Agent Plan shows which specialist tools are selected and why. NDVI Engine selected because the question concerns vegetation and NIR band is available.',
  },
  {
    step: 6,
    title: 'Running Analysis',
    duration: 12,
    action: 'run_analysis',
    narration: 'Step-by-step analysis execution — each step is visible, transparent, and logged to the audit trail.',
  },
  {
    step: 7,
    title: 'Map Visualization',
    duration: 8,
    action: 'show_map',
    narration: 'NDVI layer rendered on the interactive map. Green regions indicate healthy vegetation. Red-orange indicates bare/urban areas.',
  },
  {
    step: 8,
    title: 'Evidence & Answer',
    duration: 8,
    action: 'show_evidence',
    narration: 'Evidence score computed: SUPPORTED. Uncertainty panel distinguishes what is KNOWN, INFERRED, and CANNOT BE DETERMINED.',
  },
  {
    step: 9,
    title: 'Intelligent Failure',
    duration: 8,
    action: 'show_failure_case',
    narration: 'Now SatQuery demonstrates what happens when analysis cannot be performed — educational failure with alternatives suggested.',
  },
  {
    step: 10,
    title: 'Platform Capabilities',
    duration: 6,
    action: 'show_judge_mode',
    narration: 'Judge Mode provides a complete architectural overview — LIVE, DEMO, and PLANNED features clearly distinguished.',
  },
];

// ─────────────────────────────────────────
// INSIGHT OF THE DAY
// ─────────────────────────────────────────
export const INSIGHT_OF_THE_DAY = {
  title: 'Vegetation change detected in Ahmedabad study area',
  body: 'Spectral analysis of the demo dataset shows a 6.5 percentage-point decrease in vegetation coverage and a 9.9 percentage-point increase in urban-like spectral signatures between the two available observations.',
  source: 'Demo NDVI analysis — Ahmedabad Sentinel-2 simulation',
  date: 'Demo dataset',
  tags: ['DEMO DATASET', 'NOT REAL-TIME'],
  disclaimer: 'This is a demo observation from a curated dataset. It does not represent current real-world satellite intelligence.',
  icon: '🌿',
  evidenceVerdict: 'SUPPORTED',
};

// ─────────────────────────────────────────
// JUDGE MODE DATA
// ─────────────────────────────────────────
export const JUDGE_MODE_DATA = {
  problem: {
    title: 'Problem Statement',
    content: 'Satellite imagery analysis requires expert GIS knowledge. Citizens, farmers, and decision-makers cannot easily query, understand, or act upon geospatial data. Existing tools are either too technical or too superficial.',
  },
  solution: {
    title: 'SatQuery AI Solution',
    content: 'An intelligent, evidence-first geospatial AI platform that understands natural language questions, validates data, routes to specialist tools, performs transparent analysis, and explains results with uncertainty quantification — making satellite intelligence accessible to everyone.',
  },
  architecture: {
    title: 'System Architecture',
    layers: [
      { label: 'User Interface', detail: 'Responsive SPA — HTML + Vanilla JS + CSS', status: 'LIVE', tech: 'Web APIs, Leaflet.js' },
      { label: 'Query Intelligence', detail: 'Rule-based NLP → structured analysis plan', status: 'LIVE', tech: 'Custom NLP engine (LLM-swap ready)' },
      { label: 'Dataset Intelligence', detail: 'GeoTIFF reader, metadata analyzer, health scorer', status: 'LIVE', tech: 'geotiff.js, georaster' },
      { label: 'Agent Orchestrator', detail: 'Multi-tool routing, plan builder, execution', status: 'LIVE', tech: 'LangGraph-inspired (planned)' },
      { label: 'Analysis Engine', detail: 'NDVI, NDWI, change detection (pixel-level)', status: 'LIVE', tech: 'Deterministic raster math' },
      { label: 'Evidence Engine', detail: 'Checklist scoring, audit trail, uncertainty', status: 'LIVE', tech: 'Evidence-first framework' },
      { label: 'Geospatial Engine', detail: 'Map, AOI drawing, layer management', status: 'LIVE', tech: 'Leaflet.js + Leaflet.draw' },
      { label: 'Backend API', detail: 'FastAPI + Python (geospatial processing)', status: 'PLANNED', tech: 'FastAPI, Rasterio, GDAL, PostGIS' },
      { label: 'Data Catalog', detail: 'Live satellite data retrieval', status: 'PLANNED', tech: 'Copernicus API, Bhuvan NRSC' },
      { label: 'LLM Integration', detail: 'Qwen2.5-VL / Gemini for VQA', status: 'PLANNED', tech: 'Configurable LLM adapter' },
    ],
  },
  features: [
    { name: 'Query Intelligence (NLP → structured plan)', status: 'LIVE', category: 'Intelligence' },
    { name: 'Dataset profiling + Data Health score', status: 'LIVE', category: 'Intelligence' },
    { name: 'NDVI computation (pixel-level)', status: 'LIVE', category: 'Analysis' },
    { name: 'Change detection (pixel difference)', status: 'LIVE', category: 'Analysis' },
    { name: 'NDWI (water detection)', status: 'LIVE', category: 'Analysis' },
    { name: 'Evidence Score (checklist-based)', status: 'LIVE', category: 'Evidence' },
    { name: 'Uncertainty Panel (KNOWN/INFERRED/CANNOT)', status: 'LIVE', category: 'Evidence' },
    { name: 'Answer Trace ("Why did SatQuery say this?")', status: 'LIVE', category: 'Evidence' },
    { name: 'Audit Trail', status: 'LIVE', category: 'Evidence' },
    { name: 'Interactive map (Leaflet + dark tiles)', status: 'LIVE', category: 'Geospatial' },
    { name: 'AOI Drawing (rectangle, polygon, circle)', status: 'LIVE', category: 'Geospatial' },
    { name: 'Map Copilot (click region → ask)', status: 'LIVE', category: 'Geospatial' },
    { name: 'Natural language map commands', status: 'LIVE', category: 'Geospatial' },
    { name: 'Agent Plan visualization', status: 'LIVE', category: 'Intelligence' },
    { name: 'Explainable tool selection', status: 'LIVE', category: 'Intelligence' },
    { name: 'Query suggestions (band-aware)', status: 'LIVE', category: 'Intelligence' },
    { name: 'Failure detection + educational errors', status: 'LIVE', category: 'Reliability' },
    { name: 'Alternative analysis suggestions', status: 'LIVE', category: 'Reliability' },
    { name: 'Simple / Expert mode toggle', status: 'LIVE', category: 'UX' },
    { name: 'Multilingual (EN / HI / GU)', status: 'LIVE', category: 'UX' },
    { name: 'Voice query (Web Speech API)', status: 'LIVE', category: 'UX' },
    { name: 'Analysis history (localStorage)', status: 'LIVE', category: 'UX' },
    { name: 'Smart HTML report download', status: 'LIVE', category: 'Output' },
    { name: 'SIH Demo Mode (guided walkthrough)', status: 'LIVE', category: 'Demo' },
    { name: 'Judge Mode', status: 'LIVE', category: 'Demo' },
    { name: 'Architecture Visualizer', status: 'LIVE', category: 'Demo' },
    { name: 'System Health Center', status: 'LIVE', category: 'Demo' },
    { name: 'Data Sources Explorer', status: 'LIVE', category: 'Demo' },
    { name: 'Sensor Recommendation Engine', status: 'LIVE', category: 'Intelligence' },
    { name: 'Before/After Time Travel slider', status: 'DEMO', category: 'Geospatial' },
    { name: 'Cross-layer correlation', status: 'DEMO', category: 'Analysis' },
    { name: 'Challenge Result button', status: 'DEMO', category: 'Evidence' },
    { name: 'Live satellite data ingestion (Copernicus)', status: 'PLANNED', category: 'Data' },
    { name: 'Backend Python API (Rasterio/GDAL)', status: 'PLANNED', category: 'Backend' },
    { name: 'Real-time monitoring + alerts', status: 'PLANNED', category: 'Monitoring' },
    { name: 'LLM-powered VQA (Qwen2.5-VL)', status: 'PLANNED', category: 'AI' },
    { name: 'SAR analysis (Sentinel-1)', status: 'PLANNED', category: 'Analysis' },
    { name: 'PostGIS database persistence', status: 'PLANNED', category: 'Backend' },
  ],
  evidence: {
    title: 'Evidence of Intelligence',
    points: [
      'Query parser converts natural language to structured JSON plan — not just string forwarding',
      'Analysis fails gracefully with educational error messages and alternatives',
      'Evidence score is checklist-based — never invents confidence percentages',
      'Uncertainty panel distinguishes KNOWN, INFERRED, and CANNOT DETERMINE',
      'NDVI computed deterministically from actual pixel data (when real GeoTIFF provided)',
      'Tool selection is explained to the user with a visible "WHY?" rationale',
    ],
  },
};

// ─────────────────────────────────────────
// SYSTEM HEALTH STATUS
// ─────────────────────────────────────────
export const SYSTEM_HEALTH = [
  { component: 'Frontend (SPA)', status: 'ok', statusLabel: 'LIVE', detail: 'HTML + Vanilla JS + CSS' },
  { component: 'Query Intelligence', status: 'ok', statusLabel: 'LIVE', detail: 'Deterministic NLP engine' },
  { component: 'Dataset Intelligence', status: 'ok', statusLabel: 'LIVE', detail: 'geotiff.js in-browser' },
  { component: 'Analysis Engine', status: 'ok', statusLabel: 'LIVE', detail: 'NDVI, NDWI, Change detection' },
  { component: 'Agent Orchestrator', status: 'ok', statusLabel: 'LIVE', detail: 'Multi-tool routing' },
  { component: 'Evidence Engine', status: 'ok', statusLabel: 'LIVE', detail: 'Checklist-based scoring' },
  { component: 'Map / Geospatial', status: 'ok', statusLabel: 'LIVE', detail: 'Leaflet.js + Leaflet.draw' },
  { component: 'Demo Data', status: 'demo', statusLabel: 'DEMO', detail: 'Ahmedabad simulated dataset' },
  { component: 'Voice Query', status: 'ok', statusLabel: 'LIVE', detail: 'Web Speech API (browser)' },
  { component: 'Multilingual', status: 'ok', statusLabel: 'LIVE', detail: 'EN / HI / GU' },
  { component: 'Backend API', status: 'planned', statusLabel: 'PLANNED', detail: 'FastAPI + Rasterio (not connected)' },
  { component: 'Live Satellite Feed', status: 'planned', statusLabel: 'PLANNED', detail: 'Copernicus API (not connected)' },
  { component: 'Database (PostGIS)', status: 'planned', statusLabel: 'PLANNED', detail: 'Not deployed' },
  { component: 'LLM Integration', status: 'planned', statusLabel: 'PLANNED', detail: 'Qwen2.5-VL (configurable adapter)' },
];

// ─────────────────────────────────────────
// DATA SOURCES
// ─────────────────────────────────────────
export const DATA_SOURCES = [
  {
    id: 'bhuvan',
    name: 'Bhuvan / NRSC',
    flag: '🇮🇳',
    sensorType: 'Optical + SAR',
    description: 'Indian Space Research Organisation national geospatial platform providing ResourceSat, Cartosat, and RISAT data for Indian territory.',
    use: 'High-resolution Indian imagery, agriculture monitoring, disaster response',
    satqueryRole: 'Primary data source for Indian territory analyses (PLANNED)',
    status: 'PLANNED',
    color: 'var(--cyan-500)',
    specs: ['ResourceSat-2/2A: 5.8m / 24m', 'Cartosat: 0.5m (panchromatic)', 'RISAT-1: C-band SAR'],
  },
  {
    id: 'sentinel2',
    name: 'Sentinel-2',
    flag: '🇪🇺',
    sensorType: 'Optical Multispectral',
    description: 'ESA Copernicus mission providing 13-band multispectral imagery at 10–60m resolution. Free and open access globally.',
    use: 'Vegetation monitoring (NDVI), urban mapping, water bodies, agriculture',
    satqueryRole: 'Primary spectral analysis source — NDVI, NDWI, change detection',
    status: 'DEMO',
    color: 'var(--green-500)',
    specs: ['13 spectral bands', '10m resolution (RGB + NIR)', '5-day revisit time', 'Free Copernicus access'],
  },
  {
    id: 'sentinel1',
    name: 'Sentinel-1',
    flag: '🇪🇺',
    sensorType: 'SAR (C-band)',
    description: 'ESA synthetic aperture radar mission. Penetrates cloud cover — essential for flood monitoring, disaster response, and all-weather observation.',
    use: 'Flood monitoring, surface deformation, forest change, maritime',
    satqueryRole: 'Flood analysis and cloud-covered optical fallback (PLANNED)',
    status: 'PLANNED',
    color: 'var(--blue-500)',
    specs: ['C-band SAR', 'VV / VH polarization', '10m resolution', 'All-weather, day/night'],
  },
  {
    id: 'landsat',
    name: 'Landsat 8/9',
    flag: '🇺🇸',
    sensorType: 'Optical Multispectral',
    description: 'NASA/USGS archive providing consistent 30m multispectral imagery since 1972. Unparalleled temporal depth for long-term change analysis.',
    use: 'Long-term change detection, thermal analysis, agricultural monitoring',
    satqueryRole: 'Long-term temporal analysis and archive comparison (PLANNED)',
    status: 'PLANNED',
    color: 'var(--amber-500)',
    specs: ['11 spectral bands (OLI-2 + TIRS-2)', '30m resolution', '16-day revisit', 'Free USGS access'],
  },
];

// ─────────────────────────────────────────
// RESEARCH MODELS / DATASETS
// ─────────────────────────────────────────
export const RESEARCH_MODELS = [
  {
    id: 'qwen25vl',
    name: 'Qwen2.5-VL',
    type: 'Vision-Language Model',
    icon: '🤖',
    description: 'Large vision-language model capable of detailed image understanding and question answering.',
    role: 'Visual Question Answering on satellite imagery — interpreting scene content, describing land cover, answering natural language queries.',
    status: 'PLANNED',
    note: 'Not fine-tuned on satellite imagery in this prototype. Adapter architecture is in place.',
  },
  {
    id: 'bigearthnet',
    name: 'BigEarthNet',
    type: 'Training Dataset',
    icon: '📊',
    description: 'Large-scale Sentinel-2 benchmark dataset with multi-label scene classification annotations.',
    role: 'Reference for land cover classification training. Would be used to fine-tune classification models.',
    status: 'PLANNED (research reference)',
    note: 'Not used for actual computation in this prototype.',
  },
  {
    id: 'rsvqa',
    name: 'RSVQA / VRSBench',
    type: 'VQA Dataset',
    icon: '🔬',
    description: 'Remote Sensing Visual Question Answering datasets for evaluating geospatial VQA models.',
    role: 'Evaluation benchmark for the VQA pipeline. Enables measurement of answer quality on satellite imagery questions.',
    status: 'PLANNED (research reference)',
  },
  {
    id: 'sam',
    name: 'SAM (Segment Anything)',
    type: 'Segmentation Model',
    icon: '✂️',
    description: 'Meta AI foundational segmentation model, adapted for remote sensing applications.',
    role: 'Object segmentation and region delineation in satellite imagery.',
    status: 'PLANNED',
  },
  {
    id: 'rasterio',
    name: 'Rasterio + GDAL',
    type: 'Geospatial Processing Library',
    icon: '⚙️',
    description: 'Python libraries for reading and processing raster geospatial data.',
    role: 'Backend raster processing — band extraction, CRS reprojection, resampling, spectral index computation at scale.',
    status: 'PLANNED (backend)',
  },
  {
    id: 'langgraph',
    name: 'LangGraph',
    type: 'Agent Framework',
    icon: '🕸️',
    description: 'Graph-based LLM agent orchestration framework enabling multi-tool reasoning pipelines.',
    role: 'Future agent architecture for complex multi-step geospatial reasoning with LLM integration.',
    status: 'PLANNED',
  },
  {
    id: 'postgis',
    name: 'PostGIS',
    type: 'Geospatial Database',
    icon: '🗄️',
    description: 'Spatial extension for PostgreSQL enabling storage and querying of geospatial data.',
    role: 'Persistent storage for AOIs, analysis results, dataset metadata, and query history.',
    status: 'PLANNED',
  },
];
