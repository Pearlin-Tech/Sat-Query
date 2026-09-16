/**
 * SatQuery AI — Map Controller
 * Leaflet.js integration with AOI drawing, layer management,
 * natural language commands, and before/after comparison.
 */

import { calcPolygonArea, formatCoord, toast } from './utils.js';

let map = null;
let drawnItems = null;
let layers = {};
let drawControl = null;
let currentAOI = null;
let comparisonActive = false;

// ─────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────
export function initMap(containerId = 'leaflet-map') {
  if (map) { map.remove(); map = null; }

  map = L.map(containerId, {
    center: [23.0225, 72.5714], // Ahmedabad default
    zoom: 10,
    zoomControl: false,
    attributionControl: true,
  });

  // Google Maps Satellite Hybrid
  L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    attribution: '© Google',
    maxZoom: 20,
  }).addTo(map);

  // Custom zoom control
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // Scale
  L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(map);

  // Draw items layer
  drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  // Coordinate display on mousemove
  setupCoordinateDisplay();

  return map;
}

function setupCoordinateDisplay() {
  const display = document.getElementById('map-coords');
  if (!display) return;
  map.on('mousemove', (e) => {
    display.textContent = `${formatCoord(e.latlng.lat, true)}  ${formatCoord(e.latlng.lng, false)}`;
  });
}

// ─────────────────────────────────────────
// LAYER MANAGEMENT
// ─────────────────────────────────────────
export function addImageOverlay(dataURL, bounds, layerId, options = {}) {
  removeLayer(layerId);
  const overlay = L.imageOverlay(dataURL, bounds, {
    opacity: options.opacity || 0.85,
    ...options,
  });
  overlay.addTo(map);
  layers[layerId] = overlay;
  return overlay;
}

export function removeLayer(layerId) {
  if (layers[layerId]) {
    map.removeLayer(layers[layerId]);
    delete layers[layerId];
  }
}

export function toggleLayer(layerId, visible) {
  const layer = layers[layerId];
  if (!layer) return;
  if (visible) layer.setOpacity(0.85);
  else layer.setOpacity(0);
}

export function showOnlyLayer(layerId) {
  for (const [id, layer] of Object.entries(layers)) {
    if (id === layerId) layer.setOpacity(0.85);
    else if (id !== 'base') layer.setOpacity(0);
  }
}

export function resetLayers() {
  for (const layer of Object.values(layers)) {
    layer.setOpacity(0.85);
  }
}

// ─────────────────────────────────────────
// DEMO LAYERS
// Adds realistic-looking synthetic overlays for demo mode
// ─────────────────────────────────────────
export function addDemoNDVILayer() {
  // Ahmedabad bounding box
  const bounds = [[22.85, 72.25], [23.30, 72.85]];
  const canvas = generateDemoNDVICanvas();
  const dataURL = canvas.toDataURL('image/png');
  return addImageOverlay(dataURL, bounds, 'ndvi', { opacity: 0.8 });
}

export function addDemoChangeLayer() {
  const bounds = [[22.85, 72.25], [23.30, 72.85]];
  const canvas = generateDemoChangeCanvas();
  const dataURL = canvas.toDataURL('image/png');
  return addImageOverlay(dataURL, bounds, 'change', { opacity: 0.75 });
}

function generateDemoNDVICanvas() {
  const W = 512, H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background — dry/bare land (low NDVI)
  ctx.fillStyle = '#f9a05a';
  ctx.fillRect(0, 0, W, H);

  // Simulate vegetation patches (high NDVI)
  const vegPatches = [
    { x: 80, y: 60, r: 80, color: '#1a9850' },  // North forest
    { x: 380, y: 180, r: 60, color: '#66bd63' }, // East greenery
    { x: 220, y: 320, r: 45, color: '#1a9850' }, // Central park
    { x: 100, y: 400, r: 55, color: '#a6d96a' }, // South-west agriculture
    { x: 440, y: 380, r: 40, color: '#66bd63' }, // SE patch
    { x: 300, y: 100, r: 35, color: '#a6d96a' }, // North-east
  ];

  // Water features (low/negative NDVI)
  const water = [
    { x: 260, y: 240, w: 25, h: 180, color: '#4393c3' },  // Sabarmati River
  ];

  water.forEach(w => {
    ctx.fillStyle = w.color;
    ctx.beginPath();
    ctx.ellipse(w.x, w.y, w.w, w.h, 0.1, 0, Math.PI * 2);
    ctx.fill();
  });

  vegPatches.forEach(p => {
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    g.addColorStop(0, p.color);
    g.addColorStop(0.7, p.color + 'bb');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Urban (medium-low NDVI, orange-red)
  const urban = [
    { x: 240, y: 200, r: 100, color: '#d73027' },
    { x: 180, y: 160, r: 70, color: '#f46d43' },
    { x: 310, y: 280, r: 60, color: '#d73027' },
  ];
  urban.forEach(u => {
    ctx.fillStyle = u.color + '66';
    ctx.beginPath();
    ctx.arc(u.x, u.y, u.r, 0, Math.PI * 2);
    ctx.fill();
  });

  return canvas;
}

function generateDemoChangeCanvas() {
  const W = 512, H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  // Increased areas (green) — urban expansion
  const increased = [
    { x: 350, y: 150, r: 65, label: 'Urban expansion' },
    { x: 420, y: 260, r: 45, label: 'New development' },
    { x: 280, y: 380, r: 40, label: 'Construction' },
  ];

  // Decreased areas (red) — vegetation loss
  const decreased = [
    { x: 100, y: 120, r: 55, label: 'Vegetation loss' },
    { x: 170, y: 360, r: 45, label: 'Agricultural change' },
  ];

  decreased.forEach(d => {
    const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
    g.addColorStop(0, '#d73027dd');
    g.addColorStop(0.6, '#d7302799');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  });

  increased.forEach(i => {
    const g = ctx.createRadialGradient(i.x, i.y, 0, i.x, i.y, i.r);
    g.addColorStop(0, '#1a9850dd');
    g.addColorStop(0.6, '#1a985099');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(i.x, i.y, i.r, 0, Math.PI * 2);
    ctx.fill();
  });

  return canvas;
}

// ─────────────────────────────────────────
// AOI DRAWING TOOLS
// ─────────────────────────────────────────
export function startDrawing(type = 'rectangle', onComplete) {
  if (!map) return;

  // Remove previous draw control
  if (drawControl) {
    map.removeControl(drawControl);
    drawControl = null;
  }

  drawnItems.clearLayers();

  let handler;
  switch (type) {
    case 'rectangle':
      handler = new L.Draw.Rectangle(map, {
        shapeOptions: { color: '#00bcd4', weight: 2, fillOpacity: 0.1 }
      });
      break;
    case 'polygon':
      handler = new L.Draw.Polygon(map, {
        shapeOptions: { color: '#00bcd4', weight: 2, fillOpacity: 0.1 }
      });
      break;
    case 'circle':
      handler = new L.Draw.Circle(map, {
        shapeOptions: { color: '#00bcd4', weight: 2, fillOpacity: 0.1 }
      });
      break;
    case 'marker':
      handler = new L.Draw.Marker(map);
      break;
    default:
      handler = new L.Draw.Rectangle(map, {
        shapeOptions: { color: '#00bcd4', weight: 2, fillOpacity: 0.1 }
      });
  }

  handler.enable();

  map.once(L.Draw.Event.CREATED, (e) => {
    const layer = e.layer;
    drawnItems.addLayer(layer);
    handler.disable();

    const aoi = extractAOI(layer, type);
    currentAOI = aoi;
    onComplete?.(aoi);
  });
}

function extractAOI(layer, type) {
  let bounds, center, area = null, coords = null;

  if (type === 'rectangle' || type === 'polygon') {
    bounds = layer.getBounds();
    center = bounds.getCenter();
    if (type === 'polygon') {
      const latlngs = layer.getLatLngs()[0];
      coords = latlngs.map(ll => [ll.lat.toFixed(4), ll.lng.toFixed(4)]);
      area = calcPolygonArea(latlngs);
    } else {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      coords = [[sw.lat.toFixed(4), sw.lng.toFixed(4)], [ne.lat.toFixed(4), ne.lng.toFixed(4)]];
      const latlngs = [bounds.getSouthWest(), bounds.getNorthEast(), bounds.getNorthEast(), bounds.getSouthWest()];
      area = calcPolygonArea([
        bounds.getSouthWest(), bounds.getSouthEast(), bounds.getNorthEast(), bounds.getNorthWest()
      ]);
    }
  } else if (type === 'circle') {
    center = layer.getLatLng();
    const r = layer.getRadius();
    area = ((Math.PI * r * r) / 1e6).toFixed(2); // sq km
    coords = [[center.lat.toFixed(4), center.lng.toFixed(4)]];
    bounds = layer.getBounds();
  } else if (type === 'marker') {
    center = layer.getLatLng();
    coords = [[center.lat.toFixed(4), center.lng.toFixed(4)]];
    bounds = L.latLngBounds([center]);
  }

  return {
    type,
    bounds,
    center,
    area,
    coords,
    layer,
    timestamp: new Date().toISOString(),
  };
}

export function clearAOI() {
  drawnItems.clearLayers();
  currentAOI = null;
}

export function getAOI() { return currentAOI; }

// ─────────────────────────────────────────
// MAP POPUP (Map Copilot)
// ─────────────────────────────────────────
export function addClickPopup(onQuery) {
  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    const popupHTML = `
      <div style="min-width:220px;font-family:var(--font-sans)">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;font-family:var(--font-mono)">
          ${formatCoord(lat, true)}&nbsp;&nbsp;${formatCoord(lng, false)}
        </div>
        <div style="font-size:12px;font-weight:600;color:var(--cyan-300);margin-bottom:8px">Map Copilot</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="map-copilot-btn" data-q="What is happening here?" style="text-align:left;background:var(--bg-panel);border:1px solid var(--border-subtle);border-radius:6px;padding:6px 10px;font-size:12px;cursor:pointer;color:var(--text-secondary)">What is happening here?</button>
          <button class="map-copilot-btn" data-q="How much vegetation is present?" style="text-align:left;background:var(--bg-panel);border:1px solid var(--border-subtle);border-radius:6px;padding:6px 10px;font-size:12px;cursor:pointer;color:var(--text-secondary)">How much vegetation is present?</button>
          <button class="map-copilot-btn" data-q="What changed here?" style="text-align:left;background:var(--bg-panel);border:1px solid var(--border-subtle);border-radius:6px;padding:6px 10px;font-size:12px;cursor:pointer;color:var(--text-secondary)">What changed here?</button>
          <button class="map-copilot-btn" data-q="Compare this region with surroundings" style="text-align:left;background:var(--bg-panel);border:1px solid var(--border-subtle);border-radius:6px;padding:6px 10px;font-size:12px;cursor:pointer;color:var(--text-secondary)">Compare with surroundings</button>
        </div>
      </div>
    `;

    const popup = L.popup({ maxWidth: 280, className: 'satquery-popup' })
      .setLatLng(e.latlng)
      .setContent(popupHTML)
      .openOn(map);

    // Attach button listeners after popup opens
    setTimeout(() => {
      document.querySelectorAll('.map-copilot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const query = btn.dataset.q;
          map.closePopup();
          onQuery?.({ query, lat, lng });
        });
      });
    }, 100);
  });
}

export function removeClickPopup() {
  map.off('click');
}

// ─────────────────────────────────────────
// NATURAL LANGUAGE MAP COMMANDS
// ─────────────────────────────────────────
export function executeMapCommand(command) {
  if (!map) return false;

  switch (command.action) {
    case 'zoom_to_change':
      zoomToChangeRegion();
      return true;
    case 'show_layer':
      showOnlyLayer(command.layer);
      toast(`Showing ${command.layer} layer`, 'info', 2000);
      return true;
    case 'hide_layer':
      toggleLayer(command.layer, false);
      toast(`Hidden: ${command.layer}`, 'info', 2000);
      return true;
    case 'toggle_comparison':
      toggleBeforeAfter();
      return true;
    case 'reset_map':
      resetLayers();
      map.setView([23.0225, 72.5714], 10);
      toast('Map reset', 'info', 2000);
      return true;
    case 'zoom':
      if (command.direction === 'in') map.zoomIn();
      else map.zoomOut();
      return true;
    case 'pan':
      const panAmount = 0.05;
      const c = map.getCenter();
      const pans = { north: [panAmount, 0], south: [-panAmount, 0], east: [0, panAmount], west: [0, -panAmount] };
      const [dlat, dlng] = pans[command.direction] || [0, 0];
      map.panTo([c.lat + dlat, c.lng + dlng]);
      return true;
    default:
      return false;
  }
}

function zoomToChangeRegion() {
  // Demo: zoom to Ahmedabad urban fringe where change is highest
  map.flyTo([23.12, 72.68], 12, { duration: 1.5 });
}

function toggleBeforeAfter() {
  comparisonActive = !comparisonActive;
  if (comparisonActive) {
    toggleLayer('ndvi', true);
    toggleLayer('change', false);
    toast('Before view active — toggle again for After', 'info', 3000);
  } else {
    toggleLayer('ndvi', false);
    toggleLayer('change', true);
    toast('After view (change layer) active', 'info', 3000);
  }
}

// ─────────────────────────────────────────
// ZOOM TO LOCATION
// ─────────────────────────────────────────
export function flyToLocation(location) {
  if (!map || !location?.center) return;
  map.flyTo(location.center, location.zoom || 11, { duration: 1.5 });
}

// ─────────────────────────────────────────
// HIGHLIGHT REGION
// ─────────────────────────────────────────
export function highlightRegion(bounds, color = '#00bcd4', label = '') {
  const rect = L.rectangle(bounds, {
    color,
    weight: 2,
    fillOpacity: 0.1,
    dashArray: '6 4',
  }).addTo(map);

  if (label) {
    rect.bindTooltip(label, { permanent: true, direction: 'top', className: 'satquery-tooltip' });
  }

  layers[`highlight_${Date.now()}`] = rect;
  return rect;
}

// ─────────────────────────────────────────
// DUAL MAP (Compare Locations)
// ─────────────────────────────────────────
export function initDualMap(id1, id2, loc1, loc2) {
  const map1 = L.map(id1, { center: loc1 || [23.0225, 72.5714], zoom: 10, zoomControl: false });
  const map2 = L.map(id2, { center: loc2 || [21.1702, 72.8311], zoom: 10, zoomControl: false });

  const darkTile = () => L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    attribution: '© Google',
    subdomains: 'abcd',
  });

  darkTile().addTo(map1);
  darkTile().addTo(map2);

  // Sync zoom/pan
  map1.on('moveend', () => map2.setView(map1.getCenter(), map1.getZoom(), { animate: false }));
  map2.on('moveend', () => map1.setView(map2.getCenter(), map2.getZoom(), { animate: false }));

  return { map1, map2 };
}

// ─────────────────────────────────────────
// EXPORT MAP AS IMAGE
// ─────────────────────────────────────────
export function getMapCenter() { return map?.getCenter(); }
export function getMapZoom()   { return map?.getZoom(); }
export function getMap()       { return map; }

// ─────────────────────────────────────────
// RESIZE MAP
// ─────────────────────────────────────────
export function invalidateMap() { map?.invalidateSize(); }
