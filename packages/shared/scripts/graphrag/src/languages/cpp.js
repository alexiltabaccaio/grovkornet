import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory for C++ source files in packages/engine
const cppBaseDir = path.resolve(__dirname, '../../../../../engine/android/src/main/cpp');

// C++ compiler include directories
const includePaths = [
  cppBaseDir,
  path.join(cppBaseDir, 'core'),
  path.join(cppBaseDir, 'pipeline'),
  path.join(cppBaseDir, 'utils'),
  path.join(cppBaseDir, 'jni')
];

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
 * Reconstructs the virtual JNI symbol from JNI C++ function name
 * Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativePrepare 
 * -> jni:com.grovkornet.nativefilmcamera.rendering.OffscreenFilmProcessor.nativePrepare
 */
function jniToSymbol(jniName) {
  const clean = jniName.replace(/^Java_/, '');
  const parts = clean.split('_');
  // Find first part starting with a capital letter (the class name)
  const classIdx = parts.findIndex(p => p[0] && p[0] === p[0].toUpperCase());
  if (classIdx !== -1) {
    const pkg = parts.slice(0, classIdx).join('.');
    const className = parts[classIdx];
    const method = parts.slice(classIdx + 1).join('_');
    return `jni:${pkg}.${className}.${method}`;
  }
  // Fallback
  const method = parts.pop();
  const pkgClass = parts.join('.');
  return `jni:${pkgClass}.${method}`;
}

/**
 * Extracts exported JNI symbols from a C++ AST
 * @param {Parser.Tree} tree
 * @returns {Set<string>} Set of JNI virtual symbols exported
 */
export function extractDefinitions(tree) {
  const exports = new Set();
  const fnDefs = findNodesByType(tree.rootNode, 'function_definition');
  
  for (const fn of fnDefs) {
    // Find all identifiers inside the function definition and look for one starting with 'Java_'
    const identifiers = findNodesByType(fn, 'identifier');
    const jniIdentifier = identifiers.map(id => id.text).find(text => text.startsWith('Java_'));
    if (jniIdentifier) {
      const virtualSymbol = jniToSymbol(jniIdentifier);
      exports.add(virtualSymbol);
    }
  }

  return exports;
}

/**
 * Extracts preprocessor includes from a C++ AST
 * @param {Parser.Tree} tree
 * @returns {Array<{ source: string, symbols: string[] }>}
 */
export function extractDependencies(tree) {
  const dependencies = [];
  const includes = findNodesByType(tree.rootNode, 'preproc_include');
  
  for (const inc of includes) {
    // preproc_include has a path field containing string_literal or system_lib_string
    const pathNode = inc.children.find(c => c.type === 'string_literal' || c.type === 'system_lib_string');
    if (pathNode) {
      // If it is a system library include like <vector>, ignore it or mark it as system
      if (pathNode.type === 'system_lib_string') {
        continue;
      }
      
      // Strip outer quotes
      const includeSource = pathNode.text.slice(1, -1);
      dependencies.push({
        source: includeSource,
        symbols: []
      });
    }
  }

  // Look for references to Filament Shaders in string literals
  const stringLiterals = findNodesByType(tree.rootNode, 'string_literal');
  for (const strNode of stringLiterals) {
    const text = strNode.text.slice(1, -1); // strip quotes
    if (text.endsWith('Shader') || text.startsWith('FilmShader')) {
      // Exclude strings with spaces, slashes or special characters (likely logs or paths)
      if (!/\s|\/|\\|!/.test(text)) {
        dependencies.push({
          source: `filament-shader:${text}`,
          symbols: [],
          isFilamentShader: true
        });
      }
    }
  }

  return dependencies;
}

/**
 * Resolves a C++ include path to an absolute file path
 * @param {string} currentFilePath
 * @param {string} importPath
 * @returns {string|null}
 */
export function resolve(currentFilePath, importPath) {
  const currentFileDir = path.dirname(currentFilePath);

  // 1. Resolve relative to the current file directory
  const relativePath = path.resolve(currentFileDir, importPath);
  if (fs.existsSync(relativePath) && fs.statSync(relativePath).isFile()) {
    return relativePath;
  }

  // 2. Resolve relative to include paths (mimicking -I compiler flags)
  for (const searchPath of includePaths) {
    const resolvedPath = path.resolve(searchPath, importPath);
    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
      return resolvedPath;
    }
  }

  return null;
}
