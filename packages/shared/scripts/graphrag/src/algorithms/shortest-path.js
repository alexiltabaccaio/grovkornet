/**
 * Helper to perform partial matches on node IDs
 * @param {string} query 
 * @param {Iterable<string>} nodeIds 
 * @returns {string[]}
 */
export function findMatchingNodes(query, nodeIds) {
  const qLower = query.toLowerCase();
  const result = [];
  for (const id of nodeIds) {
    if (id.toLowerCase().includes(qLower)) {
      result.push(id);
    }
  }
  return result;
}

/**
 * Finds the shortest path from nodes matching 'fromQuery' to nodes matching 'toQuery'
 * using Breadth-First Search (BFS) over outgoing dependencies.
 * 
 * @param {Map<string, Object>} nodesMap - Map of all node attributes
 * @param {Map<string, Array<{target: string, relation: string}>>} adjListOut - Outgoing adjacency list
 * @param {string} fromQuery - Start node query string
 * @param {string} toQuery - End node query string
 * @returns {{path: Array<{source: string, target: string, relation: string}>|null, startNodes: string[], endNodes: string[]}}
 */
export function findShortestPath(nodesMap, adjListOut, fromQuery, toQuery) {
  const allNodeIds = Array.from(nodesMap.keys());
  const startNodes = findMatchingNodes(fromQuery, allNodeIds);
  const endNodes = findMatchingNodes(toQuery, allNodeIds);

  if (startNodes.length === 0 || endNodes.length === 0) {
    return { path: null, startNodes, endNodes };
  }

  const endNodesSet = new Set(endNodes);
  const queue = [];
  const visited = new Set();
  const parentMap = new Map(); // node -> { parentNode, relation }

  for (const start of startNodes) {
    queue.push(start);
    visited.add(start);
  }

  let foundEndNode = null;

  while (queue.length > 0) {
    const current = queue.shift();

    if (endNodesSet.has(current)) {
      foundEndNode = current;
      break;
    }

    const outgoing = adjListOut.get(current) || [];
    for (const edge of outgoing) {
      if (!visited.has(edge.target)) {
        visited.add(edge.target);
        parentMap.set(edge.target, { parentNode: current, relation: edge.relation });
        queue.push(edge.target);
      }
    }
  }

  if (!foundEndNode) {
    return { path: null, startNodes, endNodes };
  }

  // Reconstruct path
  let curr = foundEndNode;
  const path = [];
  while (curr && parentMap.has(curr)) {
    const p = parentMap.get(curr);
    path.unshift({ source: p.parentNode, target: curr, relation: p.relation });
    curr = p.parentNode;
  }

  return { path, startNodes, endNodes };
}
