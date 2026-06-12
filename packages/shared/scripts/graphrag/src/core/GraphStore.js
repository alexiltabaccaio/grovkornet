import fs from 'fs';
import graphology from 'graphology';

const { MultiDirectedGraph } = graphology;

export class GraphStore {
  /**
   * @param {string} filePath - Absolute path to the serialized graph JSON file
   */
  constructor(filePath) {
    this.filePath = filePath;
  }

  /**
   * Checks if the graph file exists
   * @returns {boolean}
   */
  exists() {
    return fs.existsSync(this.filePath);
  }

  /**
   * Loads the raw JSON serialization data
   * @returns {{nodes: Object[], edges: Object[]}}
   */
  loadRaw() {
    if (!this.exists()) {
      throw new Error(`Graph file not found at ${this.filePath}`);
    }
    return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
  }

  /**
   * Loads and builds a graphology MultiDirectedGraph instance
   * @returns {MultiDirectedGraph}
   */
  loadGraphology() {
    const data = this.loadRaw();
    const graph = new MultiDirectedGraph();
    
    for (const node of data.nodes) {
      const { id, ...attrs } = node;
      graph.addNode(id, attrs);
    }
    
    for (const edge of data.edges) {
      const { id, source, target, ...attrs } = edge;
      graph.addEdgeWithKey(id, source, target, attrs);
    }
    
    return graph;
  }

  /**
   * Saves a graphology MultiDirectedGraph instance to the file
   * @param {MultiDirectedGraph} graph 
   */
  saveGraphology(graph) {
    const graphData = {
      nodes: [],
      edges: []
    };

    graph.forEachNode((node, attributes) => {
      graphData.nodes.push({ id: node, ...attributes });
    });

    graph.forEachEdge((edge, attributes, source, target) => {
      graphData.edges.push({ id: edge, source, target, ...attributes });
    });

    fs.writeFileSync(this.filePath, JSON.stringify(graphData, null, 2));
  }
}

/**
 * Loads the graph data and parses it into fast lookup maps for querying
 * @param {string} filePath 
 * @returns {{nodes: Map<string, Object>, adjListIn: Map<string, Array<{source: string, relation: string}>>, adjListOut: Map<string, Array<{target: string, relation: string}>>, raw: {nodes: Object[], edges: Object[]}}}
 */
export function loadQueryGraph(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Graph file not found at ${filePath}`);
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const nodes = new Map();
  const adjListIn = new Map();
  const adjListOut = new Map();

  for (const node of data.nodes) {
    nodes.set(node.id, node);
    adjListIn.set(node.id, []);
    adjListOut.set(node.id, []);
  }

  for (const edge of data.edges) {
    const { source, target, relation } = edge;
    
    if (adjListIn.has(target)) {
      adjListIn.get(target).push({ source, relation });
    }
    if (adjListOut.has(source)) {
      adjListOut.get(source).push({ target, relation });
    }
  }

  return { nodes, adjListIn, adjListOut, raw: data };
}
