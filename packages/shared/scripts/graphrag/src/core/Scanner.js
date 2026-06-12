import fs from 'fs';
import path from 'path';

/**
 * Scans a directory recursively searching for source files (.ts, .tsx, .kt, .cpp, .h, .mat)
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
