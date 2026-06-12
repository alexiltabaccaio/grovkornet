/**
 * Detects cyclic dependencies between file nodes in the graph.
 * 
 * @param {Iterable<string>} allNodes - Iterable of all node IDs in the graph
 * @param {Map<string, string>} nodeTypes - Map of node ID -> node type ('file', 'export', etc.)
 * @param {Map<string, string[]>} adj - Map of file node ID -> list of imported file node IDs
 * @returns {Array<string[]>} Array of cycles found, where each cycle is an array of node IDs beginning and ending with the same node.
 */
export function findDependencyCycles(allNodes, nodeTypes, adj) {
  const visited = new Set();
  const recStack = new Set();
  const cycles = [];

  function dfs(node, dfsPath = []) {
    visited.add(node);
    recStack.add(node);
    dfsPath.push(node);

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, dfsPath);
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
      dfs(node);
    }
  }

  return cycles;
}
