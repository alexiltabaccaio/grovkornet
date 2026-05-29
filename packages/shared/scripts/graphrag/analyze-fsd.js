import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const graphPath = path.resolve(__dirname, './output.graph.json');
if (!fs.existsSync(graphPath)) {
  console.error("❌ Grafo non trovato! Lancia prima 'node builder.js'.");
  process.exit(1);
}

const graphData = JSON.parse(fs.readFileSync(graphPath, 'utf8'));

// Gerarchia FSD
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
    
    // Controlla violazioni FSD
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
// 1. Rilevamento Cicli (Dipendenze Circolari)
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
// 2. Rilevamento File Orfani (Mai Importati da nessuno)
// --------------------------------------------------
const orphanedFiles = [];

for (const node of allNodes) {
  if (nodeTypes.get(node) === 'file') {
    const importers = adjListIn.get(node) || [];
    
    if (importers.length === 0) {
      const basename = path.basename(node);
      const isEntryPoint = node.includes('app/index.tsx') || node.includes('app/App.tsx');
      const isTestFile = node.includes('.test.') || node.includes('.spec.') || node.includes('.smoke.');
      const isFsdIndex = basename === 'index.ts' || basename === 'index.tsx';
      const isConfig = basename.includes('config') || basename.includes('setup');

      if (!isEntryPoint && !isTestFile && !isFsdIndex && !isConfig) {
        orphanedFiles.push(node);
      }
    }
  }
}

// --------------------------------------------------
// Output dei Report
// --------------------------------------------------
console.log("==== REPORT DI ANALISI ARCHITETTURALE (GraphRAG) ====\n");

// 1. Report FSD
console.log("1. VERIFICA REGOLE FSD (Feature-Sliced Design):");
if (violations.length === 0) {
  console.log("  ✅ Complimenti! Nessuna violazione dei confini FSD rilevata.");
} else {
  console.log(`  ❌ Rilevate ${violations.length} violazioni architetturali FSD:`);
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
      console.log(`    ⚠️ Tenta di importare da un layer superiore: [${imp.layer.toUpperCase()}]`);
      console.log(`      Importa: ${imp.path}`);
    }
  });
}

console.log("\n--------------------------------------------------");

// 2. Report Cicli
console.log("2. RILEVAMENTO DIPENDENZE CIRCOLARI (Cycles):");
if (cycles.length === 0) {
  console.log("  ✅ Complimenti! Nessuna dipendenza circolare rilevata tra i file.");
} else {
  console.log(`  ❌ Rilevati ${cycles.length} cicli di dipendenze (Circular Imports):`);
  cycles.forEach((cycle, index) => {
    console.log(`\n  Ciclo #${index + 1}:`);
    const pathFormatted = cycle.map(node => path.basename(node)).join(" ──> ");
    console.log(`    Percorso: ${pathFormatted}`);
    console.log("    File coinvolti:");
    cycle.slice(0, -1).forEach((node, i) => {
      console.log(`      ${i + 1}. ${node}`);
    });
  });
}

console.log("\n--------------------------------------------------");

// 3. Report File Orfani
console.log("3. RILEVAMENTO FILE ORFANI (Mai Importati):");
if (orphanedFiles.length === 0) {
  console.log("  ✅ Complimenti! Nessun file orfano (non utilizzato) rilevato.");
} else {
  console.log(`  ⚠️ Rilevati ${orphanedFiles.length} file orfani (presenti ma mai importati da altri sorgenti):`);
  console.log("  (Potrebbero essere file obsoleti rimasti nella cartella o vecchie utility)");
  orphanedFiles.forEach((file, index) => {
    console.log(`    ${index + 1}. ${file}`);
  });
}

console.log("\n==================================================");
