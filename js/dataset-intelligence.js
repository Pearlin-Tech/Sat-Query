/**
 * SatQuery AI — Dataset Intelligence
 * Analyzes uploaded GeoTIFF/raster metadata without external APIs.
 * Uses geotiff.js for actual in-browser raster reading.
 */

import { formatBytes, formatDate } from './utils.js';

// ─────────────────────────────────────────
// GEOTIFF READER
// Uses geotiff.js loaded via CDN
// ─────────────────────────────────────────
export async function analyzeDataset(file) {
  const profile = {
    filename: file.name,
    filesize: formatBytes(file.size),
    format: 'Unknown',
    width: null,
    height: null,
    bands: 0,
    bandNames: [],
    crs: 'Unknown',
    resolution: null,
    nodata: false,
    nodataValue: null,
    acquisitionDate: null,
    sensor: 'Unknown',
    hasNIR: false,
    hasRed: false,
    hasGreen: false,
    hasBlue: false,
    hasSWIR: false,
    hasThermal: false,
    hasMultipleImages: false,
    cloudy: false,
    bbox: null,
    pixelStats: null,
    health: 0,
    healthChecks: [],
    raw: null,
    isGeoTIFF: false,
    pixelData: null,
    error: null,
  };

  const lname = file.name.toLowerCase();

  // Determine format
  if (lname.endsWith('.tif') || lname.endsWith('.tiff') || lname.endsWith('.geotiff')) {
    profile.format = 'GeoTIFF';
    profile.isGeoTIFF = true;
  } else if (lname.endsWith('.jpg') || lname.endsWith('.jpeg')) {
    profile.format = 'JPEG';
  } else if (lname.endsWith('.png')) {
    profile.format = 'PNG';
  } else {
    profile.format = file.type || 'Unknown';
  }

  try {
    if (profile.isGeoTIFF && window.GeoTIFF) {
      await readGeoTIFF(file, profile);
    } else if (profile.format === 'PNG' || profile.format === 'JPEG') {
      await readImageFile(file, profile);
    }
  } catch (err) {
    profile.error = `Could not fully parse file: ${err.message}`;
  }

  // Infer band types from count and filename
  inferBandTypes(profile);

  // Infer sensor
  inferSensor(profile, file.name);

  // Infer date from filename
  inferDate(profile, file.name);

  // Calculate health score
  calculateHealth(profile);

  return profile;
}

async function readGeoTIFF(file, profile) {
  const arrayBuffer = await file.arrayBuffer();
  const tiff = await window.GeoTIFF.fromArrayBuffer(arrayBuffer);
  const image = await tiff.getImage();

  profile.width = image.getWidth();
  profile.height = image.getHeight();
  profile.bands = image.getSamplesPerPixel();

  // Bounding box [west, south, east, north]
  const bbox = image.getBoundingBox();
  if (bbox) {
    profile.bbox = {
      west:  bbox[0].toFixed(4),
      south: bbox[1].toFixed(4),
      east:  bbox[2].toFixed(4),
      north: bbox[3].toFixed(4),
      center: [(bbox[1] + bbox[3]) / 2, (bbox[0] + bbox[2]) / 2],
    };
  }

  // Resolution
  const [sx, sy] = image.getResolution(image) || [null, null];
  if (sx) {
    profile.resolution = Math.abs(sx).toFixed(2) + 'm (approx)';
  }

  // CRS — file description or EPSG
  const fd = image.fileDirectory;
  if (fd?.GeoAsciiParamsTag) {
    profile.crs = fd.GeoAsciiParamsTag.trim().replace(/\|/g, '').trim();
    if (profile.crs.includes('WGS 84')) profile.crs = 'EPSG:4326';
    else if (profile.crs.includes('UTM zone 43N')) profile.crs = 'EPSG:32643';
    else if (profile.crs.includes('UTM zone 44N')) profile.crs = 'EPSG:32644';
  }

  // NoData
  const nodata = fd?.GDAL_NODATA;
  if (nodata !== undefined && nodata !== null) {
    profile.nodata = true;
    profile.nodataValue = nodata;
  }

  // Read pixel data for statistics (sample 1st band for performance)
  try {
    const rasters = await image.readRasters({ samples: [0] });
    const band1 = rasters[0];
    profile.pixelData = rasters;
    profile.pixelStats = computeStats(band1, profile.nodataValue);
  } catch(e) {
    profile.pixelStats = null;
  }

  profile.raw = fd;
}

async function readImageFile(file, profile) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      profile.width = img.naturalWidth;
      profile.height = img.naturalHeight;
      profile.bands = 3; // RGB assumed
      profile.crs = 'Unknown (non-geospatial image)';
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(); };
    img.src = url;
  });
}

function computeStats(band, nodata) {
  let min = Infinity, max = -Infinity, sum = 0, count = 0;
  for (let i = 0; i < band.length; i += 10) { // Sample every 10th pixel for speed
    const v = band[i];
    if (nodata !== null && v === parseFloat(nodata)) continue;
    if (isNaN(v) || v === 0) continue;
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
    count++;
  }
  return count > 0 ? { min: min.toFixed(2), max: max.toFixed(2), mean: (sum / count).toFixed(2), count } : null;
}

function inferBandTypes(profile) {
  const n = profile.bands;
  const fname = profile.filename?.toLowerCase() || '';

  // 4-band typical order: Blue, Green, Red, NIR (or RGB+NIR)
  if (n >= 4 || fname.includes('s2') || fname.includes('sentinel') || fname.includes('landsat') || fname.includes('ms')) {
    profile.hasBlue  = true;
    profile.hasGreen = true;
    profile.hasRed   = true;
    profile.hasNIR   = true;
    profile.bandNames = n >= 4 ? ['Blue', 'Green', 'Red', 'NIR', ...(n > 4 ? Array.from({length: n-4}, (_,i) => `Band ${i+5}`) : [])] : ['Blue', 'Green', 'Red'];
  } else if (n === 3) {
    profile.hasBlue  = true;
    profile.hasGreen = true;
    profile.hasRed   = true;
    profile.bandNames = ['Red', 'Green', 'Blue'];
  } else if (n === 1) {
    profile.bandNames = ['Panchromatic'];
  } else if (n === 2) {
    profile.bandNames = ['Band 1', 'Band 2'];
  }

  // Override from filename
  if (fname.includes('nir')) profile.hasNIR = true;
  if (fname.includes('swir')) profile.hasSWIR = true;
  if (fname.includes('thermal')) profile.hasThermal = true;
}

function inferSensor(profile, filename) {
  const fn = filename.toLowerCase();
  if (fn.includes('s1') || fn.includes('sentinel-1') || fn.includes('sentinel1')) profile.sensor = 'Sentinel-1 (SAR)';
  else if (fn.includes('s2') || fn.includes('sentinel-2') || fn.includes('sentinel2')) profile.sensor = 'Sentinel-2 (MSI)';
  else if (fn.includes('l8') || fn.includes('landsat8') || fn.includes('landsat-8')) profile.sensor = 'Landsat-8 (OLI)';
  else if (fn.includes('l9') || fn.includes('landsat9')) profile.sensor = 'Landsat-9 (OLI-2)';
  else if (fn.includes('resourcesat') || fn.includes('liss')) profile.sensor = 'ResourceSat (LISS)';
  else if (fn.includes('cartosat')) profile.sensor = 'Cartosat';
  else if (profile.bands >= 4) profile.sensor = 'Multispectral (Detected)';
  else if (profile.bands === 1) profile.sensor = 'Panchromatic';
  else if (profile.bands === 3) profile.sensor = 'RGB (Optical)';
}

function inferDate(profile, filename) {
  const yearMatch = filename.match(/20\d{2}/);
  if (yearMatch) {
    const fullDate = filename.match(/20\d{2}[-_]?\d{0,2}[-_]?\d{0,2}/);
    profile.acquisitionDate = fullDate ? fullDate[0].replace(/[-_]/g, '-') : yearMatch[0];
  }
}

function calculateHealth(profile) {
  const checks = [];
  let score = 0;

  // CRS
  const crsOk = profile.crs && profile.crs !== 'Unknown' && profile.crs !== 'Unknown (non-geospatial image)';
  checks.push({ label: 'CRS', pass: crsOk, detail: crsOk ? profile.crs : 'CRS not detected' });
  if (crsOk) score += 20;

  // Dimensions
  const dimsOk = profile.width > 0 && profile.height > 0;
  checks.push({ label: 'Dimensions', pass: dimsOk, detail: dimsOk ? `${profile.width} × ${profile.height} px` : 'Not read' });
  if (dimsOk) score += 20;

  // Band availability
  const bandsOk = profile.bands > 0;
  checks.push({ label: 'Band availability', pass: bandsOk, detail: bandsOk ? `${profile.bands} band(s): ${profile.bandNames.join(', ')}` : 'No bands detected' });
  if (bandsOk) score += 20;

  // NIR band
  checks.push({ label: 'NIR band', pass: profile.hasNIR, detail: profile.hasNIR ? 'Detected — NDVI possible' : 'Not detected — NDVI unavailable' });
  if (profile.hasNIR) score += 20;

  // Metadata
  const metaOk = profile.sensor !== 'Unknown' || profile.acquisitionDate;
  checks.push({ label: 'Metadata', pass: metaOk, detail: metaOk ? `Sensor: ${profile.sensor}` : 'Minimal metadata' });
  if (metaOk) score += 10;

  // NoData handling
  checks.push({ label: 'NoData handling', pass: true, detail: profile.nodata ? `NoData value: ${profile.nodataValue}` : 'Not detected' });
  score += 10;

  profile.health = Math.min(score, 100);
  profile.healthChecks = checks;
}

// ─────────────────────────────────────────
// COMPATIBILITY CHECK
// ─────────────────────────────────────────
export function checkCompatibility(profile, analysisType) {
  const issues = [];

  if (analysisType === 'ndvi' || analysisType === 'vegetation') {
    if (!profile.hasNIR) issues.push({ type: 'blocker', message: 'NIR band required for NDVI', suggestion: 'Upload Sentinel-2 or Landsat multispectral data.' });
    if (!profile.hasRed) issues.push({ type: 'blocker', message: 'Red band required for NDVI' });
  }

  if (analysisType === 'change') {
    if (!profile.hasMultipleImages) issues.push({ type: 'blocker', message: 'Change detection requires two images', suggestion: 'Upload a second image for comparison.' });
  }

  return issues;
}

// ─────────────────────────────────────────
// DUMMY PROFILE (for demo without upload)
// ─────────────────────────────────────────
export function createDemoProfile() {
  return {
    filename: 'ahmedabad_sentinel2_2023.tif',
    filesize: '42.3 MB',
    format: 'GeoTIFF',
    width: 10980,
    height: 10980,
    bands: 4,
    bandNames: ['Blue', 'Green', 'Red', 'NIR'],
    crs: 'EPSG:32643 (WGS84 / UTM Zone 43N)',
    resolution: '10.0m',
    nodata: true,
    nodataValue: 0,
    acquisitionDate: '2023-11-15',
    sensor: 'Sentinel-2 MSI (Simulated)',
    hasNIR: true,
    hasRed: true,
    hasGreen: true,
    hasBlue: true,
    hasSWIR: false,
    hasThermal: false,
    hasMultipleImages: true,
    cloudy: false,
    bbox: { west: '72.25', south: '22.85', east: '72.85', north: '23.30', center: [23.075, 72.55] },
    health: 100,
    healthChecks: [
      { label: 'CRS',              pass: true, detail: 'EPSG:32643' },
      { label: 'Dimensions',       pass: true, detail: '10980 × 10980 px' },
      { label: 'Band availability',pass: true, detail: '4 bands: Blue, Green, Red, NIR' },
      { label: 'NIR band',         pass: true, detail: 'Detected — NDVI possible' },
      { label: 'Metadata',         pass: true, detail: 'Sensor: Sentinel-2 MSI' },
      { label: 'NoData handling',  pass: true, detail: 'NoData = 0' },
    ],
    pixelStats: { min: '0.00', max: '10000.00', mean: '1845.32', count: 1200000 },
    isGeoTIFF: true,
    isDemo: true,
    error: null,
  };
}
