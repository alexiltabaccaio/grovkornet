import { createMatchPath, loadConfig } from 'tsconfig-paths';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load TSConfigs to resolve FSD path aliases
const mobileTsconfigPath = path.resolve(__dirname, '../../../../../../apps/mobile/tsconfig.json');
const mobileConfigResult = loadConfig(mobileTsconfigPath);

let mobileMatchPath = () => null;
if (mobileConfigResult.resultType === 'success') {
  mobileMatchPath = createMatchPath(
    mobileConfigResult.absoluteBaseUrl,
    mobileConfigResult.paths
  );
} else {
  console.warn("⚠️ Failed to load apps/mobile/tsconfig.json. FSD path aliases might not resolve properly.");
}

const webTsconfigPath = path.resolve(__dirname, '../../../../../../apps/web/tsconfig.json');
const webConfigResult = loadConfig(webTsconfigPath);

let webMatchPath = () => null;
if (webConfigResult.resultType === 'success') {
  webMatchPath = createMatchPath(
    webConfigResult.absoluteBaseUrl,
    webConfigResult.paths
  );
} else {
  console.warn("⚠️ Failed to load apps/web/tsconfig.json. Web path aliases might not resolve properly.");
}

/**
 * Finds all nodes of a specific type recursively in the AST tree
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
 * Finds the first identifier node text within a subtree
 */
function findFirstIdentifier(node) {
  if (node.type === 'identifier') return node.text;
  for (let i = 0; i < node.childCount; i++) {
    const found = findFirstIdentifier(node.child(i));
    if (found) return found;
  }
  return null;
}

/**
 * Ensures file extension is appended or maps to index.ts/tsx for standard imports
 */
function ensureFileExtension(basePath) {
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
    return basePath;
  }

  for (const ext of extensions) {
    const fileWithExt = basePath + ext;
    if (fs.existsSync(fileWithExt) && fs.statSync(fileWithExt).isFile()) {
      return fileWithExt;
    }
  }

  for (const ext of extensions) {
    const indexWithExt = path.join(basePath, 'index' + ext);
    if (fs.existsSync(indexWithExt) && fs.statSync(indexWithExt).isFile()) {
      return indexWithExt;
    }
  }

  return null;
}

/**
 * Extract exported symbols (definitions) from a TypeScript AST
 * @param {Parser.Tree} tree
 * @returns {Set<string>} Set of exported symbols
 */
export function extractDefinitions(tree) {
  const exports = new Set();
  const exportStatements = findNodesByType(tree.rootNode, 'export_statement');
  
  for (const expStmt of exportStatements) {
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
        const declarators = findNodesByType(child, 'variable_declarator');
        for (const dec of declarators) {
          const name = findFirstIdentifier(dec);
          if (name) exports.add(name);
        }
      }
      else if (child.type === 'export_clause') {
        const specifiers = findNodesByType(child, 'export_specifier');
        for (const spec of specifiers) {
          const name = findFirstIdentifier(spec);
          if (name) exports.add(name);
        }
      }
    }
  }
  return exports;
}

/**
 * Extract imports/dependencies from a TypeScript AST
 * @param {Parser.Tree} tree
 * @returns {Array<{ source: string, symbols: string[] }>}
 */
export function extractDependencies(tree) {
  const dependencies = [];
  
  const importStatements = findNodesByType(tree.rootNode, 'import_statement');
  const exportStatementsWithSource = findNodesByType(tree.rootNode, 'export_statement')
    .filter(node => findNodesByType(node, 'string').length > 0);
    
  const dependencyNodes = [...importStatements, ...exportStatementsWithSource];
  
  for (const depNode of dependencyNodes) {
    const stringNodes = findNodesByType(depNode, 'string');
    if (stringNodes.length === 0) continue;
    
    // Strip quotes
    const importSource = stringNodes[0].text.slice(1, -1);
    
    const specifierType = depNode.type === 'import_statement' ? 'import_specifier' : 'export_specifier';
    const specifiers = findNodesByType(depNode, specifierType);
    const importedSymbols = specifiers.map(spec => findFirstIdentifier(spec)).filter(Boolean);
    
    // Check for requireNativeModule / requireNativeViewManager references to map Expo Module dependencies
    dependencies.push({
      source: importSource,
      symbols: importedSymbols
    });
  }

  // Look for Expo Native Module calls: requireNativeModule('...') or requireNativeViewManager('...')
  const callExpressions = findNodesByType(tree.rootNode, 'call_expression');
  for (const call of callExpressions) {
    const fnNameNode = call.child(0);
    if (fnNameNode && (fnNameNode.text === 'requireNativeModule' || fnNameNode.text === 'requireNativeViewManager')) {
      const argumentsNode = call.child(1);
      if (argumentsNode && argumentsNode.type === 'arguments') {
        const stringArgNode = findNodesByType(argumentsNode, 'string')[0];
        if (stringArgNode) {
          const moduleName = stringArgNode.text.slice(1, -1);
          dependencies.push({
            source: `expo-module:${moduleName}`,
            symbols: [],
            isExpoModule: true
          });
        }
      }
    }
  }
  
  return dependencies;
}

/**
 * Resolves a TypeScript import source to an absolute file path
 * @param {string} currentFilePath
 * @param {string} importPath
 * @returns {string|null}
 */
export function resolve(currentFilePath, importPath) {
  const currentFileDir = path.dirname(currentFilePath);

  // 1. Resolve TSConfig path aliases (FSD path mappings)
  const isWeb = currentFilePath.includes('apps/web') || currentFilePath.includes('apps\\web');
  const match = isWeb ? webMatchPath : mobileMatchPath;
  const resolvedAlias = match(importPath, undefined, undefined, ['.ts', '.tsx', '.js', '.jsx']);
  if (resolvedAlias) {
    return ensureFileExtension(resolvedAlias);
  }

  // 2. Resolve relative imports
  if (importPath.startsWith('.')) {
    const resolvedRelative = path.resolve(currentFileDir, importPath);
    return ensureFileExtension(resolvedRelative);
  }

  return null;
}
