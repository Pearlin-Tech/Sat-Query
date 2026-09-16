/**
 * SatQuery AI — Agent Orchestrator
 * Multi-tool reasoning: routes queries to specialist tools,
 * builds visual agent plan trees, coordinates multi-step analysis.
 */

import { sleep } from './utils.js';

// ─────────────────────────────────────────
// TOOL REGISTRY
// ─────────────────────────────────────────
const TOOLS = {
  NDVI: {
    id: 'NDVI',
    name: 'Spectral Index Engine — NDVI',
    icon: '🌿',
    description: 'Computes Normalized Difference Vegetation Index from Red and NIR bands.',
    formula: '(NIR - Red) / (NIR + Red)',
    inputs: ['Red band', 'NIR band'],
    outputs: ['NDVI raster', 'Classification map', 'Statistics'],
    requiredBands: ['Red', 'NIR'],
    why: (intent) => `The question concerns ${intent} and the available data contains Red and NIR spectral bands.`,
    status: 'LIVE',
  },
  NDWI: {
    id: 'NDWI',
    name: 'Water Detection Engine — NDWI',
    icon: '💧',
    description: 'Detects water bodies using Normalized Difference Water Index.',
    formula: '(Green - NIR) / (Green + NIR)',
    inputs: ['Green band', 'NIR band'],
    outputs: ['Water extent map', 'Statistics'],
    requiredBands: ['Green', 'NIR'],
    why: () => 'The query involves water body detection or flood analysis.',
    status: 'LIVE',
  },
  CHANGE_DETECTION: {
    id: 'CHANGE_DETECTION',
    name: 'Change Detection Engine',
    icon: '🔄',
    description: 'Detects pixel-level differences between two temporal observations.',
    formula: 'Δ = Band_t2 - Band_t1',
    inputs: ['Image (t1)', 'Image (t2)', 'Band selection'],
    outputs: ['Change raster', 'Statistics', 'Changed regions'],
    requiredBands: ['Any matching bands'],
    why: () => 'The question involves temporal comparison — detecting what changed between observations.',
    status: 'LIVE',
  },
  SPATIAL_OVERLAP: {
    id: 'SPATIAL_OVERLAP',
    name: 'Spatial Correlation Engine',
    icon: '⚖️',
    description: 'Identifies spatial overlap between two analysis layers.',
    formula: 'Pixel-wise AND of thresholded masks',
    inputs: ['Layer A', 'Layer B'],
    outputs: ['Overlap map', 'Overlap statistics'],
    requiredBands: ['Two computed layers'],
    why: () => 'Cross-analysis between vegetation and urban layers requires spatial comparison.',
    status: 'LIVE',
  },
  VISUAL_QA: {
    id: 'VISUAL_QA',
    name: 'Visual Question Answering',
    icon: '🤖',
    description: 'Answers natural language questions about satellite imagery content.',
    inputs: ['Satellite image', 'Text query'],
    outputs: ['Text answer', 'Evidence'],
    requiredBands: ['RGB or multispectral'],
    why: () => 'The question is best answered by direct visual analysis of image content.',
    status: 'DEMO',
    note: 'Uses Qwen2.5-VL architecture. Demo responses are curated.',
  },
  NDBI: {
    id: 'NDBI',
    name: 'Built-up Index Engine — NDBI',
    icon: '🏗️',
    description: 'Detects built-up and urban areas using Normalized Difference Built-up Index.',
    formula: '(SWIR - NIR) / (SWIR + NIR)',
    inputs: ['SWIR band', 'NIR band'],
    outputs: ['Built-up map', 'Statistics'],
    requiredBands: ['SWIR', 'NIR'],
    why: () => 'The question involves urban areas and SWIR band is available for NDBI computation.',
    status: 'LIVE',
    fallback: 'Without SWIR, urban extent estimated from spectral brightness analysis.',
  },
};

// ─────────────────────────────────────────
// ROUTE QUERY TO TOOLS
// Returns an ordered execution plan
// ─────────────────────────────────────────
export function routeToTools(plan, profile) {
  const selectedTools = [];
  const warnings = [];

  const ops = plan.operations || [];

  for (const op of ops) {
    const upperOp = op.toUpperCase().replace(/[\s-]/g, '_');
    const tool = TOOLS[upperOp] || TOOLS[op.toUpperCase()];

    if (!tool) {
      // Try fuzzy match
      const found = Object.values(TOOLS).find(t =>
        t.id.toLowerCase().includes(op.toLowerCase()) ||
        op.toLowerCase().includes(t.id.toLowerCase().slice(0, 4))
      );
      if (found) selectedTools.push(found);
      continue;
    }

    // Check if tool is feasible
    if (tool.requiredBands.includes('NIR') && profile && !profile.hasNIR) {
      warnings.push({ tool: tool.id, reason: `NIR band missing — ${tool.name} unavailable`, suggestion: tool.fallback });
      continue;
    }
    if (tool.requiredBands.includes('SWIR') && profile && !profile.hasSWIR) {
      warnings.push({ tool: tool.id, reason: `SWIR band missing — ${tool.name} limited`, suggestion: tool.fallback });
      if (tool.fallback) selectedTools.push({ ...tool, degraded: true, degradedReason: tool.fallback });
      continue;
    }

    selectedTools.push(tool);
  }

  // Multi-tool plan for combined analysis
  if (plan.multiTool && selectedTools.length >= 2) {
    return {
      tools: selectedTools,
      isMultiTool: true,
      finalStep: 'Cross-analysis',
      finalDescription: 'Combine results from all specialist tools to identify spatial relationships.',
      warnings,
    };
  }

  return {
    tools: selectedTools,
    isMultiTool: false,
    warnings,
  };
}

// ─────────────────────────────────────────
// BUILD VISUAL AGENT PLAN
// ─────────────────────────────────────────
export function buildAgentPlan(query, toolPlan) {
  const nodes = [];

  nodes.push({
    id: 'query',
    type: 'input',
    label: 'USER QUESTION',
    value: query.length > 40 ? query.slice(0, 40) + '...' : query,
    icon: '💬',
    status: 'completed',
  });

  nodes.push({
    id: 'data',
    type: 'data',
    label: 'DATASET',
    value: 'Spectral raster data',
    icon: '🗂️',
    status: 'completed',
  });

  // Tool groups
  for (const tool of toolPlan.tools) {
    nodes.push({
      id: `tool_${tool.id}`,
      type: 'tool',
      label: 'SPECIALIST TOOL',
      value: tool.name,
      icon: tool.icon,
      status: 'pending',
      detail: tool.why?.(query) || tool.description,
      formula: tool.formula,
      inputs: tool.inputs,
      outputs: tool.outputs,
      statusBadge: tool.status,
      degraded: tool.degraded,
    });
  }

  if (toolPlan.isMultiTool) {
    nodes.push({
      id: 'cross',
      type: 'cross',
      label: 'CROSS-ANALYSIS',
      value: 'Spatial correlation + synthesis',
      icon: '⚖️',
      status: 'pending',
    });
  }

  nodes.push({
    id: 'evidence',
    type: 'evidence',
    label: 'EVIDENCE',
    value: 'Visual + statistical + explanation',
    icon: '🔍',
    status: 'pending',
  });

  nodes.push({
    id: 'answer',
    type: 'output',
    label: 'ANSWER',
    value: 'Structured, evidence-backed response',
    icon: '✓',
    status: 'pending',
  });

  return nodes;
}

// ─────────────────────────────────────────
// ANIMATE AGENT PLAN
// ─────────────────────────────────────────
export async function animateAgentPlan(nodes, onNodeUpdate) {
  for (let i = 0; i < nodes.length; i++) {
    onNodeUpdate?.(i, 'active');
    await sleep(700 + Math.random() * 300);
    onNodeUpdate?.(i, 'completed');
  }
}

// ─────────────────────────────────────────
// EXPLAIN TOOL SELECTION
// ─────────────────────────────────────────
export function explainToolSelection(tool, plan) {
  return {
    toolName: tool.name,
    reason: tool.why?.(plan.intentLabel) || `Selected because the query involves ${plan.intentLabel.toLowerCase()}.`,
    formula: tool.formula,
    inputs: tool.inputs,
    outputs: tool.outputs,
    status: tool.status,
    note: tool.note || null,
    degraded: tool.degraded || false,
    degradedReason: tool.degradedReason || null,
  };
}

// ─────────────────────────────────────────
// GET TOOL BY ID
// ─────────────────────────────────────────
export function getTool(id) { return TOOLS[id]; }
export function getAllTools() { return Object.values(TOOLS); }
