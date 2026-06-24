const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

// Detect if we are running inside a Stryker sandbox
const isStryker = __dirname.includes('.stryker-tmp');

// Find the project root by searching upwards for the root package.json
let currentDir = __dirname;
let projectRoot = path.resolve(__dirname, '../../../../../'); // fallback
let isSandboxRoot = false;

while (currentDir && currentDir !== path.dirname(currentDir)) {
  const pkgPath = path.join(currentDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (isStryker && pkg.name === '@grovkornet/shared') {
        projectRoot = currentDir;
        isSandboxRoot = true;
        break;
      }
      if (pkg.name === 'grovkornet-monorepo') {
        projectRoot = currentDir;
        break;
      }
    } catch (e) {
      // ignore
    }
  }
  currentDir = path.dirname(currentDir);
}

const PROJECT_ROOT = projectRoot;

function loadYamlConfig(relativeFilePath) {
  let resolvedPath = relativeFilePath;
  if (isStryker && isSandboxRoot && relativeFilePath.startsWith('packages/shared/')) {
    // In Stryker sandbox, packages/shared files are located at the root of the sandbox
    resolvedPath = relativeFilePath.substring('packages/shared/'.length);
  }
  
  const absolutePath = path.resolve(PROJECT_ROOT, resolvedPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Config file or directory not found at ${absolutePath}`);
  }
  
  const stats = fs.statSync(absolutePath);
  if (stats.isDirectory()) {
    const files = fs.readdirSync(absolutePath).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    const merged = { constants: {}, parameters: [] };
    
    // Sort files to guarantee deterministic order of parameters
    files.sort();
    
    for (const file of files) {
      const filePath = path.join(absolutePath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      try {
        const parsed = YAML.parse(content);
        if (parsed) {
          if (parsed.constants) {
            Object.assign(merged.constants, parsed.constants);
          }
          if (parsed.parameters) {
            if (Array.isArray(parsed.parameters)) {
              merged.parameters.push(...parsed.parameters);
            } else {
              throw new Error(`'parameters' in ${file} must be an array.`);
            }
          }
        }
      } catch (err) {
        throw new Error(`Failed to parse YAML file ${file}: ${err.message}`);
      }
    }
    return merged;
  } else {
    const content = fs.readFileSync(absolutePath, 'utf8');
    try {
      return YAML.parse(content);
    } catch (err) {
      throw new Error(`Failed to parse YAML file ${relativeFilePath}: ${err.message}`);
    }
  }
}

module.exports = {
  loadYamlConfig,
  PROJECT_ROOT
};
