import { findShortestPath } from '../src/algorithms/shortest-path.js';
import { exploreSubgraph } from '../src/algorithms/subgraph.js';
import { findDependencyCycles } from '../src/algorithms/cycles.js';
import { getFsdInfo, validateFsdBoundaries, detectOrphanedFiles } from '../src/algorithms/fsd-validator.js';

console.log("==== Running GraphRAG Algorithms Unit Tests ====");

// Test 1: Shortest Path
{
  const nodes = new Map([
    ['A', { type: 'file' }],
    ['B', { type: 'file' }],
    ['C', { type: 'file' }]
  ]);
  const adjListOut = new Map([
    ['A', [{ target: 'B', relation: 'imports_file' }]],
    ['B', [{ target: 'C', relation: 'imports_file' }]],
    ['C', []]
  ]);

  const { path } = findShortestPath(nodes, adjListOut, 'A', 'C');
  if (!path || path.length !== 2 || path[0].source !== 'A' || path[1].target !== 'C') {
    console.error("❌ Test Failed: Shortest path A -> C not found correctly.", path);
    process.exit(1);
  }
  console.log("✅ Shortest Path test passed.");
}

// Test 2: Subgraph Exploration
{
  const nodes = new Map([
    ['A', { type: 'file' }],
    ['B', { type: 'file' }],
    ['C', { type: 'file' }]
  ]);
  const adjListIn = new Map([
    ['A', []],
    ['B', [{ source: 'A', relation: 'imports_file' }]],
    ['C', [{ source: 'B', relation: 'imports_file' }]]
  ]);
  const adjListOut = new Map([
    ['A', [{ target: 'B', relation: 'imports_file' }]],
    ['B', [{ target: 'C', relation: 'imports_file' }]],
    ['C', []]
  ]);

  const { subgraphNodes, subgraphEdges } = exploreSubgraph(nodes, adjListIn, adjListOut, 'A', 1, 'out');
  if (subgraphNodes.size !== 2 || subgraphEdges.length !== 1) {
    console.error("❌ Test Failed: exploreSubgraph 'A' depth 1 out returned incorrect nodes/edges", subgraphNodes, subgraphEdges);
    process.exit(1);
  }
  console.log("✅ Subgraph Exploration test passed.");
}

// Test 3: Cycles
{
  const allNodes = ['A', 'B', 'C'];
  const nodeTypes = new Map([
    ['A', 'file'],
    ['B', 'file'],
    ['C', 'file']
  ]);
  const adj = new Map([
    ['A', ['B']],
    ['B', ['C']],
    ['C', ['A']]
  ]);

  const cycles = findDependencyCycles(allNodes, nodeTypes, adj);
  if (cycles.length !== 1 || cycles[0].join('->') !== 'A->B->C->A') {
    console.error("❌ Test Failed: Cycle A->B->C->A not detected correctly.", cycles);
    process.exit(1);
  }
  console.log("✅ Cycle Detection test passed.");
}

// Test 4: FSD Info Parsing
{
  const info1 = getFsdInfo('apps/mobile/src/features/camera-controls/ui/CameraButton.tsx');
  if (!info1 || info1.layer !== 'features' || info1.slice !== 'camera-controls' || info1.isPublicApi) {
    console.error("❌ Test Failed: getFsdInfo parse failed for features slice item.", info1);
    process.exit(1);
  }

  const info2 = getFsdInfo('apps/mobile/src/features/camera-controls/index.ts');
  if (!info2 || info2.layer !== 'features' || info2.slice !== 'camera-controls' || !info2.isPublicApi) {
    console.error("❌ Test Failed: getFsdInfo index check failed.", info2);
    process.exit(1);
  }
  console.log("✅ FSD Info Parsing test passed.");
}

// Test 5: FSD Boundaries
{
  const edges = [
    { source: 'apps/mobile/src/entities/film/model.ts', target: 'apps/mobile/src/features/camera-controls/index.ts', relation: 'imports_file' }, // layer inversion (entities -> features)
    { source: 'apps/mobile/src/features/camera-controls/ui/CameraButton.tsx', target: 'apps/mobile/src/features/camera-controls/model/state.ts', relation: 'imports_file' }, // same slice, ok
    { source: 'apps/mobile/src/features/camera-controls/ui/CameraButton.tsx', target: 'apps/mobile/src/entities/film/ui/FilmItem.tsx', relation: 'imports_file' } // cross-slice bypass (features -> entities/ui/FilmItem instead of entities/index.ts)
  ];

  const violations = validateFsdBoundaries(edges);
  const layerInvs = violations.filter(v => v.type === 'layer_inversion');
  const bypasses = violations.filter(v => v.type === 'public_api_bypass');

  if (layerInvs.length !== 1 || bypasses.length !== 1) {
    console.error("❌ Test Failed: validateFsdBoundaries did not flag expected violations.", violations);
    process.exit(1);
  }
  console.log("✅ FSD Boundaries test passed.");
}

// Test 6: Orphaned Files
{
  const allNodes = ['A.ts', 'B.ts', 'C.ts'];
  const nodeTypes = new Map([
    ['A.ts', 'file'],
    ['B.ts', 'file'],
    ['C.ts', 'file']
  ]);
  const adjListIn = new Map([
    ['A.ts', []],
    ['B.ts', ['A.ts']],
    ['C.ts', []]
  ]);

  const orphans = detectOrphanedFiles(allNodes, nodeTypes, adjListIn);
  // A.ts is also orphaned since it has no importers.
  if (orphans.length !== 2 || !orphans.includes('A.ts') || !orphans.includes('C.ts')) {
    console.error("❌ Test Failed: detectOrphanedFiles failed to find expected orphaned files.", orphans);
    process.exit(1);
  }
  console.log("✅ Orphaned Files test passed.");
}

console.log("🎉 All Algorithm Unit Tests Passed successfully!");
