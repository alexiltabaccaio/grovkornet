import path from 'path';
import fs from 'fs';

/**
 * Extracts exported shader name from a Filament .mat file
 * @param {{ isMat: boolean, text: string }} tree
 * @returns {Set<string>} Set of exported symbols
 */
export function extractDefinitions(tree) {
  const exports = new Set();
  if (tree && tree.text) {
    const match = tree.text.match(/name\s*:\s*"([^"]+)"/);
    if (match) {
      exports.add(`filament-shader:${match[1]}`);
    }
  }
  return exports;
}

/**
 * Extracts dependencies from a Filament .mat file
 * @param {{ isMat: boolean, text: string }} tree
 * @returns {Array}
 */
export function extractDependencies(tree) {
  return [];
}

/**
 * Resolves a Filament import
 */
export function resolve(currentFilePath, importPath) {
  return null;
}
