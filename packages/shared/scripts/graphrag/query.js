import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const graphPath = path.resolve(__dirname, './output.graph.json');
if (!fs.existsSync(graphPath)) {
  console.error("❌ Grafo non trovato! Esegui prima 'node builder.js'.");
  process.exit(1);
}

// Carichiamo il grafo serializzato
const graphData = JSON.parse(fs.readFileSync(graphPath, 'utf8'));

// Parsiamo gli argomenti della CLI (semplice parser senza librerie esterne)
const args = process.argv.slice(2);
const params = {
  node: '',
  depth: 2,
  direction: 'in' // 'in' (dipendenti / chi mi usa), 'out' (dipendenze / cosa uso), 'both' (entrambi)
};

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--node=')) {
    params.node = args[i].split('=')[1];
  } else if (args[i].startsWith('--depth=')) {
    params.depth = parseInt(args[i].split('=')[1], 10);
  } else if (args[i].startsWith('--direction=')) {
    params.direction = args[i].split('=')[1];
  }
}

if (!params.node) {
  console.log(`
Uso: node query.js --node=<stringa_di_ricerca> [--depth=<numero>] [--direction=in|out|both]

Parametri:
  --node       Nome del file o del simbolo da cercare (ricerca parziale)
  --depth      Profondità dell'esplorazione delle dipendenze (default: 2)
  --direction  Direzione delle relazioni da seguire:
                 - 'in'   : Chi usa questo nodo (dipendenti)
                 - 'out'  : Cosa usa questo nodo (dipendenze)
                 - 'both' : Entrambi i versi
`);
  process.exit(0);
}

// Costruiamo una rappresentazione del grafo per query veloci
const nodes = new Map(); // id -> nodeAttributes
const adjListIn = new Map(); // target -> list of { source, relation }
const adjListOut = new Map(); // source -> list of { target, relation }

for (const node of graphData.nodes) {
  nodes.set(node.id, node);
  adjListIn.set(node.id, []);
  adjListOut.set(node.id, []);
}

for (const edge of graphData.edges) {
  const { source, target, relation } = edge;
  
  if (adjListIn.has(target)) {
    adjListIn.get(target).push({ source, relation });
  }
  if (adjListOut.has(source)) {
    adjListOut.get(source).push({ target, relation });
  }
}

// 1. Trova i nodi di partenza (matching parziale dell'ID)
const startNodes = [];
const searchLower = params.node.toLowerCase();

for (const nodeId of nodes.keys()) {
  if (nodeId.toLowerCase().includes(searchLower)) {
    startNodes.push(nodeId);
  }
}

if (startNodes.length === 0) {
  console.log(`❌ Nessun nodo trovato corrispondente a "${params.node}".`);
  process.exit(0);
}

console.log(`🔍 Nodi di partenza trovati (${startNodes.length}):`);
startNodes.forEach(n => console.log(`  - ${n} [tipo: ${nodes.get(n).type}]`));
console.log("");

// 2. BFS per estrarre il sottografo
const visited = new Set();
const subgraphNodes = new Map(); // id -> attributes
const subgraphEdges = []; // array di { source, target, relation }

const queue = []; // array di { nodeId, currentDepth }

for (const startNode of startNodes) {
  queue.push({ nodeId: startNode, currentDepth: 0 });
  visited.add(startNode);
  subgraphNodes.set(startNode, nodes.get(startNode));
}

while (queue.length > 0) {
  const { nodeId, currentDepth } = queue.shift();
  
  if (currentDepth >= params.depth) continue;

  const nextEdges = [];
  
  // Raccogli archi in entrata (chi dipende da me / chi mi usa)
  if (params.direction === 'in' || params.direction === 'both') {
    const incoming = adjListIn.get(nodeId) || [];
    for (const edge of incoming) {
      nextEdges.push({ neighbor: edge.source, source: edge.source, target: nodeId, relation: edge.relation });
    }
  }

  // Raccogli archi in uscita (cosa uso / da chi dipendo)
  if (params.direction === 'out' || params.direction === 'both') {
    const outgoing = adjListOut.get(nodeId) || [];
    for (const edge of outgoing) {
      nextEdges.push({ neighbor: edge.target, source: nodeId, target: edge.target, relation: edge.relation });
    }
  }

  for (const edge of nextEdges) {
    subgraphEdges.push({ source: edge.source, target: edge.target, relation: edge.relation });
    
    if (!visited.has(edge.neighbor)) {
      visited.add(edge.neighbor);
      subgraphNodes.set(edge.neighbor, nodes.get(edge.neighbor));
      queue.push({ nodeId: edge.neighbor, currentDepth: currentDepth + 1 });
    }
  }
}

// 3. Stampa dei risultati in formato leggibile per l'LLM
console.log(`==== SOTTOGRAFO ESTRATTO (Profondità max: ${params.depth}, Direzione: ${params.direction}) ====`);
console.log(`Nodi estratti: ${subgraphNodes.size}, Collegamenti: ${subgraphEdges.length}`);
console.log("");

console.log("### 📌 NODI ARCHITETTURALI COINVOLTI");
subgraphNodes.forEach((attr, id) => {
  const label = attr.type === 'export' ? `[Simbolo Esportato]` : `[File]`;
  console.log(`- **${id}** ${label}`);
});

console.log("\n### 🔗 RELAZIONI E COLLEGAMENTI");
if (subgraphEdges.length === 0) {
  console.log("Nessun collegamento trovato entro la profondità specificata.");
} else {
  // Raggruppiamo per sorgente per una visualizzazione ad albero pulita
  const groupedEdges = new Map();
  for (const edge of subgraphEdges) {
    if (!groupedEdges.has(edge.source)) {
      groupedEdges.set(edge.source, []);
    }
    groupedEdges.get(edge.source).push(edge);
  }

  groupedEdges.forEach((edgesList, source) => {
    console.log(`\n**${source}** usa/dipende da:`);
    for (const edge of edgesList) {
      const relName = edge.relation === 'exports' ? 'esporta' : 
                      edge.relation === 'imports_file' ? 'importa file' : 'usa simbolo';
      console.log(`  └─ (${relName}) ──> **${edge.target}**`);
    }
  });
}
console.log("\n==========================================");
