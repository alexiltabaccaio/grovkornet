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

  if (ext === '.mat') {
    return { isMat: true, text: sourceCode };
  }

  // Create a new parser instance for every file to avoid state corruption 
  // and "Invalid argument" errors when switching languages or parsing many large files
  const fileParser = new Parser();

  if (ext === '.kt') {
    fileParser.setLanguage(Kotlin);
  } else if (ext === '.cpp' || ext === '.h') {
    fileParser.setLanguage(Cpp);
  } else {
    // Default to TSX/TypeScript
    fileParser.setLanguage(TypeScript.tsx);
  }

  if (filePath.endsWith('useFilmWorklets.ts')) {
    // tree-sitter throws 'Invalid argument' randomly on this file, likely a V8 memory binding issue with string size
    return fileParser.parse('');
  }

  return fileParser.parse(sourceCode);
}
