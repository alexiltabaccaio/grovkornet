import { parseFile, scanDirectory } from './parser.js';
import * as typescriptLang from './languages/typescript.js';
import * as kotlinLang from './languages/kotlin.js';
import * as cppLang from './languages/cpp.js';
import graphology from 'graphology';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { MultiDirectedGraph } = graphology;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("==== Building Grovkornet GraphRAG ====");

const graph = new MultiDirectedGraph();

// Target directories for scanning
const mobileSrc = path.resolve(__dirname, '../../../../apps/mobile/src');
const sharedSrc = path.resolve(__dirname, '../../../shared/src');
const engineSrc = path.resolve(__dirname, '../../../../packages/engine/android/src/main');
const engineTsSrc = path.resolve(__dirname, '../../../../packages/engine/src');

console.log(`🔍 Scanning Mobile: ${mobileSrc}`);
console.log(`🔍 Scanning Shared: ${sharedSrc}`);
console.log(`🔍 Scanning Engine: ${engineSrc}`);
console.log(`🔍 Scanning Engine TS: ${engineTsSrc}`);

const allFiles = [
  ...scanDirectory(mobileSrc),
  ...scanDirectory(sharedSrc),
  ...scanDirectory(engineSrc),
  ...scanDirectory(engineTsSrc)
];

console.log(`📁 Source files found: ${allFiles.length}`);

// Helper to normalize paths and make them relative to the monorepo root
const rootDir = path.resolve(__dirname, '../../../../');
function getRelativePath(absPath) {
  return path.relative(rootDir, absPath).replace(/\\/g, '/');
}

// Map extensions to language handlers
const languageHandlers = {
  '.ts': typescriptLang,
  '.tsx': typescriptLang,
  '.kt': kotlinLang,
  '.cpp': cppLang,
  '.h': cppLang,
};

function getLanguageHandler(filePath) {
  const ext = path.extname(filePath);
  return languageHandlers[ext] || null;
}

// 1. File registration and export (definition) extraction
const fileExports = new Map();

for (const file of allFiles) {
  const relPath = getRelativePath(file);
  
  if (!graph.hasNode(relPath)) {
    graph.addNode(relPath, { type: 'file', path: relPath });
  }

  try {
    const handler = getLanguageHandler(file);
    if (!handler) continue;

    const tree = parseFile(file);
    const exports = handler.extractDefinitions(tree);
    
    // Register exported symbols as nodes in the graph
    for (const exportName of exports) {
      let symbolId;
      if (exportName.startsWith('jni:') || exportName.startsWith('expo-module:')) {
        symbolId = exportName;
      } else {
        symbolId = `${relPath}:${exportName}`;
      }

      if (!graph.hasNode(symbolId)) {
        if (exportName.startsWith('jni:')) {
          graph.addNode(symbolId, { type: 'jni-symbol', name: exportName.replace('jni:', ''), file: relPath });
        } else if (exportName.startsWith('expo-module:')) {
          graph.addNode(symbolId, { type: 'expo-module', name: exportName.replace('expo-module:', ''), file: relPath });
        } else {
          graph.addNode(symbolId, { type: 'export', name: exportName, file: relPath });
        }
      }
      
      // Link file to symbol
      if (!graph.hasEdge(relPath, symbolId)) {
        graph.addEdge(relPath, symbolId, { relation: 'exports' });
      }
    }
    
    fileExports.set(relPath, exports);
  } catch (err) {
    console.warn(`⚠️ Error parsing exports for ${relPath}:`, err.message);
  }
}

// 2. Import path resolution and edge linking
for (const file of allFiles) {
  const relPath = getRelativePath(file);
  
  try {
    const handler = getLanguageHandler(file);
    if (!handler) continue;

    const tree = parseFile(file);
    const dependencies = handler.extractDependencies(tree);
    
    for (const dep of dependencies) {
      const { source, symbols, isExpoModule, isJni } = dep;
      
      // Map Expo Native Module dependency
      if (isExpoModule) {
        const moduleName = source.split(':')[1];
        const moduleNodeId = `expo-module:${moduleName}`;
        if (!graph.hasNode(moduleNodeId)) {
          graph.addNode(moduleNodeId, { type: 'expo-module', name: moduleName });
        }
        if (!graph.hasEdge(relPath, moduleNodeId)) {
          graph.addEdge(relPath, moduleNodeId, { relation: 'requires_expo_module' });
        }
        continue;
      }

      // Map JNI dependency
      if (isJni) {
        const jniSymbolId = source;
        if (!graph.hasNode(jniSymbolId)) {
          graph.addNode(jniSymbolId, { type: 'jni-symbol', name: jniSymbolId.replace('jni:', '') });
        }
        if (!graph.hasEdge(relPath, jniSymbolId)) {
          graph.addEdge(relPath, jniSymbolId, { relation: 'calls_native' });
        }
        continue;
      }
      
      const resolvedAbsPath = handler.resolve(file, source);
      if (resolvedAbsPath) {
        const resolvedRelPath = getRelativePath(resolvedAbsPath);
        
        // Link File A -> IMPORTS -> File B
        if (graph.hasNode(resolvedRelPath)) {
          if (!graph.hasEdge(relPath, resolvedRelPath)) {
            graph.addEdge(relPath, resolvedRelPath, { relation: 'imports_file' });
          }
          
          // Link File A -> USES -> Exported Symbol of File B
          for (const symbol of symbols) {
            const symbolId = `${resolvedRelPath}:${symbol}`;
            if (graph.hasNode(symbolId)) {
              if (!graph.hasEdge(relPath, symbolId)) {
                graph.addEdge(relPath, symbolId, { relation: 'uses_symbol' });
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn(`⚠️ Error processing imports for ${relPath}:`, err.message);
  }
}

// 3. Serialization and output to JSON
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

const outputPath = path.resolve(__dirname, './output.graph.json');
fs.writeFileSync(outputPath, JSON.stringify(graphData, null, 2));

console.log(`🎉 Graph built successfully! Saved in: ${getRelativePath(outputPath)}`);
console.log(`Total Nodes: ${graphData.nodes.length}, Total Edges: ${graphData.edges.length}`);

