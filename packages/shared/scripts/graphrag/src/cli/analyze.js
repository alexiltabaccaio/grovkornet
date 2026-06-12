import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadQueryGraph } from '../core/GraphStore.js';
import { validateFsdBoundaries, detectOrphanedFiles } from '../algorithms/fsd-validator.js';
import { findDependencyCycles } from '../algorithms/cycles.js';
import { formatAnalysisReport } from '../formatters/console-reporter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const graphPath = path.resolve(__dirname, '../../output.graph.json');
if (!fs.existsSync(graphPath)) {
  console.error("❌ Graph not found! Please run 'npm run build' first.");
  process.exit(1);
}

const { nodes, adjListIn, raw: graphData } = loadQueryGraph(graphPath);

const allNodes = new Set(nodes.keys());
const nodeTypes = new Map();
for (const [id, node] of nodes.entries()) {
  nodeTypes.set(id, node.type);
}

// Build simple adjacency list (file imports mapping) for cycles
const adj = new Map();
for (const edge of graphData.edges) {
  if (edge.relation === 'imports_file') {
    if (!adj.has(edge.source)) {
      adj.set(edge.source, []);
    }
    adj.get(edge.source).push(edge.target);
  }
}

// Execute analysis algorithms
const violations = validateFsdBoundaries(graphData.edges);
const cycles = findDependencyCycles(allNodes, nodeTypes, adj);
const orphanedFiles = detectOrphanedFiles(allNodes, nodeTypes, adjListIn);

// Format and output report
const report = formatAnalysisReport(violations, cycles, orphanedFiles);
console.log(report);
