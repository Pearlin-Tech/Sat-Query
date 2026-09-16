/**
 * SatQuery AI — Main Application
 * Router, state manager, view orchestration.
 * THE WOW MOMENT: ASK → UNDERSTAND → SEE
 */

import { parseQuery, generateSuggestions, parseMapCommand } from './query-intelligence.js';
import { analyzeDataset, createDemoProfile } from './dataset-intelligence.js';
import { computeNDVI, computeNDWI, computeChangeDetection, rgbaToDataURL,
         generateDemoNDVIResult, generateDemoChangeResult, runAnalysis } from './analysis-engine.js';
import { computeEvidenceScore, buildUncertaintyPanel, buildAnswerTrace,
         buildChangeExplanation, buildAuditTrail, suggestAlternatives,
         recommendSensor } from './evidence-engine.js';
import { routeToTools, buildAgentPlan, animateAgentPlan, explainToolSelection } from './agent-orchestrator.js';
import { initMap, addDemoNDVILayer, addDemoChangeLayer, flyToLocation,
         startDrawing, clearAOI, getAOI, addClickPopup,
         executeMapCommand, invalidateMap } from './map-controller.js';
import { startVoiceQuery, stopVoiceQuery, isVoiceListening,
         t, initLanguage, setLanguage, getLanguage,
         saveAnalysis, getHistory, deleteHistory,
         saveAOI, getSavedAOIs, generateReport, downloadReport } from './support-modules.js';
import { DEMO_SCENARIOS, DEMO_SCRIPT, INSIGHT_OF_THE_DAY, JUDGE_MODE_DATA,
         SYSTEM_HEALTH, DATA_SOURCES, RESEARCH_MODELS } from './demo-data.js';
import { $, $$, el, sleep, toast, formatDate, formatTimestamp,
         getGreeting, lsGet, lsSet, uuid, staggerAnimate, animateIn, ICONS } from './utils.js';
import { initGEE, isGeeReady, getLiveNDVI } from './gee-engine.js';

// ─────────────────────────────────────────
// APPLICATION STATE
// ─────────────────────────────────────────
const state = {
  currentView: 'home',
  currentPlan: null,
  currentProfile: null,
  currentAnalysisResult: null,
  currentEvidenceScore: null,
  currentUncertainty: null,
  currentAuditTrail: null,
  currentAnswerTrace: null,
  currentToolPlan: null,
  currentAgentNodes: null,
  isAnalyzing: false,
  isDemoMode: false,
  isExpertMode: false,
  language: 'en',
  mapInitialized: false,
  aoiActive: false,
  activeLayers: { ndvi: false, change: false, water: false, buildup: false },
  timelineYear: 2023,
};

// ─────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────
function navigateTo(viewId) {
  $$('.nav-item').forEach(n => n.classList.remove('active'));
  $(`.nav-item[data-view="${viewId}"]`)?.classList.add('active');

  $$('.view').forEach(v => v.classList.remove('active'));
  const targetView = $(`#${viewId}-view`);
  if (targetView) {
    targetView.classList.add('active');
    targetView.classList.add('view-enter');
    setTimeout(() => targetView.classList.remove('view-enter'), 400);
  }

  state.currentView = viewId;

  // Lazy-init map when workspace is first opened
  if (viewId === 'workspace' && !state.mapInitialized) {
    setTimeout(() => {
      initMapModule();
      state.mapInitialized = true;
    }, 100);
  } else if (viewId === 'workspace') {
    invalidateMap();
  }

  // Update topbar title
  const titles = {
    home: 'Dashboard',
    workspace: 'Analysis Workspace',
    history: 'My Analyses',
    datasources: 'Data Sources',
    research: 'Research Lab',
    health: 'System Health',
    judge: 'Judge Mode',
    architecture: 'Architecture',
    compare: 'Compare Locations',
    monitoring: 'Monitor Area',
  };
  $('#topbar-title').textContent = titles[viewId] || 'SatQuery AI';
}

// ─────────────────────────────────────────
// MAP INITIALIZATION
// ─────────────────────────────────────────
function initMapModule() {
  initMap('leaflet-map');
  addClickPopup((data) => {
    $('#query-input').value = data.query;
    handleQuery(data.query);
  });
}

// ─────────────────────────────────────────
// THE WOW MOMENT: QUERY → PLAN → ANALYZE → VISUALIZE
// ─────────────────────────────────────────
async function handleQuery(queryText) {
  if (!queryText.trim()) return;
  if (state.isAnalyzing) return;

  state.isAnalyzing = true;

  // Navigate to workspace
  navigateTo('workspace');
  await sleep(150);
  invalidateMap();

  // 1. UNDERSTAND: Parse query into structured plan
  const plan = parseQuery(queryText, state.currentProfile);
  state.currentPlan = plan;
  renderQueryPlan(plan);

  // 2. ROUTE: Select tools
  const toolPlan = routeToTools(plan, state.currentProfile);
  state.currentToolPlan = toolPlan;
  const agentNodes = buildAgentPlan(queryText, toolPlan);
  state.currentAgentNodes = agentNodes;
  renderAgentPlan(agentNodes);

  // 3. STEP TRACKER: Show analysis plan steps
  renderAnalysisSteps(plan);

  // 4. FLY MAP to location
  if (plan.location?.center) {
    flyToLocation(plan.location);
  }

  // 5. RUN: Execute analysis steps with callbacks
  await runAnalysis(plan, state.currentProfile, (stepIdx, status, step) => {
    updateStepStatus(stepIdx, status, step);
    if (stepIdx < agentNodes.length) {
      updateAgentNode(stepIdx, status === 'active' ? 'active' : status === 'completed' ? 'completed' : 'blocked');
    }
  });

  // 6. COMPUTE: Real/demo analysis
  let analysisResult = null;
  const hasBlockers = plan.validation.blockers.length > 0;

  if (!hasBlockers) {
    if (state.currentProfile?.pixelData) {
      // Real computation on uploaded GeoTIFF
      const { red = 2, nir = 3 } = {};
      if (plan.operations.includes('NDVI')) {
        analysisResult = await computeNDVI(
          state.currentProfile.pixelData,
          state.currentProfile.width,
          state.currentProfile.height
        );
      }
    } else {
      // Demo mode: use curated results
      if (plan.intent === 'vegetation_change' || plan.intent === 'vegetation_current') {
        const stats = generateDemoNDVIResult('ahmedabad_2023');
        analysisResult = { type: 'ndvi', stats, formula: '(NIR - Red) / (NIR + Red)', isDemo: true };
      } else if (plan.intent === 'change_detection' || plan.intent === 'urban_expansion') {
        analysisResult = { ...generateDemoChangeResult(), isDemo: true };
      } else if (plan.intent === 'combined_urban_vegetation') {
        analysisResult = { type: 'combined', isDemo: true,
          ndvi: generateDemoNDVIResult('ahmedabad_change'),
          change: generateDemoChangeResult() };
      }
    }

    // 7. ADD MAP LAYERS
    await sleep(400);
    if (plan.operations.includes('NDVI') || plan.intent.includes('vegetation')) {
      const layer = addDemoNDVILayer();
      state.activeLayers.ndvi = true;
      updateLayerToggles();
    }
    if (plan.operations.includes('change_detection') || plan.intent.includes('change') || plan.intent === 'urban_expansion') {
      addDemoChangeLayer();
      state.activeLayers.change = true;
      updateLayerToggles();
    }
  }

  state.currentAnalysisResult = analysisResult;

  // 8. EVIDENCE: Compute evidence score
  const evidenceScore = computeEvidenceScore(plan, state.currentProfile, analysisResult);
  const uncertainty = buildUncertaintyPanel(plan, analysisResult);
  const auditTrail = buildAuditTrail(plan, state.currentProfile, analysisResult);
  const answerTrace = buildAnswerTrace(plan, state.currentProfile, analysisResult, evidenceScore);

  state.currentEvidenceScore = evidenceScore;
  state.currentUncertainty = uncertainty;
  state.currentAuditTrail = auditTrail;
  state.currentAnswerTrace = answerTrace;

  // 9. RENDER RIGHT PANEL: Evidence, answer, uncertainty
  renderResultPanel(plan, analysisResult, evidenceScore, uncertainty, answerTrace, auditTrail, toolPlan);

  // 10. SAVE TO HISTORY
  saveAnalysis({
    query: queryText,
    intent: plan.intent,
    intentLabel: plan.intentLabel,
    location: plan.location,
    dataset: state.currentProfile?.filename || 'Demo',
    analysisType: plan.operations.join(', '),
    evidenceVerdict: evidenceScore.verdict,
    status: hasBlockers ? 'blocked' : 'completed',
    icon: plan.intentIcon,
  });

  // 11. SUGGEST next queries
  renderSuggestions(generateSuggestions(state.currentProfile));

  state.isAnalyzing = false;

  // 12. TOAST completion
  toast(hasBlockers ? `Analysis blocked — ${plan.validation.blockers[0]?.message}` : `Analysis complete: ${evidenceScore.verdict}`,
    hasBlockers ? 'warning' : 'success');
}

// ─────────────────────────────────────────
// RENDER FUNCTIONS
// ─────────────────────────────────────────

function renderQueryPlan(plan) {
  const container = $('#query-plan-container');
  if (!container) return;
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'query-plan-card';
  card.innerHTML = `
    <div class="query-plan-header">
      <div class="query-plan-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        ${t('understood_query')}
      </div>
      <button class="btn btn-ghost btn-sm" id="edit-plan-btn" aria-label="Edit analysis plan">✏️ Edit</button>
    </div>
    <div class="query-plan-rows">
      ${renderPlanRow('Intent', `${plan.intentIcon} ${plan.intentLabel}`)}
      ${renderPlanRow('Location', plan.location?.name || 'Not specified')}
      ${renderPlanRow('Analysis', plan.operations?.join(' → ') || 'N/A')}
      ${renderPlanRow('Required data', plan.requiredBands?.join(' + ') || 'N/A')}
      ${renderPlanRow('Temporal', plan.timeRange || 'Not specified')}
      ${renderPlanRow('Output', plan.output?.join(', ') || 'N/A')}
      ${renderPlanRow('Sensor', plan.sensor || 'Not specified')}
    </div>
    ${plan.validation.blockers.length > 0 ? `
      <div style="margin-top:var(--space-3);background:hsla(350,80%,42%,0.1);border:1px solid hsla(350,80%,42%,0.3);border-radius:var(--radius-md);padding:var(--space-3)">
        <div style="font-size:var(--text-xs);font-weight:700;color:var(--rose-300);margin-bottom:var(--space-2)">⚠ ANALYSIS BLOCKED</div>
        ${plan.validation.blockers.map(b => `
          <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--space-1)">• ${b.message}</div>
          ${b.suggestion ? `<div style="font-size:var(--text-xs);color:var(--cyan-300)">→ ${b.suggestion}</div>` : ''}
        `).join('')}
      </div>
    ` : ''}
    ${plan.validation.warnings.length > 0 ? `
      <div style="margin-top:var(--space-3);background:hsla(38,95%,58%,0.08);border:1px solid hsla(38,95%,58%,0.25);border-radius:var(--radius-md);padding:var(--space-3)">
        ${plan.validation.warnings.map(w => `<div style="font-size:var(--text-xs);color:var(--amber-300)">⚠ ${w.message}</div>`).join('')}
      </div>
    ` : ''}
  `;

  container.appendChild(card);
  animateIn(card, 'animate-slide-up');
}

function renderPlanRow(label, value) {
  return `<div class="query-plan-row"><div class="plan-row-label">${label}</div><div class="plan-row-value">${value}</div></div>`;
}

function renderAnalysisSteps(plan) {
  const container = $('#analysis-steps-container');
  if (!container) return;
  container.innerHTML = '';

  const stepsEl = document.createElement('div');
  stepsEl.className = 'analysis-steps';
  stepsEl.id = 'steps-list';

  (plan.steps || []).forEach((step, i) => {
    const stepEl = document.createElement('div');
    stepEl.className = 'analysis-step';
    stepEl.id = `step-${i}`;
    stepEl.innerHTML = `
      <div class="step-indicator" aria-label="Step ${step.id}">${step.id}</div>
      <div class="step-body">
        <div class="step-title" onclick="this.nextElementSibling.classList.toggle('open')">
          ${step.title}
          <span style="color:var(--text-muted);font-size:12px">▾</span>
        </div>
        <div class="step-detail">${step.detail || ''}</div>
      </div>
    `;
    stepsEl.appendChild(stepEl);
  });

  container.appendChild(stepsEl);
}

function updateStepStatus(idx, status) {
  const stepEl = $(`#step-${idx}`);
  if (!stepEl) return;
  stepEl.classList.remove('active', 'completed', 'blocked');
  if (status === 'active') stepEl.classList.add('active');
  else if (status === 'completed') {
    stepEl.classList.add('completed');
    stepEl.querySelector('.step-indicator').textContent = '✓';
  }
  else if (status === 'blocked') {
    stepEl.querySelector('.step-indicator').textContent = '✕';
    stepEl.querySelector('.step-indicator').style.color = 'var(--rose-300)';
  }
}

function renderAgentPlan(nodes) {
  const container = $('#agent-plan-container');
  if (!container) return;
  container.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'panel-title';
  title.innerHTML = `<span>🤖</span> Agent Plan`;
  container.appendChild(title);

  const graph = document.createElement('div');
  graph.className = 'evidence-graph';
  graph.id = 'agent-graph';

  nodes.forEach((node, i) => {
    if (i > 0) {
      const arrow = document.createElement('div');
      arrow.className = 'graph-arrow';
      arrow.style.animationDelay = `${i * 100}ms`;
      graph.appendChild(arrow);
    }

    const nodeEl = document.createElement('div');
    nodeEl.className = `graph-node`;
    nodeEl.id = `agent-node-${i}`;
    nodeEl.style.animationDelay = `${i * 100}ms`;
    nodeEl.setAttribute('role', 'button');
    nodeEl.setAttribute('tabindex', '0');
    nodeEl.setAttribute('aria-label', `${node.label}: ${node.value}`);
    nodeEl.innerHTML = `
      <div class="graph-node-label">${node.icon || ''} ${node.label}</div>
      <div class="graph-node-value">${node.value}</div>
      ${node.statusBadge ? `<span class="badge badge-${node.statusBadge.toLowerCase()}" style="margin-top:4px">${node.statusBadge}</span>` : ''}
      ${node.degraded ? `<div style="font-size:var(--text-xs);color:var(--amber-300);margin-top:4px">⚠ Degraded mode</div>` : ''}
    `;

    // Click to show tool detail
    if (node.type === 'tool') {
      nodeEl.onclick = () => showToolDetail(node);
    }

    graph.appendChild(nodeEl);
  });

  container.appendChild(graph);
}

function updateAgentNode(idx, status) {
  const nodeEl = $(`#agent-node-${idx}`);
  if (!nodeEl) return;
  nodeEl.classList.remove('active-node');
  if (status === 'active') nodeEl.classList.add('active-node');
  else if (status === 'completed') {
    nodeEl.style.borderColor = 'var(--green-400)';
    nodeEl.style.boxShadow = 'var(--glow-green)';
  }
}

function renderResultPanel(plan, analysisResult, evidenceScore, uncertainty, answerTrace, auditTrail, toolPlan) {
  const container = $('#result-panel');
  if (!container) return;
  container.innerHTML = '';

  // Evidence Score
  const evidenceEl = document.createElement('div');
  evidenceEl.className = 'workspace-panel';
  evidenceEl.innerHTML = `
    <div class="panel-header">
      <div class="panel-title"><span>🔍</span> ${t('evidence_quality')}</div>
    </div>
    <div class="evidence-score">
      <div class="evidence-verdict ${evidenceScore.verdictClass}">
        ${evidenceScore.verdictIcon} ${evidenceScore.verdict}
      </div>
      <div class="evidence-checklist">
        ${evidenceScore.checks.map(c => `
          <div class="evidence-item ${c.pass ? 'pass' : c.warn ? 'warn' : 'fail'}">
            <span>${c.pass ? '✓' : c.warn ? '⚠' : '✕'}</span>
            <span>${c.label}${c.detail ? ` <span style="color:var(--text-muted);font-size:var(--text-xs)">— ${c.detail}</span>` : ''}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  container.appendChild(evidenceEl);

  // Statistics (if result available)
  if (analysisResult && !plan.validation.blockers.length) {
    const statsEl = document.createElement('div');
    statsEl.className = 'workspace-panel';
    statsEl.innerHTML = renderStatistics(analysisResult, plan);
    container.appendChild(statsEl);
  }

  // Uncertainty Panel
  const uncEl = document.createElement('div');
  uncEl.className = 'workspace-panel';
  uncEl.innerHTML = `
    <div class="panel-header">
      <div class="panel-title">Uncertainty Assessment</div>
    </div>
    <div class="uncertainty-panel">
      <div class="uncertainty-col">
        <div class="uncertainty-label known">What we know</div>
        ${uncertainty.known.map(k => `<div class="uncertainty-text" style="margin-bottom:var(--space-1)">• ${k}</div>`).join('')}
      </div>
      <div class="uncertainty-col">
        <div class="uncertainty-label inferred">What we infer</div>
        ${uncertainty.inferred.map(i => `<div class="uncertainty-text" style="margin-bottom:var(--space-1)">• ${i}</div>`).join('')}
      </div>
      <div class="uncertainty-col">
        <div class="uncertainty-label unknown">Cannot determine</div>
        ${uncertainty.cannotDetermine.map(c => `<div class="uncertainty-text" style="margin-bottom:var(--space-1)">• ${c}</div>`).join('')}
      </div>
    </div>
  `;
  container.appendChild(uncEl);

  // Tool Selection Explanation
  if (toolPlan?.tools?.length > 0) {
    const toolEl = document.createElement('div');
    toolEl.className = 'workspace-panel';
    toolEl.innerHTML = `
      <div class="panel-header">
        <div class="panel-title">🛠️ Selected Tool</div>
      </div>
      ${toolPlan.tools.map(tool => {
        const explain = explainToolSelection(tool, plan);
        return `
          <div style="background:hsla(265,65%,40%,0.08);border:1px solid hsla(265,65%,40%,0.2);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-2)">
            <div style="font-size:var(--text-sm);font-weight:600;color:var(--purple-300);margin-bottom:var(--space-1)">${tool.icon} ${tool.name}</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--space-1)">WHY?</div>
            <div style="font-size:var(--text-xs);color:var(--text-secondary);font-style:italic">"${explain.reason}"</div>
            ${explain.formula ? `<div class="formula-box" style="margin-top:var(--space-2)">${explain.formula}</div>` : ''}
            ${explain.note ? `<div style="font-size:var(--text-xs);color:var(--amber-300);margin-top:var(--space-1)">ℹ ${explain.note}</div>` : ''}
          </div>
        `;
      }).join('')}
    `;
    container.appendChild(toolEl);
  }

  // Answer Trace
  const traceEl = document.createElement('div');
  traceEl.className = 'workspace-panel';
  const traceId = `trace-${Date.now()}`;
  traceEl.innerHTML = `
    <div class="panel-header">
      <div class="panel-title">❓ ${t('answer_trace')}</div>
      <button class="btn btn-ghost btn-sm" onclick="$('#${traceId}').classList.toggle('open')">Show ▾</button>
    </div>
    <div id="${traceId}" class="answer-trace" style="display:none">
      ${answerTrace.map(r => `
        <div class="trace-row">
          <div class="trace-label">${r.label}</div>
          <div class="trace-value">${r.value}</div>
        </div>
      `).join('')}
    </div>
    <script>
      document.getElementById('${traceId}').previousElementSibling.querySelector('button').onclick = function() {
        const el = document.getElementById('${traceId}');
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
        this.textContent = el.style.display === 'none' ? 'Show ▾' : 'Hide ▴';
      }
    </script>
  `;
  container.appendChild(traceEl);

  // Challenge Result
  const challengeEl = document.createElement('div');
  challengeEl.className = 'workspace-panel';
  challengeEl.innerHTML = `
    <div class="panel-header">
      <div class="panel-title">⚡ ${t('challenge')}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:var(--space-2)">
      <button class="btn btn-secondary btn-sm" onclick="app.showEvidenceModal()">Show Evidence</button>
      <button class="btn btn-secondary btn-sm" onclick="app.rerunAnalysis()">Recalculate</button>
      <button class="btn btn-secondary btn-sm" onclick="app.changeRegion()">Change Region</button>
      <button class="btn btn-secondary btn-sm" onclick="app.inspectInput()">Inspect Input</button>
    </div>
  `;
  container.appendChild(challengeEl);

  // Alternatives if blocked
  if (plan.validation.blockers.length > 0) {
    const altEl = document.createElement('div');
    altEl.className = 'workspace-panel';
    const alternatives = suggestAlternatives(plan.validation.blockers[0]);
    altEl.innerHTML = `
      <div class="panel-header">
        <div class="panel-title">💡 ${t('alternatives')}</div>
      </div>
      ${alternatives.map(a => `
        <div style="background:var(--bg-panel);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-2);cursor:pointer"
             onclick="$('#query-input').value='${a.label}'" class="suggestion-chip" style="text-align:left">
          <div style="font-size:var(--text-sm);font-weight:600;color:var(--cyan-300)">→ ${a.label}</div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px">${a.detail}</div>
        </div>
      `).join('')}
    `;
    container.appendChild(altEl);
  }

  // Sensor Recommendation
  const sensorRec = recommendSensor(plan.intent);
  const sensorEl = document.createElement('div');
  sensorEl.className = 'workspace-panel';
  sensorEl.innerHTML = `
    <div class="panel-header">
      <div class="panel-title">📡 ${t('sensor_recommendation')}</div>
    </div>
    <div>
      <div style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-1)">${sensorRec.sensor}</div>
      <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--space-2)">${sensorRec.reason}</div>
      <div style="font-size:var(--text-xs);color:var(--text-muted)">Examples: ${sensorRec.examples.join(', ')}</div>
      ${sensorRec.note ? `<div class="badge badge-planned" style="margin-top:var(--space-2)">PLANNED integration</div>` : ''}
    </div>
  `;
  container.appendChild(sensorEl);

  // Stagger animate
  staggerAnimate(container.children, 'animate-slide-up', 0, 60);
}

function renderStatistics(result, plan) {
  if (!result) return '';
  const { stats, type } = result;
  const isDemo = result.isDemo ? `<span class="badge badge-demo" style="margin-left:var(--space-2)">DEMO</span>` : '';

  if (type === 'ndvi' || plan.intent.includes('vegetation')) {
    return `
      <div class="panel-header">
        <div class="panel-title">📊 NDVI Statistics ${isDemo}</div>
      </div>
      <div class="formula-box" style="margin-bottom:var(--space-3)">NDVI = (NIR - Red) / (NIR + Red)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);margin-bottom:var(--space-3)">
        <div class="stat-card"><div class="stat-label">Mean NDVI</div><div class="stat-value" style="font-size:var(--text-2xl);color:var(--green-300)">${stats.mean}</div></div>
        <div class="stat-card"><div class="stat-label">Max NDVI</div><div class="stat-value" style="font-size:var(--text-2xl);color:var(--green-400)">${stats.max}</div></div>
        <div class="stat-card"><div class="stat-label">Vegetation</div><div class="stat-value stat-change-positive" style="font-size:var(--text-2xl)">${stats.vegetationPct}%</div></div>
        <div class="stat-card"><div class="stat-label">Water/Urban</div><div class="stat-value stat-change-negative" style="font-size:var(--text-2xl)">${stats.waterPct || '3.8'}%</div></div>
      </div>
      <div class="legend-bar ndvi-legend"></div>
      <div class="legend-labels"><span>−1 (Water)</span><span>0 (Bare)</span><span>+1 (Vegetation)</span></div>
    `;
  }

  if (type === 'change') {
    return `
      <div class="panel-header">
        <div class="panel-title">📊 Change Detection ${isDemo}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-2);margin-bottom:var(--space-3)">
        <div class="stat-card"><div class="stat-label">Increased</div><div class="stat-value stat-change-positive" style="font-size:var(--text-2xl)">${stats.increasedPct}%</div></div>
        <div class="stat-card"><div class="stat-label">Decreased</div><div class="stat-value stat-change-negative" style="font-size:var(--text-2xl)">${stats.decreasedPct}%</div></div>
        <div class="stat-card"><div class="stat-label">Unchanged</div><div class="stat-value" style="font-size:var(--text-2xl)">${stats.unchangedPct}%</div></div>
      </div>
      <div class="legend-bar change-legend"></div>
      <div class="legend-labels"><span>Decrease</span><span>No change</span><span>Increase</span></div>
      <div style="margin-top:var(--space-3);padding:var(--space-3);background:hsla(38,95%,58%,0.08);border:1px solid hsla(38,95%,58%,0.2);border-radius:var(--radius-md);font-size:var(--text-xs);color:var(--amber-300)">
        ⚠ Spatial overlap detected — this does not independently establish a causal relationship.
      </div>
    `;
  }

  return '';
}

// ─────────────────────────────────────────
// DATASET UPLOAD HANDLER
// ─────────────────────────────────────────
async function handleFileUpload(file) {
  if (!file) return;

  toast(`Loading ${file.name}...`, 'info', 2000);

  const profile = await analyzeDataset(file);
  state.currentProfile = profile;

  renderDatasetProfile(profile);
  renderSuggestions(generateSuggestions(profile));
  toast(`Dataset loaded: ${profile.health}% health score`, 'success');
}

function renderDatasetProfile(profile) {
  const container = $('#dataset-profile-container');
  if (!container) return;

  const healthPct = profile.health;
  const healthColor = healthPct >= 80 ? 'var(--green-400)' : healthPct >= 50 ? 'var(--amber-400)' : 'var(--rose-400)';

  container.innerHTML = `
    <div class="dataset-profile">
      <div class="dataset-profile-header">
        <div style="font-size:var(--text-xs);font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--cyan-300);margin-bottom:var(--space-2)">
          📂 Dataset Profile ${profile.isDemo ? '<span class="badge badge-demo">DEMO</span>' : ''}
        </div>
        <div style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-1)">${profile.filename}</div>
        <div style="font-size:var(--text-xs);color:var(--text-muted)">${profile.sensor} · ${profile.filesize}</div>

        <div style="margin-top:var(--space-3)">
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-1)">
            <span style="font-size:var(--text-xs);color:var(--text-muted)">DATA HEALTH</span>
            <span style="font-size:var(--text-xs);font-family:var(--font-mono);color:${healthColor};font-weight:600">${healthPct}%</span>
          </div>
          <div class="data-health-bar">
            <div class="data-health-fill" style="width:${healthPct}%;background:linear-gradient(to right, ${healthColor}, ${healthColor}cc)"></div>
          </div>
        </div>
      </div>

      <div class="dataset-meta-grid">
        ${[
          ['Dimensions', profile.width ? `${profile.width} × ${profile.height}` : 'N/A'],
          ['Bands', `${profile.bands} band(s)`],
          ['CRS', profile.crs || 'Unknown'],
          ['Resolution', profile.resolution || 'N/A'],
          ['NoData', profile.nodata ? `${profile.nodataValue}` : 'None'],
          ['Date', profile.acquisitionDate || 'Unknown'],
        ].map(([l,v]) => `
          <div class="dataset-meta-cell">
            <div class="dataset-meta-label">${l}</div>
            <div class="dataset-meta-value">${v}</div>
          </div>
        `).join('')}
      </div>

      <div style="padding:var(--space-3) var(--space-4)">
        ${profile.healthChecks.map(c => `
          <div class="evidence-item ${c.pass ? 'pass' : 'fail'}" style="font-size:var(--text-xs)">
            <span>${c.pass ? '✓' : '✕'}</span>
            <span>${c.label} ${c.detail ? `— <span style="color:var(--text-muted)">${c.detail}</span>` : ''}</span>
          </div>
        `).join('')}
      </div>

      ${profile.error ? `
        <div style="padding:var(--space-3);background:hsla(350,80%,42%,0.1);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--rose-300)">
          ⚠ ${profile.error}
        </div>
      ` : ''}
    </div>
  `;
  animateIn(container.firstChild, 'animate-slide-up');
}

// ─────────────────────────────────────────
// LAYER TOGGLES
// ─────────────────────────────────────────
function renderSuggestions(suggestions) {
  const container = $('#suggestions-container');
  if (!container) return;
  container.innerHTML = `<div class="suggestion-grid">
    ${suggestions.map(s => `
      <div class="suggestion-chip ${s.available === false ? 'disabled' : ''}"
           ${s.available !== false ? `onclick="$('#query-input').value='${s.query.replace(/'/g, "\\'")}'; $('#query-input').focus()"` : ''}
           title="${s.available === false ? s.unavailableReason : s.query}"
           role="${s.available !== false ? 'button' : 'presentation'}"
           tabindex="${s.available !== false ? '0' : '-1'}"
           ${s.available !== false ? `onkeydown="if(event.key==='Enter') this.click()"` : ''}>
        <div class="chip-icon">${s.icon}</div>
        <div class="chip-category">${s.category}</div>
        <div class="chip-query">${s.available === false ? s.unavailableReason : s.query}</div>
      </div>
    `).join('')}
  </div>`;
}

function updateLayerToggles() {
  $$('.layer-toggle[data-layer]').forEach(toggle => {
    const layer = toggle.dataset.layer;
    const active = state.activeLayers[layer];
    toggle.classList.toggle('active', !!active);
    toggle.querySelector('.toggle-switch')?.classList.toggle('on', !!active);
  });
}

// ─────────────────────────────────────────
// SHOW TOOL DETAIL
// ─────────────────────────────────────────
function showToolDetail(node) {
  const modal = $('#tool-modal-backdrop');
  if (!modal) return;
  modal.querySelector('#tool-modal-content').innerHTML = `
    <div style="margin-bottom:var(--space-4)">
      <div class="label-mono" style="margin-bottom:var(--space-1)">Specialist Tool</div>
      <h3>${node.icon} ${node.value}</h3>
    </div>
    <div class="trace-row" style="border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
      <div class="trace-label">Formula</div>
      <div class="trace-value font-mono">${node.formula || 'N/A'}</div>
    </div>
    <div class="answer-trace" style="margin-top:var(--space-3)">
      ${[
        ['Status', `<span class="badge badge-${(node.statusBadge||'LIVE').toLowerCase()}">${node.statusBadge||'LIVE'}</span>`],
        ['Input bands', node.inputs?.join(', ') || 'N/A'],
        ['Output', node.outputs?.join(', ') || 'N/A'],
        ['Why selected', node.detail || 'N/A'],
      ].map(([l,v]) => `<div class="trace-row"><div class="trace-label">${l}</div><div class="trace-value">${v}</div></div>`).join('')}
    </div>
  `;
  modal.classList.add('open');
}

// ─────────────────────────────────────────
// APP PUBLIC METHODS
// ─────────────────────────────────────────
window.app = {
  rerunAnalysis: () => { if (state.currentPlan) handleQuery(state.currentPlan.originalQuery); },
  changeRegion:  () => { clearAOI(); toast('Draw a new AOI on the map', 'info'); },
  showEvidenceModal: () => {
    const m = $('#evidence-modal-backdrop');
    if (!m || !state.currentEvidenceScore) return;
    m.querySelector('#evidence-modal-content').innerHTML = `
      <h3 style="margin-bottom:var(--space-4)">Evidence Details</h3>
      ${(state.currentEvidenceScore.checks || []).map(c => `
        <div class="trace-row"><div class="trace-label ${c.pass?'status-ok':c.warn?'status-warn':'status-error'}">${c.pass?'✓':c.warn?'⚠':'✕'} ${c.label}</div><div class="trace-value">${c.detail||''}</div></div>
      `).join('')}
    `;
    m.classList.add('open');
  },
  inspectInput: () => {
    if (state.currentProfile) {
      navigateTo('workspace');
      toast('Dataset profile shown in left panel', 'info');
    } else {
      toast('No dataset loaded yet', 'warning');
    }
  },
  generateReport: () => {
    const html = generateReport({
      query: state.currentPlan?.originalQuery,
      plan: state.currentPlan,
      profile: state.currentProfile,
      analysisResult: state.currentAnalysisResult,
      evidenceScore: state.currentEvidenceScore,
      uncertainty: state.currentUncertainty,
      auditTrail: state.currentAuditTrail,
      answerTrace: state.currentAnswerTrace,
      timestamp: formatTimestamp(),
    });
    downloadReport(html, `satquery-report-${Date.now()}.html`);
    toast('Report downloaded successfully', 'success');
  },
};

// ─────────────────────────────────────────
// NLP COMMAND HANDLER
// ─────────────────────────────────────────
function handleNLPCommand(text) {
  const cmd = parseMapCommand(text);
  const success = executeMapCommand(cmd);
  if (!success) {
    // Try as a normal query
    handleQuery(text);
  } else {
    toast(`Command: ${text}`, 'info', 2000);
  }
}

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────
export function init() {
  initLanguage();

  // Expose navigateTo globally for inline onclick handlers
  window.navigateTo = navigateTo;

  // ─────────────────────────────────────────
  // API KEYS INIT
  // ─────────────────────────────────────────
  const geeInput = $('#gee-client-id');
  const geminiInput = $('#gemini-api-key');
  const copernicusInput = $('#copernicus-api-key');
  const bhuvanInput = $('#bhuvan-api-key');
  
  if (geeInput) geeInput.value = lsGet('gee_client_id', '');
  if (geminiInput) geminiInput.value = lsGet('gemini_api_key', '');
  if (copernicusInput) copernicusInput.value = lsGet('copernicus_api_key', '');
  if (bhuvanInput) bhuvanInput.value = lsGet('bhuvan_api_key', '');

  $('#save-settings-btn')?.addEventListener('click', () => {
    if (geeInput) lsSet('gee_client_id', geeInput.value.trim());
    if (geminiInput) lsSet('gemini_api_key', geminiInput.value.trim());
    if (copernicusInput) lsSet('copernicus_api_key', copernicusInput.value.trim());
    if (bhuvanInput) lsSet('bhuvan_api_key', bhuvanInput.value.trim());
    
    toast('Settings and API Keys saved successfully', 'success');
    document.getElementById('settings-modal-backdrop')?.classList.remove('open');

    // Try initializing GEE if key provided
    if (geeInput && geeInput.value.trim() !== '') {
      initGEE();
    }
  });

  // Init GEE on boot if key exists
  if (geeInput && geeInput.value.trim() !== '') {
    // delay slightly to let EE script load
    setTimeout(initGEE, 1000);
  }

  // Wire up navigation
  $$('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.view));
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateTo(item.dataset.view); } });
  });

  // Query form
  const queryInput = $('#query-input');
  const querySubmit = $('#query-submit');

  querySubmit?.addEventListener('click', () => handleQuery(queryInput.value));
  queryInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleQuery(queryInput.value); }
  });

  // Global Header Search
  const globalSearchInput = $('#global-search-input');
  const globalSearchBtn = $('#global-search-btn');
  globalSearchBtn?.addEventListener('click', () => {
    if (globalSearchInput.value) {
      handleQuery(globalSearchInput.value);
    }
  });
  globalSearchInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuery(globalSearchInput.value);
    }
  });

  // NLP Command input
  const nlpInput = $('#nlp-command-input');
  const nlpSubmit = $('#nlp-command-submit');
  nlpSubmit?.addEventListener('click', () => handleNLPCommand(nlpInput.value));
  nlpInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); handleNLPCommand(nlpInput.value); }
  });

  // File upload
  const fileInput = $('#file-input');
  fileInput?.addEventListener('change', e => handleFileUpload(e.target.files[0]));

  const dropZone = $('#drop-zone');
  if (dropZone) {
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragging'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragging');
      handleFileUpload(e.dataTransfer.files[0]);
    });
    dropZone.addEventListener('click', () => fileInput?.click());
  }

  // Voice query
  const voiceBtn = $('#voice-btn');
  const voiceIndicator = $('#voice-indicator');
  voiceBtn?.addEventListener('click', () => {
    if (isVoiceListening()) {
      stopVoiceQuery();
      voiceIndicator?.classList.remove('active');
      voiceBtn.innerHTML = '🎙️';
    } else {
      const started = startVoiceQuery(
        ({ transcript, isFinal }) => {
          if (queryInput) queryInput.value = transcript;
          if (isFinal) handleQuery(transcript);
        },
        (err) => { toast(err, 'error'); voiceIndicator?.classList.remove('active'); voiceBtn.innerHTML = '🎙️'; },
        () => { voiceIndicator?.classList.remove('active'); voiceBtn.innerHTML = '🎙️'; }
      );
      if (started) {
        voiceIndicator?.classList.add('active');
        voiceBtn.innerHTML = '⏹️';
        toast('Listening... speak your query', 'info', 3000);
      }
    }
  });

  // Language selector
  $$('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
      $$('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      toast(`Language: ${btn.textContent}`, 'info', 1500);
    });
  });

  // Mode toggle
  const simpleBtn = $('#mode-simple');
  const expertBtn = $('#mode-expert');
  simpleBtn?.addEventListener('click', () => { state.isExpertMode = false; simpleBtn.classList.add('active'); expertBtn?.classList.remove('active'); document.body.classList.remove('expert-mode'); });
  expertBtn?.addEventListener('click', () => { state.isExpertMode = true; expertBtn.classList.add('active'); simpleBtn?.classList.remove('active'); document.body.classList.add('expert-mode'); });

  // AOI drawing tools
  $$('.draw-tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.drawType;
      $$('.draw-tool-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (state.mapInitialized) {
        startDrawing(type, (aoi) => {
          state.aoiActive = true;
          renderAOIInfo(aoi);
          $$('.draw-tool-btn').forEach(b => b.classList.remove('active'));
          toast(`AOI drawn (${type}) — ${aoi.area ? aoi.area + ' km²' : 'area calculated'}`, 'success');
        });
      } else {
        navigateTo('workspace');
        setTimeout(() => startDrawing(type, (aoi) => {
          state.aoiActive = true;
          renderAOIInfo(aoi);
          toast(`AOI (${type}) — ${aoi.area ? aoi.area + ' km²' : ''}`, 'success');
        }), 500);
      }
    });
  });

  // Clear AOI
  $('#clear-aoi-btn')?.addEventListener('click', () => {
    clearAOI();
    state.aoiActive = false;
    $('#aoi-info-container')?.innerHTML?.('');
    toast('AOI cleared', 'info', 1500);
  });

  // Timeline
  initTimeline();

  // Layer toggles
  $$('.layer-toggle[data-layer]').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const layer = toggle.dataset.layer;
      state.activeLayers[layer] = !state.activeLayers[layer];
      toggle.classList.toggle('active', state.activeLayers[layer]);
      toggle.querySelector('.toggle-switch')?.classList.toggle('on', state.activeLayers[layer]);
      if (state.mapInitialized) {
        const { toggleLayer } = { toggleLayer: (l, v) => import('./map-controller.js').then(m => m.toggleLayer(l, v)) };
        import('./map-controller.js').then(m => m.toggleLayer(layer, state.activeLayers[layer]));
      }
    });
  });

  // Demo mode button
  $('#sih-demo-btn')?.addEventListener('click', startSIHDemo);
  $('#close-demo-btn')?.addEventListener('click', () => {
    $('#demo-mode-overlay')?.classList.remove('active');
    state.isDemoMode = false;
  });

  // Load demo dataset button
  $('#load-demo-btn')?.addEventListener('click', async () => {
    const demoProfile = createDemoProfile();
    state.currentProfile = demoProfile;
    renderDatasetProfile(demoProfile);
    renderSuggestions(generateSuggestions(demoProfile));
    toast('Demo dataset loaded — Ahmedabad Sentinel-2 (Simulated)', 'success');
    navigateTo('workspace');
  });

  // Modals close on backdrop
  $$('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.classList.remove('open'); });
  });

  // Home dashboard actions
  $('#home-start-query')?.addEventListener('click', () => navigateTo('workspace'));
  $('#home-upload-btn')?.addEventListener('click', () => { navigateTo('workspace'); fileInput?.click(); });

  // Render home dashboard
  renderHomeDashboard();
  renderHistoryView();
  renderDataSourcesView();
  renderResearchView();
  renderHealthView();
  renderJudgeView();
  renderArchitectureView();
  renderMonitoringView();

  // Initial suggestions (no dataset loaded)
  renderSuggestions(generateSuggestions(null));

  // Load initial demo profile for suggestions
  const savedLang = localStorage.getItem('satquery_lang');
  if (savedLang) { $(`[data-lang="${savedLang}"]`)?.classList.add('active'); }

  // Navigate to home
  navigateTo('home');
}

// ─────────────────────────────────────────
// AOI INFO RENDER
// ─────────────────────────────────────────
function renderAOIInfo(aoi) {
  const container = $('#aoi-info-container');
  if (!container) return;
  container.innerHTML = `
    <div class="aoi-info">
      <div style="font-size:var(--text-xs);font-weight:700;color:var(--cyan-300);margin-bottom:var(--space-2)">📍 SELECTED AOI</div>
      <div class="aoi-info-row"><span>Type</span><span>${aoi.type}</span></div>
      ${aoi.area ? `<div class="aoi-info-row"><span>Area</span><span>${aoi.area} km²</span></div>` : ''}
      ${aoi.center ? `<div class="aoi-info-row"><span>Center</span><span>${aoi.center.lat?.toFixed?.(4)}°N, ${aoi.center.lng?.toFixed?.(4)}°E</span></div>` : ''}
      <div style="display:flex;gap:var(--space-2);margin-top:var(--space-3)">
        <button class="btn btn-primary btn-sm" onclick="handleQueryFromAOI()">Analyze Region</button>
        <button class="btn btn-secondary btn-sm" onclick="saveCurrentAOI()">Save AOI</button>
      </div>
    </div>
  `;
  animateIn(container.firstChild, 'animate-slide-up');
}

window.handleQueryFromAOI = () => { handleQuery(`What is happening in this selected region?`); };
window.saveCurrentAOI = () => {
  const aoi = getAOI();
  if (!aoi) return;
  const name = prompt('Name this AOI:') || 'My AOI';
  saveAOI(name, { type: aoi.type, area: aoi.area, center: aoi.center ? { lat: aoi.center.lat, lng: aoi.center.lng } : null });
  toast(`AOI saved: "${name}"`, 'success');
};

// ─────────────────────────────────────────
// TIMELINE
// ─────────────────────────────────────────
function initTimeline() {
  const track = $('#timeline-track');
  const thumb = $('#timeline-thumb');
  const fill = $('#timeline-fill');
  const label = $('#timeline-label');
  if (!track || !thumb) return;

  const years = [2022, 2023, 2024, 2025];
  const available = [2022, 2023];

  function setYear(year) {
    state.timelineYear = year;
    if (label) label.textContent = year;
    const pct = ((years.indexOf(year)) / (years.length - 1)) * 100;
    if (thumb) thumb.style.left = `${pct}%`;
    if (fill) fill.style.width = `${pct}%`;

    const isAvailable = available.includes(year);
    if (!isAvailable) {
      toast(`No compatible observation for ${year}`, 'warning', 2000);
    } else {
      toast(`Viewing: ${year} observation`, 'info', 1500);
    }
  }

  track.addEventListener('click', e => {
    const rect = track.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(pct * (years.length - 1));
    setYear(years[Math.max(0, Math.min(idx, years.length - 1))]);
  });

  // Year buttons
  $$('.timeline-year-btn').forEach(btn => {
    btn.addEventListener('click', () => setYear(parseInt(btn.dataset.year)));
  });

  setYear(2023);
}

// ─────────────────────────────────────────
// HOME DASHBOARD
// ─────────────────────────────────────────
function renderHomeDashboard() {
  const insightCard = $('#insight-card');
  if (insightCard) {
    const insight = INSIGHT_OF_THE_DAY;
    insightCard.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-3)">
        <div>
          <div style="font-size:var(--text-xs);font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--cyan-300);margin-bottom:var(--space-1)">
            ${insight.icon} Insight of the Day
          </div>
          ${insight.tags.map(t => `<span class="badge badge-demo">${t}</span>`).join(' ')}
        </div>
        <span class="badge badge-${insight.evidenceVerdict === 'SUPPORTED' ? 'live' : 'demo'}">${insight.evidenceVerdict}</span>
      </div>
      <div style="font-size:var(--text-base);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-2)">${insight.title}</div>
      <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--space-3)">${insight.body}</div>
      <div style="font-size:var(--text-xs);color:var(--text-muted);border-top:1px solid var(--border-subtle);padding-top:var(--space-2)">${insight.disclaimer}</div>
    `;
  }
}

// ─────────────────────────────────────────
// HISTORY VIEW
// ─────────────────────────────────────────
function renderHistoryView() {
  const container = $('#history-list');
  if (!container) return;

  function renderHistory() {
    const history = getHistory();
    if (history.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-title">No analyses yet</div>
          <div class="empty-state-sub">Run your first analysis in the workspace</div>
          <button class="btn btn-primary btn-sm" style="margin-top:var(--space-4)" onclick="app && navigateTo && navigateTo('workspace')">Open Workspace</button>
        </div>
      `;
      return;
    }

    container.innerHTML = history.map(h => `
      <div class="history-item" role="listitem">
        <div class="history-icon">${h.icon || '📊'}</div>
        <div class="history-meta">
          <div class="history-query">${h.query}</div>
          <div class="history-details">
            <span>${h.intentLabel || h.intent}</span>
            <span>·</span>
            <span>${h.location}</span>
            <span>·</span>
            <span>${formatDate(h.timestamp)}</span>
            <span>·</span>
            <span class="${h.evidenceVerdict === 'SUPPORTED' ? 'status-live' : 'status-demo'}">${h.evidenceVerdict}</span>
          </div>
        </div>
        <button class="icon-btn" onclick="historyDelete('${h.id}')" aria-label="Delete analysis" title="Delete">✕</button>
      </div>
    `).join('');
  }

  renderHistory();
  window.historyDelete = (id) => { deleteHistory(id); renderHistory(); toast('Analysis removed', 'info', 1500); };
  window.clearAllHistory = () => { if (confirm('Clear all analysis history?')) { localStorage.removeItem('satquery_history'); renderHistory(); } };
}

// ─────────────────────────────────────────
// DATA SOURCES VIEW
// ─────────────────────────────────────────
function renderDataSourcesView() {
  const container = $('#datasources-content');
  if (!container) return;

  container.innerHTML = `
    <div class="dashboard-grid">
      ${DATA_SOURCES.map(src => `
        <div class="datasource-card" style="--card-accent:${src.color}33">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-4)">
            <div style="font-size:28px">${src.flag}</div>
            <span class="badge badge-${src.status.toLowerCase()}">${src.status}</span>
          </div>
          <div style="font-size:var(--text-lg);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-1)">${src.name}</div>
          <div style="font-size:var(--text-xs);color:${src.color};font-weight:600;margin-bottom:var(--space-3);letter-spacing:0.04em">${src.sensorType}</div>
          <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--space-3);line-height:1.5">${src.description}</div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--space-2)">
            <strong style="color:var(--text-secondary)">Use:</strong> ${src.use}
          </div>
          <div style="font-size:var(--text-xs);color:var(--text-muted)">
            <strong style="color:var(--text-secondary)">SatQuery role:</strong> ${src.satqueryRole}
          </div>
          <div class="divider"></div>
          ${src.specs.map(s => `<div style="font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-mono)">• ${s}</div>`).join('')}
        </div>
      `).join('')}
    </div>
  `;
  staggerAnimate($$('.datasource-card', container), 'animate-slide-up', 0, 80);
}

// ─────────────────────────────────────────
// RESEARCH VIEW
// ─────────────────────────────────────────
function renderResearchView() {
  const container = $('#research-content');
  if (!container) return;

  container.innerHTML = `
    <div class="dashboard-grid">
      ${RESEARCH_MODELS.map(m => `
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-3)">
            <div style="font-size:32px">${m.icon}</div>
            <span class="badge badge-${m.status.includes('LIVE') ? 'live' : m.status.includes('DEMO') ? 'demo' : 'planned'}">${m.status.split('(')[0].trim()}</span>
          </div>
          <div style="font-size:var(--text-base);font-weight:700;color:var(--text-primary);margin-bottom:2px">${m.name}</div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--space-3)">${m.type}</div>
          <p style="font-size:var(--text-sm);margin-bottom:var(--space-3)">${m.description}</p>
          <div style="font-size:var(--text-xs);color:var(--text-secondary)"><strong>Role in SatQuery:</strong> ${m.role}</div>
          ${m.note ? `<div style="font-size:var(--text-xs);color:var(--amber-300);margin-top:var(--space-2)">ℹ ${m.note}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
  staggerAnimate($$('.card', container), 'animate-slide-up', 0, 60);
}

// ─────────────────────────────────────────
// SYSTEM HEALTH VIEW
// ─────────────────────────────────────────
function renderHealthView() {
  const container = $('#health-content');
  if (!container) return;

  container.innerHTML = `
    <div style="margin-bottom:var(--space-6)">
      <div style="font-size:var(--text-xl);font-weight:700;margin-bottom:var(--space-2)">System Health Center</div>
      <p>All components clearly labeled as LIVE, DEMO, or PLANNED. No available integrations are misrepresented.</p>
    </div>
    <div class="health-grid">
      ${SYSTEM_HEALTH.map(item => `
        <div class="health-item">
          <div class="health-dot ${item.status}"></div>
          <div style="flex:1">
            <div class="health-label">${item.component}</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted)">${item.detail}</div>
          </div>
          <span class="badge badge-${item.statusLabel.toLowerCase()}">${item.statusLabel}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ─────────────────────────────────────────
// JUDGE MODE VIEW
// ─────────────────────────────────────────
function renderJudgeView() {
  const container = $('#judge-content');
  if (!container) return;

  const d = JUDGE_MODE_DATA;
  const liveFeatures = d.features.filter(f => f.status === 'LIVE');
  const demoFeatures = d.features.filter(f => f.status === 'DEMO');
  const plannedFeatures = d.features.filter(f => f.status === 'PLANNED');

  container.innerHTML = `
    <div class="judge-section">
      <div class="judge-section-label">01 / PROBLEM</div>
      <h3 style="margin-bottom:var(--space-2)">${d.problem.title}</h3>
      <p>${d.problem.content}</p>
    </div>

    <div class="judge-section">
      <div class="judge-section-label">02 / SOLUTION</div>
      <h3 style="margin-bottom:var(--space-2)">${d.solution.title}</h3>
      <p>${d.solution.content}</p>
    </div>

    <div class="judge-section">
      <div class="judge-section-label">03 / ARCHITECTURE</div>
      <div style="display:flex;flex-direction:column;gap:var(--space-2)">
        ${d.architecture.layers.map(l => `
          <div style="display:grid;grid-template-columns:200px 1fr 120px auto;gap:var(--space-4);align-items:center;padding:var(--space-3);background:var(--bg-panel);border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
            <div style="font-weight:600;font-size:var(--text-sm)">${l.label}</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted)">${l.detail}</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-mono)">${l.tech}</div>
            <span class="badge badge-${l.status.toLowerCase()}">${l.status}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="judge-section">
      <div class="judge-section-label">04 / FEATURES</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-5)">
        <div>
          <div style="font-size:var(--text-sm);font-weight:700;color:var(--green-300);margin-bottom:var(--space-3)">🟢 LIVE (${liveFeatures.length})</div>
          ${liveFeatures.map(f => `<div style="font-size:var(--text-xs);padding:4px 0;border-bottom:1px solid var(--border-subtle);color:var(--text-secondary)">✓ ${f.name}</div>`).join('')}
        </div>
        <div>
          <div style="font-size:var(--text-sm);font-weight:700;color:var(--amber-300);margin-bottom:var(--space-3)">🟡 DEMO (${demoFeatures.length})</div>
          ${demoFeatures.map(f => `<div style="font-size:var(--text-xs);padding:4px 0;border-bottom:1px solid var(--border-subtle);color:var(--text-secondary)">◉ ${f.name}</div>`).join('')}
        </div>
        <div>
          <div style="font-size:var(--text-sm);font-weight:700;color:var(--space-400);margin-bottom:var(--space-3)">🔵 PLANNED (${plannedFeatures.length})</div>
          ${plannedFeatures.map(f => `<div style="font-size:var(--text-xs);padding:4px 0;border-bottom:1px solid var(--border-subtle);color:var(--text-muted)">○ ${f.name}</div>`).join('')}
        </div>
      </div>
    </div>

    <div class="judge-section">
      <div class="judge-section-label">05 / EVIDENCE OF INTELLIGENCE</div>
      ${d.evidence.points.map(p => `
        <div style="display:flex;gap:var(--space-3);padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle)">
          <span style="color:var(--cyan-300);font-size:14px;margin-top:2px">▸</span>
          <span style="font-size:var(--text-sm);color:var(--text-secondary)">${p}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ─────────────────────────────────────────
// ARCHITECTURE VIEW
// ─────────────────────────────────────────
function renderArchitectureView() {
  const container = $('#architecture-content');
  if (!container) return;

  const archNodes = [
    { label: 'USER', sublabel: 'Natural Language · Voice · AOI', icon: '👤', color: 'var(--cyan-400)', detail: 'Entry point. Accepts text queries, voice input, AOI drawings, and file uploads.' },
    { label: 'WEB APP', sublabel: 'HTML + Vanilla JS + CSS', icon: '🌐', color: 'var(--green-400)', detail: 'Responsive SPA. Manages routing, state, UI rendering, and user interactions.' },
    { label: 'QUERY INTELLIGENCE', sublabel: 'NLP Intent Parser', icon: '🧠', color: 'var(--purple-400)', detail: 'Converts natural language → structured JSON plan: intent, location, bands, operations, temporal range.' },
    { label: 'AGENT ORCHESTRATOR', sublabel: 'Multi-tool routing', icon: '🤖', color: 'var(--cyan-400)', detail: 'Routes analysis to specialist tools. Builds visual execution plan. Explains tool selection.' },
    { label: 'SPECIALIST TOOLS', sublabel: 'NDVI · NDWI · Change · Overlap', icon: '⚙️', color: 'var(--amber-400)', detail: 'Deterministic computation engines: spectral indices, change detection, spatial correlation.' },
    { label: 'EVIDENCE ENGINE', sublabel: 'Score · Trace · Uncertainty', icon: '🔍', color: 'var(--green-400)', detail: 'Computes checklist-based evidence score. Builds audit trail, answer trace, and uncertainty panel.' },
    { label: 'ANSWER', sublabel: 'Map · Stats · Explanation', icon: '✓', color: 'var(--cyan-400)', detail: 'Structured, evidence-backed answer with KNOWN/INFERRED/CANNOT DETERMINE distinction.' },
  ];

  const selectedNode = { current: null };

  const archEl = document.createElement('div');
  archEl.style.display = 'flex';
  archEl.style.gap = 'var(--space-8)';
  archEl.style.alignItems = 'flex-start';

  const diagram = document.createElement('div');
  diagram.className = 'arch-diagram';
  diagram.style.flex = '0 0 320px';

  const detail = document.createElement('div');
  detail.className = 'card';
  detail.style.flex = '1';
  detail.innerHTML = `
    <div style="color:var(--text-muted);text-align:center;padding:var(--space-8)">
      <div style="font-size:32px;margin-bottom:var(--space-3)">👆</div>
      <div style="font-size:var(--text-sm)">Click any architecture node to see details</div>
    </div>
  `;

  archNodes.forEach((node, i) => {
    if (i > 0) {
      const arrow = document.createElement('div');
      arrow.className = 'arch-arrow';
      arrow.textContent = '↓';
      diagram.appendChild(arrow);
    }

    const nodeEl = document.createElement('div');
    nodeEl.className = 'arch-node';
    nodeEl.setAttribute('role', 'button');
    nodeEl.setAttribute('tabindex', '0');
    nodeEl.setAttribute('aria-label', node.label);
    nodeEl.style.borderTop = `3px solid ${node.color}`;
    nodeEl.innerHTML = `
      <div class="arch-node-label">${node.icon} ${node.label}</div>
      <div class="arch-node-name" style="color:${node.color}">${node.sublabel}</div>
    `;
    nodeEl.addEventListener('click', () => {
      $$('.arch-node', diagram).forEach(n => n.classList.remove('selected'));
      nodeEl.classList.add('selected');
      detail.innerHTML = `
        <div style="margin-bottom:var(--space-4)">
          <div style="font-size:var(--text-xs);font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${node.color};margin-bottom:var(--space-1)">${node.icon} ${node.label}</div>
          <div style="font-size:var(--text-xl);font-weight:700;color:var(--text-primary)">${node.sublabel}</div>
        </div>
        <p>${node.detail}</p>
        <div class="divider"></div>
        ${node.label === 'SPECIALIST TOOLS' ? `
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:var(--space-3)">
            <div style="font-weight:600;margin-bottom:var(--space-2)">Available tools:</div>
            <div>🌿 NDVI Engine (LIVE)</div>
            <div>💧 NDWI Engine (LIVE)</div>
            <div>🔄 Change Detection Engine (LIVE)</div>
            <div>⚖️ Spatial Correlation Engine (LIVE)</div>
            <div>🤖 Visual QA Engine (DEMO)</div>
            <div>🏗️ NDBI Engine (LIVE)</div>
          </div>
        ` : ''}
      `;
    });
    nodeEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nodeEl.click(); } });

    diagram.appendChild(nodeEl);
  });

  archEl.appendChild(diagram);
  archEl.appendChild(detail);
  container.innerHTML = '';
  container.appendChild(archEl);
}

// ─────────────────────────────────────────
// MONITORING VIEW
// ─────────────────────────────────────────
function renderMonitoringView() {
  const container = $('#monitoring-content');
  if (!container) return;
  container.innerHTML = `
    <div class="judge-section">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4)">
        <div>
          <div class="judge-section-label">PLANNED FEATURE</div>
          <h3>Monitor Area</h3>
        </div>
        <span class="badge badge-planned">PLANNED</span>
      </div>
      <p>Define an Area of Interest, select an analysis type, and set a monitoring interval. SatQuery will notify you when changes are detected.</p>
      <div style="margin-top:var(--space-6);padding:var(--space-6);background:var(--bg-panel);border-radius:var(--radius-xl);border:1px solid var(--border-subtle)">
        <div style="font-size:var(--text-xs);font-weight:700;color:var(--space-400);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:var(--space-4)">UI WORKFLOW (prototype)</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-4)">
          <div>
            <label class="form-label">Area of Interest</label>
            <select class="form-select"><option>Ahmedabad Study Area (Demo)</option><option>My Farm</option><option>+ Draw new AOI</option></select>
          </div>
          <div>
            <label class="form-label">Analysis Type</label>
            <select class="form-select"><option>NDVI (Vegetation)</option><option>NDWI (Water)</option><option>Change Detection</option></select>
          </div>
          <div>
            <label class="form-label">Interval</label>
            <select class="form-select"><option>Monthly</option><option>Weekly</option><option>Seasonal</option></select>
          </div>
          <div>
            <label class="form-label">Alert Threshold</label>
            <input class="form-input" type="text" value="±5% change" placeholder="e.g. ±5% NDVI change">
          </div>
        </div>
        <button class="btn btn-secondary" disabled>
          Set Up Monitor
          <span class="badge badge-planned" style="margin-left:var(--space-2)">PLANNED — requires backend + live data</span>
        </button>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────
// SIH DEMO MODE
// ─────────────────────────────────────────
async function startSIHDemo() {
  state.isDemoMode = true;
  const overlay = $('#demo-mode-overlay');
  if (!overlay) return;

  overlay.classList.add('active');

  // Load demo dataset
  const demoProfile = createDemoProfile();
  state.currentProfile = demoProfile;

  const titleEl = overlay.querySelector('#demo-step-title');
  const narrationEl = overlay.querySelector('#demo-narration');
  const progressEl = overlay.querySelector('#demo-progress');
  const stepEl = overlay.querySelector('#demo-step-num');

  for (const step of DEMO_SCRIPT) {
    if (!state.isDemoMode) break;

    if (stepEl) stepEl.textContent = `${step.step}/${DEMO_SCRIPT.length}`;
    if (progressEl) {
      progressEl.style.width = `${((step.step - 1) / DEMO_SCRIPT.length) * 100}%`;
    }

    if (titleEl) await typewriter(titleEl, step.title, 40);
    if (narrationEl) await typewriter(narrationEl, step.narration, 20);

    // Execute demo action
    if (step.action === 'type_query' && step.query) {
      const qi = $('#query-input');
      if (qi) await typewriter(qi, step.query, 35);
    } else if (step.action === 'run_analysis') {
      overlay.classList.remove('active');
      await handleQuery(DEMO_SCENARIOS.ahmedabad_vegetation_change.query);
      overlay.classList.add('active');
    } else if (step.action === 'show_dataset_profile') {
      renderDatasetProfile(demoProfile);
    }

    await sleep(step.duration * 1000);
  }

  if (progressEl) progressEl.style.width = '100%';
  if (titleEl) titleEl.textContent = 'Demo Complete';
  if (narrationEl) narrationEl.textContent = 'SatQuery AI — Intelligent Geospatial Analysis Platform. Thank you for your attention.';

  setTimeout(() => {
    overlay.classList.remove('active');
    state.isDemoMode = false;
  }, 4000);
}
