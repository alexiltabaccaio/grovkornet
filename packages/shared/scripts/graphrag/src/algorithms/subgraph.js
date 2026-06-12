import { findMatchingNodes } from './shortest-path.js';

/**
 * Explores a subgraph around nodes matching 'nodeQuery' up to 'maxDepth'.
 * 
 * @param {Map<string, Object>} nodesMap - Map of all node attributes
 * @param {Map<string, Array<{source: string, relation: string}>>} adjListIn - Incoming adjacency list
 * @param {Map<string, Array<{target: string, relation: string}>>} adjListOut - Outgoing adjacency list
 * @param {string} nodeQuery - Node search query string
 * @param {number} maxDepth - Max exploration depth
 * @param {'in'|'out'|'both'} direction - Which direction to follow ('in', 'out', or 'both')
 * @returns {{subgraphNodes: Map<string, Object>, subgraphEdges: Array<{source: string, target: string, relation: string}>, startNodes: string[]}}
 */
export function exploreSubgraph(nodesMap, adjListIn, adjListOut, nodeQuery, maxDepth, direction = 'in') {
  const allNodeIds = Array.from(nodesMap.keys());
  const startNodes = findMatchingNodes(nodeQuery, allNodeIds);

  const subgraphNodes = new Map();
  const subgraphEdges = [];

  if (startNodes.length === 0) {
    return { subgraphNodes, subgraphEdges, startNodes };
  }

  const visited = new Set();
  const queue = [];

  for (const startNode of startNodes) {
    queue.push({ nodeId: startNode, currentDepth: 0 });
    visited.add(startNode);
    subgraphNodes.set(startNode, nodesMap.get(startNode));
  }

  while (queue.length > 0) {
    const { nodeId, currentDepth } = queue.shift();
    
    if (currentDepth >= maxDepth) continue;

    const nextEdges = [];
    
    if (direction === 'in' || direction === 'both') {
      const incoming = adjListIn.get(nodeId) || [];
      for (const edge of incoming) {
        nextEdges.push({ neighbor: edge.source, source: edge.source, target: nodeId, relation: edge.relation });
      }
    }

    if (direction === 'out' || direction === 'both') {
      const outgoing = adjListOut.get(nodeId) || [];
      for (const edge of outgoing) {
        nextEdges.push({ neighbor: edge.target, source: nodeId, target: edge.target, relation: edge.relation });
      }
    }

    for (const edge of nextEdges) {
      // Avoid duplicate edges in subgraphEdges (optional, but keep same logic as original script)
      subgraphEdges.push({ source: edge.source, target: edge.target, relation: edge.relation });
      
      if (!visited.has(edge.neighbor)) {
        visited.add(edge.neighbor);
        subgraphNodes.set(edge.neighbor, nodesMap.get(edge.neighbor));
        queue.push({ nodeId: edge.neighbor, currentDepth: currentDepth + 1 });
      }
    }
  }

  return { subgraphNodes, subgraphEdges, startNodes };
}
