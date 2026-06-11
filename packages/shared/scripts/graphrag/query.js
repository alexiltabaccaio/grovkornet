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

// Load the serialized graph
const graphData = JSON.parse(fs.readFileSync(graphPath, 'utf8'));

// Parse the CLI arguments (simple parser without external libraries)
const args = process.argv.slice(2);
const params = {
  node: '',
  depth: 2,
  direction: 'in' // 'in' (dependents / who uses me), 'out' (dependencies / what I use), 'both' (both)
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
Usage: node query.js --node=<search_string> [--depth=<number>] [--direction=in|out|both]

Parameters:
  --node       Name of the file or symbol to search for (partial search)
  --depth      Exploration depth of the dependencies (default: 2)
  --direction  Direction of the relations to follow:
                 - 'in'   : Who uses this node (dependents)
                 - 'out'  : What this node uses (dependencies)
                 - 'both' : Both directions
`);
  process.exit(0);
}

// Build a representation of the graph for fast queries
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

// 1. Find start nodes (partial ID matching)
const startNodes = [];
const searchLower = params.node.toLowerCase();

for (const nodeId of nodes.keys()) {
  if (nodeId.toLowerCase().includes(searchLower)) {
    startNodes.push(nodeId);
  }
}

if (startNodes.length === 0) {
  console.log(`❌ No matching node found for "${params.node}".`);
  process.exit(0);
}

console.log(`🔍 Start nodes found (${startNodes.length}):`);
startNodes.forEach(n => console.log(`  - ${n} [type: ${nodes.get(n).type}]`));
console.log("");

// 2. BFS to extract the subgraph
const visited = new Set();
const subgraphNodes = new Map(); // id -> attributes
const subgraphEdges = []; // array of { source, target, relation }

const queue = []; // array of { nodeId, currentDepth }

for (const startNode of startNodes) {
  queue.push({ nodeId: startNode, currentDepth: 0 });
  visited.add(startNode);
  subgraphNodes.set(startNode, nodes.get(startNode));
}

while (queue.length > 0) {
  const { nodeId, currentDepth } = queue.shift();
  
  if (currentDepth >= params.depth) continue;

  const nextEdges = [];
  
  // Collect incoming edges (who depends on me / who uses me)
  if (params.direction === 'in' || params.direction === 'both') {
    const incoming = adjListIn.get(nodeId) || [];
    for (const edge of incoming) {
      nextEdges.push({ neighbor: edge.source, source: edge.source, target: nodeId, relation: edge.relation });
    }
  }

  // Collect outgoing edges (what I use / on whom I depend)
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

// 3. Print the results in a readable format for the LLM
console.log(`==== EXTRACTED SUBGRAPH (Max depth: ${params.depth}, Direction: ${params.direction}) ====`);
console.log(`Extracted nodes: ${subgraphNodes.size}, Connections: ${subgraphEdges.length}`);
console.log("");

console.log("### 📌 INVOLVED ARCHITECTURAL NODES");
subgraphNodes.forEach((attr, id) => {
  const label = attr.type === 'export' ? `[Exported Symbol]` : `[File]`;
  console.log(`- **${id}** ${label}`);
});

console.log("\n### 🔗 RELATIONS AND CONNECTIONS");
if (subgraphEdges.length === 0) {
  console.log("No connections found within the specified depth.");
} else {
  // Group by source for a clean tree visualization
  const groupedEdges = new Map();
  for (const edge of subgraphEdges) {
    if (!groupedEdges.has(edge.source)) {
      groupedEdges.set(edge.source, []);
    }
    groupedEdges.get(edge.source).push(edge);
  }

  groupedEdges.forEach((edgesList, source) => {
    console.log(`\n**${source}** uses/depends on:`);
    for (const edge of edgesList) {
      const relName = edge.relation === 'exports' ? 'exports' : 
                      edge.relation === 'imports_file' ? 'imports file' : 'uses symbol';
      console.log(`  └─ (${relName}) ──> **${edge.target}**`);
    }
  });
}
console.log("\n==========================================");
