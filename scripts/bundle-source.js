const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'grovkornet_source_bundle.txt');

// Configurazione
const INCLUDED_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.kt', '.java', '.cpp', '.h', '.hpp', '.css'
]);

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  '.expo',
  '.turbo',
  'coverage',
  '.cache',
  '.cxx',
  'filament-host'
]);

// Esclusioni specifiche di percorsi relativi (es. percorsi autogenerati)
const EXCLUDED_RELATIVE_PATHS = [
  path.join('apps', 'mobile', 'android'),
  path.join('apps', 'mobile', 'ios')
];

function shouldExclude(dirPath) {
  const relativePath = path.relative(ROOT_DIR, dirPath);
  
  // Controlla se contiene una cartella esclusa nei segmenti del percorso
  const segments = relativePath.split(path.sep);
  if (segments.some(seg => EXCLUDED_DIRS.has(seg))) {
    return true;
  }
  
  // Controlla percorsi relativi specifici
  if (EXCLUDED_RELATIVE_PATHS.some(p => relativePath.startsWith(p) || relativePath === p)) {
    return true;
  }
  
  return false;
}

function walk(dir, fileList = []) {
  if (shouldExclude(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walk(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (INCLUDED_EXTENSIONS.has(ext)) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

function main() {
  console.log('Avvio scansione codice sorgente custom...');
  const files = walk(ROOT_DIR);
  console.log(`Trovati ${files.length} file corrispondenti.`);

  let outputContent = '';
  let processedCount = 0;

  for (const file of files) {
    const relativePath = path.relative(ROOT_DIR, file);
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      outputContent += '='.repeat(80) + '\n';
      outputContent += `File: ${relativePath}\n`;
      outputContent += '='.repeat(80) + '\n\n';
      outputContent += content;
      outputContent += '\n\n';
      
      processedCount++;
    } catch (err) {
      console.error(`Errore durante la lettura di ${relativePath}:`, err.message);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, outputContent, 'utf8');
  const stats = fs.statSync(OUTPUT_FILE);
  const sizeInMb = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('\n--- BUNDLE COMPLETATO ---');
  console.log(`File scritti con successo: ${processedCount}/${files.length}`);
  console.log(`Output: ${OUTPUT_FILE}`);
  console.log(`Dimensione: ${sizeInMb} MB`);
}

main();
