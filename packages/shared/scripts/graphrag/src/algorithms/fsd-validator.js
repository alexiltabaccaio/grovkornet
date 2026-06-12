import path from 'path';

// FSD Hierarchy
export const FSD_LAYERS = ['app', 'screens', 'widgets', 'features', 'entities', 'shared'];

/**
 * Parses a filepath to extract FSD information (layer, slice, rest, isPublicApi).
 * Matches patterns like: apps/mobile/src/features/camera-controls/ui/CameraButton.tsx
 * 
 * @param {string} filePath 
 * @returns {{layer: string, slice: string, rest: string, isPublicApi: boolean}|null}
 */
export function getFsdInfo(filePath) {
  const match = filePath.match(/apps\/(?:mobile|web)\/src\/([^/]+)\/([^/]+)(.*)/);
  if (match) {
    const layer = match[1];
    const slice = match[2];
    const rest = match[3];
    if (FSD_LAYERS.includes(layer)) {
      return {
        layer,
        slice,
        rest,
        isPublicApi: rest === '' || rest === '/' || rest === '/index.ts' || rest === '/index.tsx'
      };
    }
  }
  return null;
}

/**
 * Validates FSD boundaries on all import edges.
 * 
 * @param {Array<{source: string, target: string, relation: string}>} edges 
 * @returns {Array<{type: 'layer_inversion'|'public_api_bypass', source: string, sourceLayer: string, target: string, targetLayer: string, targetSlice?: string}>} List of violations
 */
export function validateFsdBoundaries(edges) {
  const violations = [];

  for (const edge of edges) {
    if (edge.relation !== 'imports_file') {
      continue;
    }

    const sourceInfo = getFsdInfo(edge.source);
    const targetInfo = getFsdInfo(edge.target);

    if (sourceInfo && targetInfo) {
      const sourceLayer = sourceInfo.layer;
      const targetLayer = targetInfo.layer;
      const sourceIndex = FSD_LAYERS.indexOf(sourceLayer);
      const targetIndex = FSD_LAYERS.indexOf(targetLayer);

      // 1. Layer Inversion
      if (targetIndex < sourceIndex) {
        violations.push({
          type: 'layer_inversion',
          source: edge.source,
          sourceLayer,
          target: edge.target,
          targetLayer
        });
      }

      // 2. Public API Bypass
      const isCrossSlice = sourceLayer !== targetLayer || sourceInfo.slice !== targetInfo.slice;
      if (isCrossSlice && targetLayer !== 'shared') {
        if (!targetInfo.isPublicApi) {
          violations.push({
            type: 'public_api_bypass',
            source: edge.source,
            sourceLayer,
            target: edge.target,
            targetLayer,
            targetSlice: targetInfo.slice
          });
        }
      }
    }
  }

  return violations;
}

/**
 * Identifies files that are present in the graph but never imported by any other source files.
 * Filters out config files, index files, entrypoints, and test files.
 * 
 * @param {Iterable<string>} allNodes 
 * @param {Map<string, string>} nodeTypes 
 * @param {Map<string, string[]>} adjListIn 
 * @returns {string[]} List of orphaned file paths
 */
export function detectOrphanedFiles(allNodes, nodeTypes, adjListIn) {
  const orphanedFiles = [];

  for (const node of allNodes) {
    if (nodeTypes.get(node) === 'file') {
      const importers = adjListIn.get(node) || [];
      
      if (importers.length === 0) {
        const basename = path.basename(node);
        const ext = path.extname(node);
        const isTsFile = ext === '.ts' || ext === '.tsx';
        const isEntryPoint = node.includes('app/index.tsx') || node.includes('app/App.tsx');
        const isTestFile = node.includes('.test.') || node.includes('.spec.') || node.includes('.smoke.');
        const isFsdIndex = basename === 'index.ts' || basename === 'index.tsx';
        const isConfig = basename.includes('config') || basename.includes('setup');

        if (isTsFile && !isEntryPoint && !isTestFile && !isFsdIndex && !isConfig) {
          orphanedFiles.push(node);
        }
      }
    }
  }

  return orphanedFiles;
}
