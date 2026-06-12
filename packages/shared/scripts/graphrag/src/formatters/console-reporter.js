import path from 'path';

/**
 * Formats the standard text report for a query subgraph.
 * 
 * @param {Map<string, Object>} subgraphNodes - Map of nodes in the subgraph
 * @param {Array<{source: string, target: string, relation: string}>} subgraphEdges - Edges in the subgraph
 * @returns {string} Text report string
 */
export function formatQueryReport(subgraphNodes, subgraphEdges) {
  const lines = [];
  lines.push('==== EXTRACTED SUBGRAPH ====');
  lines.push(`Extracted nodes: ${subgraphNodes.size}, Connections: ${subgraphEdges.length}`);
  lines.push('');
  
  lines.push('### 📌 INVOLVED ARCHITECTURAL NODES');
  subgraphNodes.forEach((attr, id) => {
    const label = attr.type === 'export' ? `[Exported Symbol]` : `[File]`;
    lines.push(`- **${id}** ${label}`);
  });
  
  lines.push('\n### 🔗 RELATIONS AND CONNECTIONS');
  if (subgraphEdges.length === 0) {
    lines.push('No connections found.');
  } else {
    const groupedEdges = new Map();
    for (const edge of subgraphEdges) {
      if (!groupedEdges.has(edge.source)) {
        groupedEdges.set(edge.source, []);
      }
      groupedEdges.get(edge.source).push(edge);
    }
  
    groupedEdges.forEach((edgesList, source) => {
      lines.push(`\n**${source}** uses/depends on:`);
      for (const edge of edgesList) {
        lines.push(`  └─ (${edge.relation}) ──> **${edge.target}**`);
      }
    });
  }
  lines.push('\n==========================================');
  return lines.join('\n');
}

/**
 * Formats the FSD architecture, cycles, and orphaned files analysis report.
 * 
 * @param {Array<{type: string, source: string, sourceLayer: string, target: string, targetLayer: string, targetSlice?: string}>} violations 
 * @param {Array<string[]>} cycles 
 * @param {string[]} orphanedFiles 
 * @returns {string} Text report string
 */
export function formatAnalysisReport(violations, cycles, orphanedFiles) {
  const lines = [];
  lines.push('==== ARCHITECTURAL ANALYSIS REPORT (GraphRAG) ====\n');

  // 1. FSD Report
  lines.push('1. FEATURE-SLICED DESIGN (FSD) RULE VERIFICATION:');
  if (violations.length === 0) {
    lines.push('  ✅ Congratulations! No FSD boundary violations detected.');
  } else {
    lines.push(`  ❌ Detected ${violations.length} FSD architectural violations:`);
    const grouped = new Map();
    for (const v of violations) {
      if (!grouped.has(v.source)) {
        grouped.set(v.source, { layer: v.sourceLayer, inversions: [], bypasses: [] });
      }
      if (v.type === 'layer_inversion') {
        grouped.get(v.source).inversions.push({ path: v.target, layer: v.targetLayer });
      } else if (v.type === 'public_api_bypass') {
        grouped.get(v.source).bypasses.push({ path: v.target, slice: v.targetSlice });
      }
    }

    grouped.forEach((data, file) => {
      lines.push(`\n  File: ${file} [Layer: ${data.layer.toUpperCase()}]`);
      for (const imp of data.inversions) {
        lines.push(`    ⚠️ Layer Inversion: Tries to import from a higher layer [${imp.layer.toUpperCase()}]`);
        lines.push(`      Imported: ${imp.path}`);
      }
      for (const imp of data.bypasses) {
        lines.push(`    ⚠️ Public API Bypass: Imports directly from inside slice [${imp.slice}] without using its index.ts`);
        lines.push(`      Imported: ${imp.path}`);
      }
    });
  }

  lines.push('\n--------------------------------------------------');

  // 2. Cycle Report
  lines.push('2. CIRCULAR DEPENDENCIES DETECTION (Cycles):');
  if (cycles.length === 0) {
    lines.push('  ✅ Congratulations! No circular dependencies detected between files.');
  } else {
    lines.push(`  ❌ Detected ${cycles.length} dependency cycles (Circular Imports):`);
    cycles.forEach((cycle, index) => {
      lines.push(`\n  Cycle #${index + 1}:`);
      const pathFormatted = cycle.map(node => path.basename(node)).join(' ──> ');
      lines.push(`    Path: ${pathFormatted}`);
      lines.push('    Involved files:');
      cycle.slice(0, -1).forEach((node, i) => {
        lines.push(`      ${i + 1}. ${node}`);
      });
    });
  }

  lines.push('\n--------------------------------------------------');

  // 3. Orphaned Files Report
  lines.push('3. ORPHANED FILES DETECTION (Never Imported):');
  if (orphanedFiles.length === 0) {
    lines.push('  ✅ Congratulations! No orphaned (unused) files detected.');
  } else {
    lines.push(`  ⚠️ Detected ${orphanedFiles.length} orphaned files (present in filesystem but never imported by other source files):`);
    lines.push('  (These might be obsolete files left in the workspace or unused utilities)');
    orphanedFiles.forEach((file, index) => {
      lines.push(`    ${index + 1}. ${file}`);
    });
  }

  lines.push('\n==================================================');

  return lines.join('\n');
}
