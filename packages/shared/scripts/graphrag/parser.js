import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
import Kotlin from 'tree-sitter-kotlin';
import Cpp from 'tree-sitter-cpp';
import fs from 'fs';
import path from 'path';

const parser = new Parser();

/**
 * Reads a file and returns its AST (Abstract Syntax Tree) using Tree-sitter
 * @param {string} filePath 
 * @returns {Parser.Tree}
 */
export function parseFile(filePath) {
  const ext = path.extname(filePath);
  const sourceCode = fs.readFileSync(filePath, 'utf8');

  if (ext === '.kt') {
    parser.setLanguage(Kotlin);
  } else if (ext === '.cpp' || ext === '.h') {
    parser.setLanguage(Cpp);
  } else if (ext === '.mat') {
    return { isMat: true, text: sourceCode };
  } else {
    // Default to TSX/TypeScript
    parser.setLanguage(TypeScript.tsx);
  }

  return parser.parse(sourceCode);
}

/**
 * Scans a directory recursively searching for source files (.ts, .tsx, .kt, .cpp, .h)
 * @param {string} dirPath - The directory path
 * @returns {string[]} List of absolute paths of found files
 */
export function scanDirectory(dirPath) {
  let results = [];
  
  if (!fs.existsSync(dirPath)) {
    return results;
  }

  const list = fs.readdirSync(dirPath);
  
  for (const file of list) {
    const filePath = path.resolve(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Ignore build, output, and system test directories
      if (file !== 'node_modules' && file !== 'dist' && file !== 'build' && file !== 'test' && file !== '__tests__') {
        results = results.concat(scanDirectory(filePath));
      }
    } else {
      const ext = path.extname(filePath);
      if (
        (ext === '.ts' || ext === '.tsx' || ext === '.kt' || ext === '.cpp' || ext === '.h' || ext === '.mat') && 
        !filePath.endsWith('.d.ts')
      ) {
        results.push(filePath);
      }
    }
  }
  
  return results;
}
