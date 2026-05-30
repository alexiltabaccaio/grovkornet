import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const graphPath = path.resolve(__dirname, './output.graph.json');
if (!fs.existsSync(graphPath)) {
  console.error("❌ Graph not found! Please run 'node builder.js' first.");
  process.exit(1);
}

const graphData = JSON.parse(fs.readFileSync(graphPath, 'utf8'));

// FSD Hierarchy
const layers = ['app', 'screens', 'widgets', 'features', 'entities', 'shared'];

function getLayer(filePath) {
  const match = filePath.match(/apps\/mobile\/src\/([^/]+)/);
  if (match) {
    const folder = match[1];
    if (layers.includes(folder)) {
      return folder;
    }
  }
  return null;
}

const violations = [];
const adj = new Map();
const adjListIn = new Map(); // target -> list of sources that import it
const allNodes = new Set();
const nodeTypes = new Map(); // id -> type

for (const node of graphData.nodes) {
  allNodes.add(node.id);
  nodeTypes.set(node.id, node.type);
  adjListIn.set(node.id, []);
}

for (const edge of graphData.edges) {
  if (edge.relation === 'imports_file') {
    if (!adj.has(edge.source)) {
      adj.set(edge.source, []);
    }
    adj.get(edge.source).push(edge.target);
    
    if (adjListIn.has(edge.target)) {
      adjListIn.get(edge.target).push(edge.source);
    }
    
    // Check FSD violations
    const sourceLayer = getLayer(edge.source);
    const targetLayer = getLayer(edge.target);
    
    if (sourceLayer && targetLayer) {
      const sourceIndex = layers.indexOf(sourceLayer);
      const targetIndex = layers.indexOf(targetLayer);
      
      if (targetIndex < sourceIndex) {
        violations.push({
          source: edge.source,
          sourceLayer,
          target: edge.target,
          targetLayer
        });
      }
    }
  }
}

// --------------------------------------------------
// 1. Cycle Detection (Circular Dependencies)
// --------------------------------------------------
const visited = new Set();
const recStack = new Set();
const cycles = [];

function detectCycles(node, dfsPath = []) {
  visited.add(node);
  recStack.add(node);
  dfsPath.push(node);

  const neighbors = adj.get(node) || [];
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor)) {
      detectCycles(neighbor, dfsPath);
    } else if (recStack.has(neighbor)) {
      const cycleStartIdx = dfsPath.indexOf(neighbor);
      const cycle = dfsPath.slice(cycleStartIdx);
      cycles.push([...cycle, neighbor]);
    }
  }

  recStack.delete(node);
  dfsPath.pop();
}

for (const node of allNodes) {
  if (nodeTypes.get(node) === 'file' && !visited.has(node)) {
    detectCycles(node);
  }
}

// --------------------------------------------------
// 2. Orphaned Files Detection (Never imported by anyone)
// --------------------------------------------------
const orphanedFiles = [];

for (const node of allNodes) {
  if (nodeTypes.get(node) === 'file') {
    const importers = adjListIn.get(node) || [];
    
    if (importers.length === 0) {
      const basename = path.basename(node);
      const ext = path.extname(node);
      const isTsFile = ext === '.ts' || ext === '.tsx';
      const isEntryPoint = node.includes('app/index.tsx') || node.includes('app/App.tsx');
      const isTestFile = node.includes('.test.') || node.includes('.spec.') || node.includes('.smoke.');
      const isFsdIndex = basename === 'index.ts' || basename === 'index.tsx';
      const isConfig = basename.includes('config') || basename.includes('setup');

      if (isTsFile && !isEntryPoint && !isTestFile && !isFsdIndex && !isConfig) {
        orphanedFiles.push(node);
      }
    }
  }
}

// --------------------------------------------------
// Report Output
// --------------------------------------------------
console.log("==== ARCHITECTURAL ANALYSIS REPORT (GraphRAG) ====\n");

// 1. FSD Report
console.log("1. FEATURE-SLICED DESIGN (FSD) RULE VERIFICATION:");
if (violations.length === 0) {
  console.log("  ✅ Congratulations! No FSD boundary violations detected.");
} else {
  console.log(`  ❌ Detected ${violations.length} FSD architectural violations:`);
  const grouped = new Map();
  for (const v of violations) {
    if (!grouped.has(v.source)) {
      grouped.set(v.source, { layer: v.sourceLayer, imports: [] });
    }
    grouped.get(v.source).imports.push({ path: v.target, layer: v.targetLayer });
  }

  grouped.forEach((data, file) => {
    console.log(`\n  File: ${file} [Layer: ${data.layer.toUpperCase()}]`);
    for (const imp of data.imports) {
      console.log(`    ⚠️ Tries to import from a higher layer: [${imp.layer.toUpperCase()}]`);
      console.log(`      Imported: ${imp.path}`);
    }
  });
}

console.log("\n--------------------------------------------------");

// 2. Cycle Report
console.log("2. CIRCULAR DEPENDENCIES DETECTION (Cycles):");
if (cycles.length === 0) {
  console.log("  ✅ Congratulations! No circular dependencies detected between files.");
} else {
  console.log(`  ❌ Detected ${cycles.length} dependency cycles (Circular Imports):`);
  cycles.forEach((cycle, index) => {
    console.log(`\n  Cycle #${index + 1}:`);
    const pathFormatted = cycle.map(node => path.basename(node)).join(" ──> ");
    console.log(`    Path: ${pathFormatted}`);
    console.log("    Involved files:");
    cycle.slice(0, -1).forEach((node, i) => {
      console.log(`      ${i + 1}. ${node}`);
    });
  });
}

console.log("\n--------------------------------------------------");

// 3. Orphaned Files Report
console.log("3. ORPHANED FILES DETECTION (Never Imported):");
if (orphanedFiles.length === 0) {
  console.log("  ✅ Congratulations! No orphaned (unused) files detected.");
} else {
  console.log(`  ⚠️ Detected ${orphanedFiles.length} orphaned files (present in filesystem but never imported by other source files):`);
  console.log("  (These might be obsolete files left in the workspace or unused utilities)");
  orphanedFiles.forEach((file, index) => {
    console.log(`    ${index + 1}. ${file}`);
  });
}

console.log("\n==================================================");
