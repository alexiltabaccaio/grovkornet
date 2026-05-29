import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
import fs from 'fs';
import path from 'path';

const parser = new Parser();
// tree-sitter-typescript exports .tsx and .typescript grammars
parser.setLanguage(TypeScript.tsx);

/**
 * Legge un file e restituisce l'albero sintattico (AST) generato da Tree-sitter
 * @param {string} filePath 
 * @returns {Parser.Tree}
 */
export function parseFile(filePath) {
  const sourceCode = fs.readFileSync(filePath, 'utf8');
  return parser.parse(sourceCode);
}

/**
 * Scansiona ricorsivamente una directory alla ricerca di file .ts e .tsx
 * @param {string} dirPath - Il percorso della directory
 * @returns {string[]} Lista di percorsi assoluti dei file trovati
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
      // Ignoriamo le cartelle di build e test di sistema
      if (file !== 'node_modules' && file !== 'dist' && file !== 'build' && file !== 'test' && file !== '__tests__') {
        results = results.concat(scanDirectory(filePath));
      }
    } else {
      const ext = path.extname(filePath);
      if ((ext === '.ts' || ext === '.tsx') && !filePath.endsWith('.d.ts')) {
        results.push(filePath);
      }
    }
  }
  
  return results;
}
