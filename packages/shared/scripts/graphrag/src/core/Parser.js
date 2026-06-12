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
 * @returns {Parser.Tree|{isMat: boolean, text: string}}
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
