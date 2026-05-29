import { parseFile, scanDirectory } from './parser.js';
import { resolveImport } from './resolver.js';
import graphology from 'graphology';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { MultiDirectedGraph } = graphology;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("==== Building Grovkornet GraphRAG ====");

const graph = new MultiDirectedGraph();

// Cartelle target del monorepo
const mobileSrc = path.resolve(__dirname, '../../../../apps/mobile/src');
const sharedSrc = path.resolve(__dirname, '../../../shared/src');

console.log(`🔍 Scansione Mobile: ${mobileSrc}`);
console.log(`🔍 Scansione Shared: ${sharedSrc}`);

const allFiles = [
  ...scanDirectory(mobileSrc),
  ...scanDirectory(sharedSrc)
];

console.log(`📁 File sorgente trovati: ${allFiles.length}`);

// Helper per normalizzare i percorsi e renderli relativi alla root del monorepo
const rootDir = path.resolve(__dirname, '../../../../');
function getRelativePath(absPath) {
  return path.relative(rootDir, absPath).replace(/\\/g, '/');
}

/**
 * Funzione helper per trovare ricorsivamente tutti i nodi di un certo tipo all'interno di un AST
 */
function findNodesByType(node, type) {
  const results = [];
  function walk(n) {
    if (n.type === type) {
      results.push(n);
    }
    for (let i = 0; i < n.childCount; i++) {
      walk(n.child(i));
    }
  }
  walk(node);
  return results;
}

/**
 * Trova il primo nodo di tipo identifier all'interno di un sotto-albero
 */
function findFirstIdentifier(node) {
  if (node.type === 'identifier') return node.text;
  for (let i = 0; i < node.childCount; i++) {
    const found = findFirstIdentifier(node.child(i));
    if (found) return found;
  }
  return null;
}

// 1. Registrazione dei nodi File ed estrazione degli Export (Definitions)
const fileExports = new Map();

for (const file of allFiles) {
  const relPath = getRelativePath(file);
  
  if (!graph.hasNode(relPath)) {
    graph.addNode(relPath, { type: 'file', path: relPath });
  }

  try {
    const tree = parseFile(file);
    const exports = new Set();
    
    // Trova tutti gli export statement
    const exportStatements = findNodesByType(tree.rootNode, 'export_statement');
    
    for (const expStmt of exportStatements) {
      // Un export statement contiene solitamente una dichiarazione come figlio (function_declaration, class_declaration, etc.)
      for (let i = 0; i < expStmt.childCount; i++) {
        const child = expStmt.child(i);
        
        if (
          child.type === 'function_declaration' ||
          child.type === 'class_declaration' ||
          child.type === 'interface_declaration' ||
          child.type === 'type_alias_declaration'
        ) {
          const name = findFirstIdentifier(child);
          if (name) exports.add(name);
        } 
        else if (child.type === 'lexical_declaration') {
          // export const X = ... o export let Y = ...
          const declarators = findNodesByType(child, 'variable_declarator');
          for (const dec of declarators) {
            const name = findFirstIdentifier(dec);
            if (name) exports.add(name);
          }
        }
        else if (child.type === 'export_clause') {
          // export { a, b }
          const specifiers = findNodesByType(child, 'export_specifier');
          for (const spec of specifiers) {
            const name = findFirstIdentifier(spec);
            if (name) exports.add(name);
          }
        }
      }
    }
    
    // Registra i simboli esportati come nodi nel grafo
    for (const exportName of exports) {
      const symbolId = `${relPath}:${exportName}`;
      if (!graph.hasNode(symbolId)) {
        graph.addNode(symbolId, { type: 'export', name: exportName, file: relPath });
        graph.addEdge(relPath, symbolId, { relation: 'exports' });
      }
    }
    
    fileExports.set(relPath, exports);
  } catch (err) {
    console.warn(`⚠️ Errore nel parsing delle esportazioni per ${relPath}:`, err.message);
  }
}

// 2. Risoluzione dei percorsi e creazione dei collegamenti (Archi)
for (const file of allFiles) {
  const relPath = getRelativePath(file);
  
  try {
    const tree = parseFile(file);
    const importStatements = findNodesByType(tree.rootNode, 'import_statement');
    
    // Trova anche le esportazioni con sorgente (re-export, es: export * from './foo')
    const exportStatementsWithSource = findNodesByType(tree.rootNode, 'export_statement')
      .filter(node => findNodesByType(node, 'string').length > 0);
      
    const dependencyNodes = [...importStatements, ...exportStatementsWithSource];
    
    for (const depNode of dependencyNodes) {
      // Trova la stringa sorgente dell'import/export
      const stringNodes = findNodesByType(depNode, 'string');
      if (stringNodes.length === 0) continue;
      
      // Rimuoviamo le virgolette esterne
      const importSource = stringNodes[0].text.slice(1, -1);
      
      // Estrae i simboli associati all'import o all'export nominativo
      const specifierType = depNode.type === 'import_statement' ? 'import_specifier' : 'export_specifier';
      const specifiers = findNodesByType(depNode, specifierType);
      const importedSymbols = specifiers.map(spec => findFirstIdentifier(spec)).filter(Boolean);
      
      const resolvedAbsPath = resolveImport(file, importSource);
      if (resolvedAbsPath) {
        const resolvedRelPath = getRelativePath(resolvedAbsPath);
        
        // Collega File A -> IMPORTS -> File B
        if (graph.hasNode(resolvedRelPath)) {
          if (!graph.hasEdge(relPath, resolvedRelPath)) {
            graph.addEdge(relPath, resolvedRelPath, { relation: 'imports_file' });
          }
          
          // Collega File A -> USES -> Simbolo esportato da File B
          for (const symbol of importedSymbols) {
            const symbolId = `${resolvedRelPath}:${symbol}`;
            if (graph.hasNode(symbolId)) {
              graph.addEdge(relPath, symbolId, { relation: 'uses_symbol' });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn(`⚠️ Errore nel processamento degli import per ${relPath}:`, err.message);
  }
}

// 3. Serializzazione ed esportazione su file JSON
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

console.log(`🎉 Grafo costruito con successo! Salvato in: ${getRelativePath(outputPath)}`);
console.log(`Nodi Totali: ${graphData.nodes.length}, Archi Totali: ${graphData.edges.length}`);
