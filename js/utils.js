/**
 * SatQuery AI — Utilities
 * Shared helpers used across all modules
 */

// ─────────────────────────────────────────
// DOM HELPERS
// ─────────────────────────────────────────
export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

export function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') element.className = v;
    else if (k === 'innerHTML') element.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') element.addEventListener(k.slice(2).toLowerCase(), v);
    else element.setAttribute(k, v);
  }
  for (const child of children) {
    if (child == null) continue;
    if (typeof child === 'string') element.appendChild(document.createTextNode(child));
    else element.appendChild(child);
  }
  return element;
}

export function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

// ─────────────────────────────────────────
// ANIMATION
// ─────────────────────────────────────────
export function animateIn(el, className = 'animate-slide-up', delay = 0) {
  el.style.animationDelay = `${delay}ms`;
  el.classList.add(className);
}

export function staggerAnimate(elements, className = 'animate-slide-up', baseDelay = 0, step = 80) {
  elements.forEach((el, i) => {
    el.style.animationDelay = `${baseDelay + i * step}ms`;
    el.classList.add(className);
  });
}

// ─────────────────────────────────────────
// TOAST NOTIFICATIONS
// ─────────────────────────────────────────
export function toast(message, type = 'info', duration = 4000) {
  const icons = { info: '💡', success: '✓', warning: '⚠️', error: '✕' };
  const container = $('#toast-container');
  if (!container) return;

  const t = el('div', { className: `toast toast-${type}`, role: 'alert', 'aria-live': 'polite' });
  t.innerHTML = `
    <span style="font-size:18px;line-height:1">${icons[type] || '💡'}</span>
    <div style="flex:1">
      <div style="font-size:var(--text-sm);font-weight:500;color:var(--text-primary)">${message}</div>
    </div>
    <button class="icon-btn" onclick="this.closest('.toast').remove()" aria-label="Close notification">✕</button>
  `;

  container.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toast-out 300ms ease forwards';
    setTimeout(() => t.remove(), 300);
  }, duration);
}

// ─────────────────────────────────────────
// TYPEWRITER EFFECT
// ─────────────────────────────────────────
export async function typewriter(element, text, speed = 30) {
  const isInput = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
  if (isInput) {
    element.value = '';
  } else {
    element.textContent = '';
    element.classList.add('typewriter-cursor');
  }
  for (const char of String(text)) {
    if (isInput) element.value += char;
    else element.textContent += char;
    await sleep(speed);
  }
  if (!isInput) element.classList.remove('typewriter-cursor');
}

// ─────────────────────────────────────────
// SLEEP
// ─────────────────────────────────────────
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─────────────────────────────────────────
// FORMAT HELPERS
// ─────────────────────────────────────────
export function formatCoord(val, isLat = true) {
  const abs = Math.abs(val).toFixed(4);
  const dir = isLat ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W');
  return `${abs}° ${dir}`;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDate(date) {
  if (!date) return 'Unknown';
  return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatTimestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST';
}

// ─────────────────────────────────────────
// AREA CALCULATION
// ─────────────────────────────────────────
export function calcPolygonArea(latlngs) {
  // Shoelace formula in geographic coords → approximate sq km
  if (!latlngs || latlngs.length < 3) return null;
  let area = 0;
  const n = latlngs.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += latlngs[i].lng * latlngs[j].lat;
    area -= latlngs[j].lng * latlngs[i].lat;
  }
  area = Math.abs(area) / 2;
  // Convert to sq km (approx at ~23° lat for Gujarat)
  const sqKm = area * 111.32 * 111.32 * Math.cos(23 * Math.PI / 180);
  return sqKm.toFixed(2);
}

// ─────────────────────────────────────────
// LOCAL STORAGE
// ─────────────────────────────────────────
export function lsGet(key, def = null) {
  try { return JSON.parse(localStorage.getItem(key)) ?? def; }
  catch { return def; }
}

export function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.warn('localStorage write failed:', e); }
}

// ─────────────────────────────────────────
// DEBOUNCE
// ─────────────────────────────────────────
export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ─────────────────────────────────────────
// MODAL MANAGEMENT
// ─────────────────────────────────────────
export function openModal(id) {
  const backdrop = $(`#${id}`);
  if (!backdrop) return;
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal(id);
  }, { once: true });
  // Trap focus
  const firstFocusable = backdrop.querySelector('button, input, textarea, select, a');
  firstFocusable?.focus();
}

export function closeModal(id) {
  const backdrop = $(`#${id}`);
  if (!backdrop) return;
  backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

// ─────────────────────────────────────────
// UUID
// ─────────────────────────────────────────
export function uuid() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─────────────────────────────────────────
// GREETING
// ─────────────────────────────────────────
export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// ─────────────────────────────────────────
// ICON REGISTRY
// ─────────────────────────────────────────
export const ICONS = {
  vegetation: '🌿',
  change: '🔄',
  buildup: '🏗️',
  water: '💧',
  location: '📍',
  sar: '📡',
  ndvi: '🌱',
  thermal: '🌡️',
  flood: '🌊',
  cloud: '☁️',
  sun: '☀️',
  alert: '⚠️',
  success: '✓',
  fail: '✕',
  info: '💡',
  pin: '📌',
  zoom: '🔍',
  layer: '🗺️',
  export: '📤',
  history: '📋',
  ai: '🤖',
  satellite: '🛰️',
  chart: '📊',
  report: '📄',
  voice: '🎙️',
  compare: '⚖️',
  research: '🔬',
  plan: '📋',
  evidence: '🔍',
  challenge: '⚡',
};

