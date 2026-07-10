import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory for Kotlin source files in packages/engine
const kotlinBaseDir = path.resolve(__dirname, '../../../../../engine/android/src/main/java');

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
 * Gets the package name declared in a Kotlin file
 */
function getPackageName(tree) {
  const packageHeader = findNodesByType(tree.rootNode, 'package_header')[0];
  if (packageHeader) {
    const identifierNode = packageHeader.children.find(c => c.type === 'identifier');
    if (identifierNode) {
      return identifierNode.text;
    }
  }
  return '';
}

/**
 * Traverses up the AST tree from a node to find the name of the enclosing class or object
 */
function getEnclosingClassName(node) {
  let parent = node.parent;
  while (parent) {
    if (parent.type === 'class_declaration' || parent.type === 'object_declaration') {
      const typeIdNode = parent.children.find(c => c.type === 'type_identifier');
      if (typeIdNode) return typeIdNode.text;
    }
    parent = parent.parent;
  }
  return null;
}

/**
 * Extracts exported definitions (classes, objects, Expo modules, JNI entry points) from a Kotlin AST
 * @param {Parser.Tree} tree
 * @returns {Set<string>} Set of fully qualified symbols
 */
export function extractDefinitions(tree) {
  const exports = new Set();
  const packageName = getPackageName(tree);
  if (!packageName) return exports;

  // 1. Find all class, interface, and object declarations
  const classDeclarations = findNodesByType(tree.rootNode, 'class_declaration');
  const objectDeclarations = findNodesByType(tree.rootNode, 'object_declaration');
  const declarations = [...classDeclarations, ...objectDeclarations];

  const classNames = [];
  for (const decl of declarations) {
    const typeIdNode = decl.children.find(c => c.type === 'type_identifier');
    if (typeIdNode) {
      const className = typeIdNode.text;
      classNames.push(className);
      // Fully qualified Kotlin symbol
      exports.add(`${packageName}.${className}`);
    }
  }

  // 2. Identify Expo Native Module registration
  // Look for `class NativeFilmCameraModule : Module()` and its `Name("NativeFilmCamera")` in definition()
  const classDecls = findNodesByType(tree.rootNode, 'class_declaration');
  for (const decl of classDecls) {
    const classIdNode = decl.children.find(c => c.type === 'type_identifier');
    if (classIdNode) {
      const body = decl.children.find(c => c.type === 'class_body');
      if (body) {
        // Look for Name("ModuleName") calls
        const nameCalls = findNodesByType(body, 'call_expression');
        for (const call of nameCalls) {
          const fnNode = call.child(0);
          if (fnNode && fnNode.text === 'Name') {
            const suffix = call.child(1);
            if (suffix && suffix.type === 'call_suffix') {
              const args = suffix.child(0);
              if (args && args.type === 'value_arguments') {
                const stringArg = findNodesByType(args, 'line_string_literal')[0] || 
                                  findNodesByType(args, 'string')[0] || 
                                  findNodesByType(args, 'value_argument')[0];
                if (stringArg) {
                  // Strip quotes (Kotlin string literal might include outer template syntax, but we just want standard text)
                  const moduleName = stringArg.text.replace(/['"]/g, '');
                  exports.add(`expo-module:${moduleName}`);
                }
              }
            }
          }
        }
      }
    }
  }

  return exports;
}

/**
 * Extracts imports/dependencies from a Kotlin AST, including JNI dependencies
 * @param {Parser.Tree} tree
 * @returns {Array<{ source: string, symbols: string[], isJni?: boolean }>}
 */
export function extractDependencies(tree) {
  const dependencies = [];
  const packageName = getPackageName(tree);
  if (!packageName) return dependencies;

  // 1. Extract explicit imports matching our project namespace
  const importHeaders = findNodesByType(tree.rootNode, 'import_header');
  for (const header of importHeaders) {
    const identifierNode = header.children.find(c => c.type === 'identifier');
    if (identifierNode) {
      const importPath = identifierNode.text;
      // Only trace our own internal codebase imports
      if (importPath.startsWith('com.grovkornet.nativefilmcamera')) {
        dependencies.push({
          source: importPath,
          symbols: []
        });
      }
    }
  }

  // 2. Extract JNI (external) function declarations
  const functions = findNodesByType(tree.rootNode, 'function_declaration');
  for (const fn of functions) {
    const modifiers = fn.children.find(c => c.type === 'modifiers');
    if (modifiers) {
      const hasExternal = modifiers.children.some(c => c.text === 'external');
      if (hasExternal) {
        const fnNameNode = fn.children.find(c => c.type === 'simple_identifier');
        if (fnNameNode) {
          const fnName = fnNameNode.text;
          const className = getEnclosingClassName(fn) || 'PackageLevel';
          // Format JNI dependency: jni:com.grovkornet.nativefilmcamera.ClassName.methodName
          dependencies.push({
            source: `jni:${packageName}.${className}.${fnName}`,
            symbols: [],
            isJni: true
          });
        }
      }
    }
  }

  return dependencies;
}

/**
 * Resolves a Kotlin import path to an absolute file path
 * @param {string} currentFilePath
 * @param {string} importPath
 * @returns {string|null}
 */
export function resolve(currentFilePath, importPath) {
  // Map com.grovkornet.nativefilmcamera.ui.NativeFilmCameraView -> com/grovkornet/nativefilmcamera/ui/NativeFilmCameraView.kt
  if (importPath.startsWith('com.grovkornet.nativefilmcamera')) {
    const relativePath = importPath.replace(/\./g, '/') + '.kt';
    const absolutePath = path.resolve(kotlinBaseDir, relativePath);
    if (fs.existsSync(absolutePath)) {
      return absolutePath;
    }
  }
  return null;
}

/**
 * Fallback parser using regex to extract exported Kotlin classes and Expo modules
 * @param {string} sourceCode 
 * @returns {Set<string>}
 */
export function extractDefinitionsFallback(sourceCode) {
  const exports = new Set();
  const pkgMatch = sourceCode.match(/package\s+([a-zA-Z0-9_.]+)/);
  if (!pkgMatch) return exports;
  const packageName = pkgMatch[1];

  const classRegex = /(?:class|object)\s+([a-zA-Z0-9_]+)/g;
  let match;
  while ((match = classRegex.exec(sourceCode)) !== null) {
    exports.add(`${packageName}.${match[1]}`);
  }

  const expoModuleRegex = /Name\(\s*["']([^"']+)["']\s*\)/g;
  while ((match = expoModuleRegex.exec(sourceCode)) !== null) {
    exports.add(`expo-module:${match[1]}`);
  }

  return exports;
}

/**
 * Fallback parser using regex to extract Kotlin imports and JNI external declarations
 * @param {string} sourceCode 
 * @returns {Array<{ source: string, symbols: string[] }>}
 */
export function extractDependenciesFallback(sourceCode) {
  const dependencies = [];
  const pkgMatch = sourceCode.match(/package\s+([a-zA-Z0-9_.]+)/);
  const packageName = pkgMatch ? pkgMatch[1] : '';

  const importRegex = /import\s+(com\.grovkornet\.nativefilmcamera\.[a-zA-Z0-9_.]+)/g;
  let match;
  while ((match = importRegex.exec(sourceCode)) !== null) {
    dependencies.push({
      source: match[1],
      symbols: []
    });
  }

  const classMatch = sourceCode.match(/class\s+([a-zA-Z0-9_]+)/);
  const className = classMatch ? classMatch[1] : 'PackageLevel';

  const externalFunRegex = /external\s+fun\s+([a-zA-Z0-9_]+)/g;
  while ((match = externalFunRegex.exec(sourceCode)) !== null) {
    if (packageName) {
      dependencies.push({
        source: `jni:${packageName}.${className}.${match[1]}`,
        symbols: [],
        isJni: true
      });
    }
  }

  return dependencies;
}

