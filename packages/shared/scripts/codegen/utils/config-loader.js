const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const PROJECT_ROOT = path.resolve(__dirname, '../../../../../');

function loadYamlConfig(relativeFilePath) {
  const absolutePath = path.resolve(PROJECT_ROOT, relativeFilePath);
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
