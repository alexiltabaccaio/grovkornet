const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const PROJECT_ROOT = path.resolve(__dirname, '../../../../../');

function loadYamlConfig(relativeFilePath) {
  const absolutePath = path.resolve(PROJECT_ROOT, relativeFilePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Config file not found at ${absolutePath}`);
  }
  
  const content = fs.readFileSync(absolutePath, 'utf8');
  try {
    return YAML.parse(content);
  } catch (err) {
    throw new Error(`Failed to parse YAML file ${relativeFilePath}: ${err.message}`);
  }
}

module.exports = {
  loadYamlConfig,
  PROJECT_ROOT
};
