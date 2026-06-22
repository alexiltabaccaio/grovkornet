const { loadYamlConfig } = require('./config-loader');

function validateAndLoadParameters(configPath) {
  console.log(`Loading parameters from: ${configPath}`);
  const data = loadYamlConfig(configPath);
  
  if (!data.parameters || !Array.isArray(data.parameters)) {
    throw new Error("Invalid schema: 'parameters' array is required.");
  }
  
  const parameters = data.parameters;
  console.log(`Successfully loaded ${parameters.length} parameters.`);
  
  // Filter parameters with arrayIndex
  const renderParams = parameters
    .filter(p => p.arrayIndex !== undefined && p.arrayIndex !== null)
    .sort((a, b) => a.arrayIndex - b.arrayIndex);
  
  console.log(`Found ${renderParams.length} render parameters mapped to C++/Kotlin array.`);
  
  // Check for duplicate indices
  const indicesSeen = new Map();
  for (const param of renderParams) {
    const idx = param.arrayIndex;
    if (indicesSeen.has(idx)) {
      throw new Error(`ValidationError: Duplicate render parameter index ${idx} found on parameters '${indicesSeen.get(idx)}' and '${param.name}'.`);
    }
    indicesSeen.set(idx, param.name);
  }
  
  // Verify sequence from 0 to maxIndex consecutively
  if (renderParams.length > 0) {
    const maxIndex = renderParams[renderParams.length - 1].arrayIndex;
    const expectedCount = maxIndex + 1;
    
    console.log(`Max index found: ${maxIndex} (expected array size: ${expectedCount})`);
    
    if (renderParams.length !== expectedCount) {
      const missing = [];
      for (let i = 0; i <= maxIndex; i++) {
        if (!indicesSeen.has(i)) {
          missing.push(i);
        }
      }
      throw new Error(`ValidationError: Render parameter indices are not contiguous. Missing indices: [${missing.join(', ')}]. Total mapped parameters: ${renderParams.length}, expected: ${expectedCount}.`);
    }
  }
  
  console.log("Validation Successful! All render parameter indices are sequential with no gaps or duplicates.");

  // Validate that all defaults defined as DEFAULT_ in JSON/YAML exist in the constants section
  const constants = data.constants || {};
  parameters.forEach(p => {
    if (p.includeInPreset === undefined || typeof p.includeInPreset !== 'boolean') {
      throw new Error(`ValidationError: Parameter '${p.name}' must explicitly define 'includeInPreset' as a boolean (true or false).`);
    }

    if (p.zustand && p.zustand.default && p.zustand.default.startsWith('DEFAULT_')) {
      const def = p.zustand.default;
      if (!(def in constants)) {
        throw new Error(`ValidationError: Parameter '${p.name}' references default constant '${def}' but it is not defined in the 'constants' section of configuration`);
      }
    }
    
    if (p.zustand && p.zustand.setSideEffects) {
      p.zustand.setSideEffects.forEach(se => {
        if (se.value && se.value.startsWith('DEFAULT_')) {
          if (!(se.value in constants)) {
            throw new Error(`ValidationError: Side effect on parameter '${p.name}' targets '${se.target}' with value '${se.value}' but it is not defined in the 'constants' section of configuration`);
          }
        }
      });
    }
  });
  console.log("Validation of DEFAULT_ constants in YAML completed successfully.");

  // Verify side effect targets exist as parameter names in the same store
  const validParamNames = new Set(parameters.map(p => p.zustand?.name || p.name));
  validParamNames.add('evAuto'); // Manually added store property in useBodyStore.ts
  parameters.forEach(p => {
    if (p.zustand && p.zustand.setSideEffects) {
      p.zustand.setSideEffects.forEach(se => {
        const targetStore = se.store || p.zustand.store || 'film';
        const currentStore = p.zustand.store || 'film';
        if (targetStore === currentStore) {
          if (!validParamNames.has(se.target)) {
            throw new Error(`ValidationError: Side effect on parameter '${p.name}' targets non-existent parameter '${se.target}' in store '${currentStore}'`);
          }
        }
      });
    }
  });
  console.log("Validation of side effect targets completed successfully.");

  return { parameters, renderParams, data };
}

module.exports = {
  validateAndLoadParameters
};
