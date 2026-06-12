import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadQueryGraph } from '../core/GraphStore.js';
import { findShortestPath, findMatchingNodes } from '../algorithms/shortest-path.js';
import { exploreSubgraph } from '../algorithms/subgraph.js';
import { formatMermaid } from '../formatters/mermaid.js';
import { formatQueryReport } from '../formatters/console-reporter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const graphPath = path.resolve(__dirname, '../../output.graph.json');
if (!fs.existsSync(graphPath)) {
  console.error("❌ Graph not found! Please run 'npm run build' first.");
  process.exit(1);
}

// Parse the CLI arguments (simple parser without external libraries)
const args = process.argv.slice(2);
const params = {
  node: '',
  depth: 2,
  direction: 'in', // 'in' (dependents / who uses me), 'out' (dependencies / what I use), 'both' (both)
  mermaid: false,
  from: '',
  to: ''
};

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--node=')) {
    params.node = args[i].split('=')[1];
  } else if (args[i].startsWith('--depth=')) {
    params.depth = parseInt(args[i].split('=')[1], 10);
  } else if (args[i].startsWith('--direction=')) {
    params.direction = args[i].split('=')[1];
  } else if (args[i] === '--mermaid') {
    params.mermaid = true;
  } else if (args[i].startsWith('--from=')) {
    params.from = args[i].split('=')[1];
  } else if (args[i].startsWith('--to=')) {
    params.to = args[i].split('=')[1];
  }
}

if (!params.node && !(params.from && params.to)) {
  console.log(`
Usage: npm run query -- --node=<search_string> [--depth=<number>] [--direction=in|out|both] [--mermaid]
       npm run query -- --from=<nodeA> --to=<nodeB> [--mermaid]

Parameters:
  --node       Name of the file or symbol to search for (partial search)
  --depth      Exploration depth of the dependencies (default: 2)
  --direction  Direction of the relations to follow:
                 - 'in'   : Who uses this node (dependents)
                 - 'out'  : What this node uses (dependencies)
                 - 'both' : Both directions
  --mermaid    Outputs a Mermaid JS graph
  --from, --to Find the shortest path between two nodes (dependencies flow)
`);
  process.exit(0);
}

// Load query-optimized graph representation
const { nodes, adjListIn, adjListOut } = loadQueryGraph(graphPath);

let subgraphNodes = new Map();
let subgraphEdges = [];

if (params.from && params.to) {
  // Shortest Path query
  const { path: pathEdges, startNodes, endNodes } = findShortestPath(nodes, adjListOut, params.from, params.to);

  if (startNodes.length === 0) {
    console.log(`❌ No matching start node found for "${params.from}".`);
    process.exit(0);
  }
  if (endNodes.length === 0) {
    console.log(`❌ No matching end node found for "${params.to}".`);
    process.exit(0);
  }

  if (pathEdges) {
    pathEdges.forEach(edge => {
      subgraphNodes.set(edge.source, nodes.get(edge.source));
      subgraphNodes.set(edge.target, nodes.get(edge.target));
      subgraphEdges.push(edge);
    });
  } else {
    console.log(`❌ No path found from "${params.from}" to "${params.to}".`);
    process.exit(0);
  }

} else {
  // Subgraph Exploration query
  const { subgraphNodes: subNodes, subgraphEdges: subEdges, startNodes } = exploreSubgraph(
    nodes,
    adjListIn,
    adjListOut,
    params.node,
    params.depth,
    params.direction
  );

  if (startNodes.length === 0) {
    console.log(`❌ No matching node found for "${params.node}".`);
    process.exit(0);
  }

  if (!params.mermaid) {
    console.log(`🔍 Start nodes found (${startNodes.length}):`);
    startNodes.forEach(n => console.log(`  - ${n} [type: ${nodes.get(n).type}]`));
    console.log("");
  }

  subgraphNodes = subNodes;
  subgraphEdges = subEdges;
}

// Format and display output
if (params.mermaid) {
  console.log(formatMermaid(subgraphNodes, subgraphEdges));
} else {
  console.log(formatQueryReport(subgraphNodes, subgraphEdges));
}
