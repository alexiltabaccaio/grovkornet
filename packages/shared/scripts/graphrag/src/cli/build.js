import { parseFile } from '../core/Parser.js';
import { scanDirectory } from '../core/Scanner.js';
import { GraphStore } from '../core/GraphStore.js';
import * as typescriptLang from '../languages/typescript.js';
import * as kotlinLang from '../languages/kotlin.js';
import * as cppLang from '../languages/cpp.js';
import * as filamentLang from '../languages/filament.js';
import graphology from 'graphology';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const { MultiDirectedGraph } = graphology;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



console.log("==== Building Grovkornet GraphRAG ====");

const graph = new MultiDirectedGraph();

// Target directories for scanning
const mobileSrc = path.resolve(__dirname, '../../../../../../apps/mobile/src');
const webSrc = path.resolve(__dirname, '../../../../../../apps/web/src');
const sharedSrc = path.resolve(__dirname, '../../../../../shared/src');
const engineSrc = path.resolve(__dirname, '../../../../../../packages/engine/android/src/main');
const engineTsSrc = path.resolve(__dirname, '../../../../../../packages/engine/src');
const grovsnapSrc = path.resolve(__dirname, '../../../../../../apps/grovsnap/src');

console.log(`🔍 Scanning Mobile: ${mobileSrc}`);
console.log(`🔍 Scanning Web: ${webSrc}`);
console.log(`🔍 Scanning Shared: ${sharedSrc}`);
console.log(`🔍 Scanning Engine: ${engineSrc}`);
console.log(`🔍 Scanning Engine TS: ${engineTsSrc}`);
console.log(`🔍 Scanning Grovsnap: ${grovsnapSrc}`);

const allFiles = [
  ...scanDirectory(mobileSrc),
  ...scanDirectory(webSrc),
  ...scanDirectory(sharedSrc),
  ...scanDirectory(engineSrc),
  ...scanDirectory(engineTsSrc),
  ...scanDirectory(grovsnapSrc)
];

// Add mobile entry points explicitly if not in src
const mobileAppTsx = path.resolve(__dirname, '../../../../../../apps/mobile/App.tsx');
const mobileIndexTs = path.resolve(__dirname, '../../../../../../apps/mobile/index.ts');
if (fs.existsSync(mobileAppTsx)) allFiles.push(mobileAppTsx);
if (fs.existsSync(mobileIndexTs)) allFiles.push(mobileIndexTs);

console.log(`📁 Source files found: ${allFiles.length}`);

// Helper to normalize paths and make them relative to the monorepo root
const rootDir = path.resolve(__dirname, '../../../../../../');
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
  '.mat': filamentLang,
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
    const ext = path.extname(file);
    const isBlankTree = tree && tree.rootNode && tree.rootNode.childCount === 0 && fs.statSync(file).size > 0;

    let exports;
    if (isBlankTree) {
      const sourceCode = fs.readFileSync(file, 'utf8');
      exports = typeof handler.extractDefinitionsFallback === 'function'
        ? handler.extractDefinitionsFallback(sourceCode)
        : new Set();
    } else {
      exports = handler.extractDefinitions(tree);
    }
    
    // Register exported symbols as nodes in the graph
    for (const exportName of exports) {
      let symbolId;
      if (exportName.startsWith('jni:') || exportName.startsWith('expo-module:') || exportName.startsWith('filament-shader:')) {
        symbolId = exportName;
      } else {
        symbolId = `${relPath}:${exportName}`;
      }

      if (!graph.hasNode(symbolId)) {
        if (exportName.startsWith('jni:')) {
          graph.addNode(symbolId, { type: 'jni-symbol', name: exportName.replace('jni:', ''), file: relPath });
        } else if (exportName.startsWith('expo-module:')) {
          graph.addNode(symbolId, { type: 'expo-module', name: exportName.replace('expo-module:', ''), file: relPath });
        } else if (exportName.startsWith('filament-shader:')) {
          graph.addNode(symbolId, { type: 'filament-shader', name: exportName.replace('filament-shader:', ''), file: relPath });
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
    console.warn(`⚠️ Error parsing exports for ${relPath}:`, err.stack);
  }
}

// 2. Import path resolution and edge linking
for (const file of allFiles) {
  const relPath = getRelativePath(file);
  
  try {
    const handler = getLanguageHandler(file);
    if (!handler) continue;

    const tree = parseFile(file);
    const ext = path.extname(file);
    const isBlankTree = tree && tree.rootNode && tree.rootNode.childCount === 0 && fs.statSync(file).size > 0;

    let dependencies;
    if (isBlankTree) {
      const sourceCode = fs.readFileSync(file, 'utf8');
      dependencies = typeof handler.extractDependenciesFallback === 'function'
        ? handler.extractDependenciesFallback(sourceCode)
        : [];
    } else {
      dependencies = handler.extractDependencies(tree);
    }
    
    for (const dep of dependencies) {
      const { source, symbols, isExpoModule, isJni, isFilamentShader } = dep;
      
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

      // Map Filament Shader dependency
      if (isFilamentShader) {
        const shaderName = source.split(':')[1];
        const shaderNodeId = `filament-shader:${shaderName}`;
        if (!graph.hasNode(shaderNodeId)) {
          graph.addNode(shaderNodeId, { type: 'filament-shader', name: shaderName });
        }
        if (!graph.hasEdge(relPath, shaderNodeId)) {
          graph.addEdge(relPath, shaderNodeId, { relation: 'uses_shader' });
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
    console.warn(`⚠️ Error processing imports for ${relPath}:`, err.stack);
  }
}

// 3. Serialization and output to JSON using GraphStore
const outputPath = path.resolve(__dirname, '../../output.graph.json');
const store = new GraphStore(outputPath);
store.saveGraphology(graph);

console.log(`🎉 Graph built successfully! Saved in: ${getRelativePath(outputPath)}`);
console.log(`Total Nodes: ${graph.order}, Total Edges: ${graph.size}`);
