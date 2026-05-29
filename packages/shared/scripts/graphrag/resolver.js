import { createMatchPath, loadConfig } from 'tsconfig-paths';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carica il file tsconfig.json dell'app mobile per mappare gli alias FSD
const tsconfigPath = path.resolve(__dirname, '../../../../apps/mobile/tsconfig.json');
const configLoaderResult = loadConfig(tsconfigPath);

let matchPath = () => null;
if (configLoaderResult.resultType === 'success') {
  matchPath = createMatchPath(
    configLoaderResult.absoluteBaseUrl,
    configLoaderResult.paths
  );
} else {
  console.warn("⚠️ Impossibile caricare tsconfig.json di apps/mobile. Gli alias FSD potrebbero non funzionare.");
}

/**
 * Risolve la stringa di import in un percorso di file assoluto
 * @param {string} currentFilePath - Percorso assoluto del file corrente
 * @param {string} importPath - Stringa dell'import (es. './utils' o '@features/camera')
 * @returns {string|null} Percorso assoluto risolto, o null se non risolvibile
 */
export function resolveImport(currentFilePath, importPath) {
  const currentFileDir = path.dirname(currentFilePath);

  // 1. Prova a risolverlo usando gli alias di tsconfig
  const resolvedAlias = matchPath(importPath, undefined, undefined, ['.ts', '.tsx', '.js', '.jsx']);
  if (resolvedAlias) {
    return ensureFileExtension(resolvedAlias);
  }

  // 2. Altrimenti gestisci come percorso relativo
  if (importPath.startsWith('.')) {
    const resolvedRelative = path.resolve(currentFileDir, importPath);
    return ensureFileExtension(resolvedRelative);
  }

  return null; // Probabile libreria esterna (es. 'react')
}

/**
 * Controlla se il percorso necessita di estensione o se punta a una cartella con index.ts/tsx
 */
function ensureFileExtension(basePath) {
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
    return basePath;
  }

  // Cerca con estensioni file
  for (const ext of extensions) {
    const fileWithExt = basePath + ext;
    if (fs.existsSync(fileWithExt) && fs.statSync(fileWithExt).isFile()) {
      return fileWithExt;
    }
  }

  // Cerca cartella index.ts/tsx
  for (const ext of extensions) {
    const indexWithExt = path.join(basePath, 'index' + ext);
    if (fs.existsSync(indexWithExt) && fs.statSync(indexWithExt).isFile()) {
      return indexWithExt;
    }
  }

  return null;
}
