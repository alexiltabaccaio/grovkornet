/**
 * Formats a subgraph as a Mermaid JS graph markdown string.
 * 
 * @param {Map<string, Object>} subgraphNodes - Map of nodes in the subgraph
 * @param {Array<{source: string, target: string, relation: string}>} subgraphEdges - Edges in the subgraph
 * @returns {string} Mermaid graph string
 */
export function formatMermaid(subgraphNodes, subgraphEdges) {
  const lines = [];
  lines.push('```mermaid');
  lines.push('graph TD');
  
  const sanitizedNames = new Map();
  let counter = 0;
  
  function getSafeId(nodeId) {
    if (!sanitizedNames.has(nodeId)) {
      sanitizedNames.set(nodeId, `node_${counter++}`);
    }
    return sanitizedNames.get(nodeId);
  }

  // Define nodes with basic styling
  subgraphNodes.forEach((attr, id) => {
    const sId = getSafeId(id);
    const label = id.replace(/"/g, "'");
    if (attr.type === 'export') {
      lines.push(`  ${sId}["${label}"]:::export`);
    } else {
      lines.push(`  ${sId}["${label}"]:::file`);
    }
  });

  // Define edges
  subgraphEdges.forEach(edge => {
    const sId = getSafeId(edge.source);
    const tId = getSafeId(edge.target);
    const rel = edge.relation;
    lines.push(`  ${sId} -->|${rel}| ${tId}`);
  });

  lines.push('\n  classDef export fill:#f9f,stroke:#333,stroke-width:2px;');
  lines.push('  classDef file fill:#bbf,stroke:#333,stroke-width:2px;');
  lines.push('```');

  return lines.join('\n');
}
