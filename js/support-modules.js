/**
 * SatQuery AI — Supporting modules
 * Voice Query, Translation, History Manager, Report Generator
 */

// ═══════════════════════════════════════════
// VOICE QUERY (Web Speech API)
// ═══════════════════════════════════════════

let recognition = null;
let isListening = false;

export function startVoiceQuery(onTranscript, onError, onEnd) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError?.('Voice input is not supported in this browser. Please use Chrome or Edge.');
    return false;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    const isFinal = e.results[0].isFinal;
    onTranscript?.({ transcript, isFinal });
  };

  recognition.onerror = (e) => {
    isListening = false;
    onError?.(e.error === 'no-speech' ? 'No speech detected. Please try again.' : `Voice error: ${e.error}`);
  };

  recognition.onend = () => {
    isListening = false;
    onEnd?.();
  };

  recognition.start();
  isListening = true;
  return true;
}

export function stopVoiceQuery() {
  recognition?.stop();
  isListening = false;
}

export function isVoiceListening() { return isListening; }

// ═══════════════════════════════════════════
// TRANSLATION
// English | Hindi | Gujarati
// Technical terms preserved
// ═══════════════════════════════════════════

const TRANSLATIONS = {
  en: {
    understood_query: 'Understood Query',
    location: 'Location',
    analysis: 'Analysis',
    required_data: 'Required Data',
    temporal: 'Temporal Requirement',
    output: 'Output',
    evidence_quality: 'Evidence Quality',
    supported: 'SUPPORTED',
    partial: 'PARTIALLY SUPPORTED',
    insufficient: 'INSUFFICIENT EVIDENCE',
    known: 'WHAT WE KNOW',
    inferred: 'WHAT WE INFER',
    cannot_determine: 'WHAT WE CANNOT DETERMINE',
    loading: 'Analyzing...',
    no_data: 'No data available',
    spatial_overlap: 'Spatial overlap detected.',
    disclaimer: 'Change detection indicates spatial difference; it does not independently establish the cause.',
    data_profile: 'Dataset Profile',
    data_health: 'Data Health',
    analysis_plan: 'Analysis Plan',
    agent_plan: 'Agent Plan',
    evidence_graph: 'Evidence Graph',
    answer_trace: 'Why did SatQuery say this?',
    challenge: 'Challenge Result',
    rerun: 'Re-run Analysis',
    vegetation: 'Vegetation',
    urban: 'Built-up',
    water: 'Water',
    change: 'Change',
    sensor_recommendation: 'Recommended Data',
    alternatives: 'Available Alternatives',
  },
  hi: {
    understood_query: 'समझी गई क्वेरी',
    location: 'स्थान',
    analysis: 'विश्लेषण',
    required_data: 'आवश्यक डेटा',
    temporal: 'समयिक आवश्यकता',
    output: 'आउटपुट',
    evidence_quality: 'साक्ष्य गुणवत्ता',
    supported: 'समर्थित',
    partial: 'आंशिक रूप से समर्थित',
    insufficient: 'अपर्याप्त साक्ष्य',
    known: 'हम क्या जानते हैं',
    inferred: 'हम क्या अनुमान लगाते हैं',
    cannot_determine: 'हम क्या निर्धारित नहीं कर सकते',
    loading: 'विश्लेषण हो रहा है...',
    no_data: 'डेटा उपलब्ध नहीं',
    spatial_overlap: 'स्थानिक अतिव्यापन का पता चला।',
    disclaimer: 'परिवर्तन का पता लगाना स्थानिक अंतर को इंगित करता है; यह स्वतंत्र रूप से कारण स्थापित नहीं करता।',
    data_profile: 'डेटासेट प्रोफाइल',
    data_health: 'डेटा स्वास्थ्य',
    analysis_plan: 'विश्लेषण योजना',
    agent_plan: 'एजेंट योजना',
    evidence_graph: 'साक्ष्य ग्राफ',
    answer_trace: 'SatQuery ने यह क्यों कहा?',
    challenge: 'परिणाम को चुनौती दें',
    rerun: 'विश्लेषण दोबारा चलाएं',
    vegetation: 'वनस्पति',
    urban: 'निर्मित क्षेत्र',
    water: 'जल',
    change: 'परिवर्तन',
    sensor_recommendation: 'अनुशंसित डेटा',
    alternatives: 'उपलब्ध विकल्प',
  },
  gu: {
    understood_query: 'સ્વીકૃત ક્વેરી',
    location: 'સ્થળ',
    analysis: 'વિશ્લેષણ',
    required_data: 'જરૂરી ડેટા',
    temporal: 'સ્થાયી જરૂરિયાત',
    output: 'આઉટપુટ',
    evidence_quality: 'પુરાવાની ગુણવત્તા',
    supported: 'સમર્થિત',
    partial: 'આંશિક સમર્થિત',
    insufficient: 'અપૂરતા પુરાવા',
    known: 'આપણે શું જાણીએ છીએ',
    inferred: 'આપણે શું અનુમાન કરીએ છીએ',
    cannot_determine: 'આપણે શું નક્કી કરી શકતા નથી',
    loading: 'વિશ્લેષણ ચાલી રહ્યું છે...',
    no_data: 'ડેટા ઉપલબ્ધ નથી',
    spatial_overlap: 'અવકાશી ઓવરલેપ શોધાયેલ.',
    disclaimer: 'ફેરફાર શોધ અવકાશી તફાવત દર્શાવે છે; તે સ્વતંત્ર રીતે કારણ સ્થાપિત કરતું નથી.',
    data_profile: 'ડેટાસેટ પ્રોફાઇલ',
    data_health: 'ડેટા આરોગ્ય',
    analysis_plan: 'વિશ્લેષણ યોજના',
    agent_plan: 'એજન્ટ યોજના',
    evidence_graph: 'પુરાવા ગ્રાફ',
    answer_trace: 'SatQuery એ આ શા માટે કહ્યું?',
    challenge: 'પરિણામ પડકારો',
    rerun: 'વિશ્લેષણ ફરી ચલાવો',
    vegetation: 'વનસ્પતિ',
    urban: 'નિર્મિત વિસ્તાર',
    water: 'પાણી',
    change: 'ફેરફાર',
    sensor_recommendation: 'ભલામણ કરેલ ડેટા',
    alternatives: 'ઉપલબ્ધ વિકલ્પો',
  },
};

let currentLang = 'en';

export function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  localStorage.setItem('satquery_lang', lang);
}

export function getLanguage() { return currentLang; }

export function t(key) {
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en?.[key] || key;
}

export function initLanguage() {
  const saved = localStorage.getItem('satquery_lang');
  if (saved && TRANSLATIONS[saved]) setLanguage(saved);
}

// ═══════════════════════════════════════════
// HISTORY MANAGER (localStorage)
// ═══════════════════════════════════════════

const HISTORY_KEY = 'satquery_history';
const MAX_HISTORY = 50;

export function saveAnalysis(entry) {
  const history = getHistory();
  const record = {
    id: crypto.randomUUID?.() ?? Date.now().toString(),
    timestamp: new Date().toISOString(),
    query: entry.query,
    intent: entry.intent,
    intentLabel: entry.intentLabel,
    location: entry.location?.name || 'Unknown',
    dataset: entry.dataset || null,
    analysisType: entry.analysisType,
    evidenceVerdict: entry.evidenceVerdict || 'PENDING',
    status: entry.status || 'completed',
    icon: entry.icon || '📊',
  };

  history.unshift(record);
  if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return record;
}

export function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}

export function deleteHistory(id) {
  const history = getHistory().filter(h => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory() { localStorage.removeItem(HISTORY_KEY); }

// ═══════════════════════════════════════════
// SAVED AOIs (localStorage)
// ═══════════════════════════════════════════

const AOI_KEY = 'satquery_aois';

export function saveAOI(name, aoi) {
  const aois = getSavedAOIs();
  aois.push({ id: Date.now().toString(), name, ...aoi, savedAt: new Date().toISOString() });
  localStorage.setItem(AOI_KEY, JSON.stringify(aois));
}

export function getSavedAOIs() {
  try { return JSON.parse(localStorage.getItem(AOI_KEY) || '[]'); }
  catch { return []; }
}

export function deleteAOI(id) {
  const aois = getSavedAOIs().filter(a => a.id !== id);
  localStorage.setItem(AOI_KEY, JSON.stringify(aois));
}

// ═══════════════════════════════════════════
// SMART REPORT GENERATOR
// ═══════════════════════════════════════════

export function generateReport(data) {
  const {
    query, plan, profile, analysisResult,
    evidenceScore, uncertainty, auditTrail, answerTrace, timestamp
  } = data;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SatQuery AI Analysis Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Space Grotesk',sans-serif;background:#f8f9fa;color:#1a1a2e;line-height:1.6}
  .report{max-width:900px;margin:0 auto;background:white;box-shadow:0 0 40px rgba(0,0,0,0.1)}
  .header{background:linear-gradient(135deg,#0a0e27,#0d1b4b);color:white;padding:40px;position:relative;overflow:hidden}
  .header::before{content:'🛰️';position:absolute;right:40px;top:50%;transform:translateY(-50%);font-size:80px;opacity:0.1}
  .header h1{font-size:28px;font-weight:700;margin-bottom:6px}
  .header .subtitle{font-size:13px;opacity:0.7;font-family:'JetBrains Mono',monospace;letter-spacing:0.06em}
  .section{padding:30px 40px;border-bottom:1px solid #e8ecf0}
  .section-title{font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;margin-bottom:16px;display:flex;align-items:center;gap:8px}
  .section-title::after{content:'';flex:1;height:1px;background:#e8ecf0;margin-left:8px}
  h2{font-size:20px;font-weight:700;color:#0d1b4b;margin-bottom:8px}
  p{color:#475569;font-size:14px;margin-bottom:10px}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px}
  .meta-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px}
  .meta-label{color:#94a3b8;font-weight:600;font-size:11px;letter-spacing:0.06em;text-transform:uppercase}
  .meta-value{color:#0d1b4b;font-family:'JetBrains Mono',monospace;font-size:12px}
  .evidence-item{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px}
  .evidence-pass{color:#16a34a}
  .evidence-fail{color:#dc2626}
  .evidence-warn{color:#d97706}
  .verdict{font-size:22px;font-weight:700;margin:16px 0}
  .verdict.supported{color:#16a34a}
  .verdict.partial{color:#d97706}
  .verdict.insufficient{color:#dc2626}
  .unc-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:#e8ecf0;border-radius:8px;overflow:hidden;margin-top:16px}
  .unc-col{background:white;padding:16px}
  .unc-label{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px}
  .unc-label.known{color:#16a34a}.unc-label.inferred{color:#d97706}.unc-label.unknown{color:#dc2626}
  .unc-item{font-size:12px;color:#475569;margin-bottom:6px;padding-left:12px;position:relative}
  .unc-item::before{content:'•';position:absolute;left:0}
  .audit-row{display:flex;gap:12px;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:12px}
  .audit-time{color:#94a3b8;font-family:'JetBrains Mono',monospace;font-size:10px;min-width:140px}
  .audit-action{color:#0d1b4b;font-weight:600}
  .audit-detail{color:#475569}
  .status-ok{color:#16a34a}.status-warn{color:#d97706}.status-error{color:#dc2626}
  .footer{padding:20px 40px;background:#f8f9fa;text-align:center;font-size:11px;color:#94a3b8;font-family:'JetBrains Mono',monospace}
  .badge{display:inline-block;padding:2px 8px;border-radius:100px;font-size:10px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase}
  .badge-live{background:#dcfce7;color:#16a34a}
  .badge-demo{background:#fef3c7;color:#d97706}
  .badge-planned{background:#f1f5f9;color:#64748b}
  .disclaimer{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;font-size:12px;color:#92400e;margin-top:16px}
  @media print{body{background:white}.report{box-shadow:none}}
</style>
</head>
<body>
<div class="report">
  <div class="header">
    <div class="subtitle">SatQuery AI — Geospatial Intelligence Platform</div>
    <h1>Analysis Report</h1>
    <div class="subtitle" style="margin-top:8px">${timestamp || new Date().toLocaleString()}</div>
  </div>

  <div class="section">
    <div class="section-title">01 — Executive Summary</div>
    <h2>${plan?.intentLabel || 'Geospatial Analysis'}</h2>
    <p>This report documents a ${plan?.intentLabel?.toLowerCase() || 'geospatial analysis'} performed using SatQuery AI on ${profile?.filename || 'uploaded imagery'}. The analysis was triggered by a natural language query and processed through the intelligent query pipeline.</p>
  </div>

  <div class="section">
    <div class="section-title">02 — User Question</div>
    <p style="font-size:16px;color:#0d1b4b;font-style:italic">"${query || plan?.originalQuery || 'N/A'}"</p>
    <div class="grid-2" style="margin-top:16px">
      <div><div class="meta-label">Intent Detected</div><div style="font-size:14px;font-weight:600;color:#0d1b4b;margin-top:4px">${plan?.intentLabel || 'N/A'}</div></div>
      <div><div class="meta-label">Location</div><div style="font-size:14px;font-weight:600;color:#0d1b4b;margin-top:4px">${plan?.location?.name || 'Not specified'}</div></div>
      <div><div class="meta-label">Temporal Range</div><div style="font-size:14px;color:#475569;margin-top:4px">${plan?.timeRange || 'Not specified'}</div></div>
      <div><div class="meta-label">Analysis Operations</div><div style="font-size:14px;color:#475569;margin-top:4px">${plan?.operations?.join(' → ') || 'N/A'}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">03 — Dataset Information</div>
    ${profile ? `
    <div>
      ${[
        ['File', profile.filename],
        ['Format', profile.format],
        ['Sensor', profile.sensor],
        ['Dimensions', profile.width ? `${profile.width} × ${profile.height} px` : 'N/A'],
        ['Bands', `${profile.bands} — ${profile.bandNames?.join(', ') || 'N/A'}`],
        ['CRS', profile.crs],
        ['Resolution', profile.resolution || 'N/A'],
        ['Acquisition Date', profile.acquisitionDate || 'Unknown'],
        ['File Size', profile.filesize],
        ['NoData', profile.nodata ? `Detected (value: ${profile.nodataValue})` : 'Not detected'],
        ['NIR Available', profile.hasNIR ? '✓ Yes — NDVI possible' : '✗ No — NDVI unavailable'],
        ['Data Health', `${profile.health}%`],
      ].map(([l,v]) => `<div class="meta-row"><span class="meta-label">${l}</span><span class="meta-value">${v}</span></div>`).join('')}
    </div>` : '<p>No dataset uploaded — analysis performed in demo mode.</p>'}
  </div>

  <div class="section">
    <div class="section-title">04 — Evidence Quality</div>
    <div class="verdict ${evidenceScore?.verdictClass || 'partial'}">${evidenceScore?.verdictIcon || '⚠'} ${evidenceScore?.verdict || 'NOT COMPUTED'}</div>
    <div>
      ${(evidenceScore?.checks || []).map(c => `
        <div class="evidence-item ${c.pass ? 'evidence-pass' : c.warn ? 'evidence-warn' : 'evidence-fail'}">
          <span>${c.pass ? '✓' : c.warn ? '⚠' : '✕'}</span>
          <span><strong>${c.label}</strong>${c.detail ? ' — ' + c.detail : ''}</span>
        </div>
      `).join('')}
    </div>
  </div>

  <div class="section">
    <div class="section-title">05 — Uncertainty Assessment</div>
    <div class="unc-grid">
      <div class="unc-col">
        <div class="unc-label known">What we know</div>
        ${(uncertainty?.known || ['Analysis completed']).map(k => `<div class="unc-item">${k}</div>`).join('')}
      </div>
      <div class="unc-col">
        <div class="unc-label inferred">What we infer</div>
        ${(uncertainty?.inferred || ['See full analysis']).map(i => `<div class="unc-item">${i}</div>`).join('')}
      </div>
      <div class="unc-col">
        <div class="unc-label unknown">Cannot determine</div>
        ${(uncertainty?.cannotDetermine || ['Causal factors']).map(c => `<div class="unc-item">${c}</div>`).join('')}
      </div>
    </div>
    <div class="disclaimer">
      ⚠️ <strong>Scientific Limitation:</strong> Change detection indicates spatial difference between observations. It does not independently establish the cause of any detected change. All results are based on spectral analysis of the provided imagery.
    </div>
  </div>

  <div class="section">
    <div class="section-title">06 — Audit Trail</div>
    <div>
      ${(auditTrail || []).map(e => `
        <div class="audit-row">
          <div class="audit-time">${e.time || ''}</div>
          <div style="flex:1">
            <span class="audit-action status-${e.status || 'ok'}">${e.action}</span>
            ${e.detail ? `<div class="audit-detail">${e.detail}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  </div>

  <div class="footer">
    Generated by SatQuery AI — Intelligent Geospatial Analysis Platform<br>
    Report generated: ${timestamp || new Date().toLocaleString()} &nbsp;|&nbsp; All analysis is evidence-based and deterministic &nbsp;|&nbsp; Demo mode: curated data
  </div>
</div>
</body>
</html>`;

  return html;
}

export function downloadReport(html, filename = 'satquery-report.html') {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
