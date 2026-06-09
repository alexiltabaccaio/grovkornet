const { FILE_PATHS, replaceBetweenMarkers } = require('../utils/helpers');

function generateZustandTypesForStore(parameters, storeName, filePath) {
  console.log(`Generating types for store: ${storeName}`);
  const storeParams = parameters.filter(p => p.zustand && (p.zustand.store || 'film') === storeName);
  
  // 1. Generate state fields
  const stateContent = storeParams
    .map(p => {
      const name = p.zustand.name || p.name;
      const type = p.zustand.type || (p.ts?.type === 'boolean' ? 'boolean' : 'number');
      if (type === 'string') {
        return `${name}: ${type};`;
      }
      return `${name}: SharedValue<${type}>;`;
    })
    .join('\n');
  replaceBetweenMarkers(filePath, '  // @@GEN_STATE_START@@', '  // @@GEN_STATE_END@@', stateContent, '  ');
  
  // 2. Generate actions setters
  const actionsContent = storeParams
    .map(p => {
      const name = p.zustand.name || p.name;
      const type = p.zustand.type || (p.ts?.type === 'boolean' ? 'boolean' : 'number');
      const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
      const argName = name === 'noiseReductionMode' ? 'mode' : 'value';
      return `set${capitalized}: (${argName}: ${type}) => void;`;
    })
    .join('\n');
  replaceBetweenMarkers(filePath, '  // @@GEN_ACTIONS_START@@', '  // @@GEN_ACTIONS_END@@', actionsContent, '  ');
}

function generateZustandTypes(parameters) {
  console.log('\n--- Generating Zustand Types (Step 3) ---');
  generateZustandTypesForStore(parameters, 'film', FILE_PATHS.zustandTypes);
  generateZustandTypesForStore(parameters, 'body', FILE_PATHS.bodyTypes);
  generateZustandTypesForStore(parameters, 'lens', FILE_PATHS.lensTypes);
}

function isSharedValue(parameters, paramName) {
  const p = parameters.find(x => (x.zustand?.name || x.name) === paramName);
  if (!p) return true;
  return p.zustand?.type !== 'string';
}

function generateZustandStoreForStore(parameters, storeName, filePath, initMarkerStart = '  // @@GEN_INIT_START@@', initMarkerEnd = '  // @@GEN_INIT_END@@') {
  console.log(`Generating store implementation for: ${storeName}`);
  const storeParams = parameters.filter(p => p.zustand && (p.zustand.store || 'film') === storeName);
  
  // 1. Generate state initializers
  const initContent = storeParams
    .map(p => {
      const name = p.zustand.name || p.name;
      const def = p.zustand.default;
      const type = p.zustand.type || (p.ts?.type === 'boolean' ? 'boolean' : 'number');
      if (type === 'string') {
        return `${name}: ${def},`;
      }
      return `${name}: makeMutable(${def}),`;
    })
    .join('\n');
  replaceBetweenMarkers(filePath, initMarkerStart, initMarkerEnd, initContent, '  ');
  
  // 2. Generate setters
  const settersContent = storeParams
    .map(p => {
      const name = p.zustand.name || p.name;
      const type = p.zustand.type || (p.ts?.type === 'boolean' ? 'boolean' : 'number');
      const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
      const argName = name === 'noiseReductionMode' ? 'mode' : 'value';
      
      const needsLogger = ['saturation', 'contrast', 'grainIntensity', 'chromaticAberration', 'sharpening', 'bloomIntensity', 'temperature', 'tint', 'iso', 'ev', 'shutterSpeed', 'focusDistance'].includes(name);
      const storeLabel = storeName.charAt(0).toUpperCase() + storeName.slice(1) + 'Store';
      const loggerLine = needsLogger ? `logger.debug('${storeLabel}', \`Setting ${capitalized.replace(/([A-Z])/g, ' $1').trim()}: \${${argName}}\`);` : '';
      
      let body = '';
      if (p.zustand.setSideEffects && p.zustand.setSideEffects.length > 0) {
        const localTargets = p.zustand.setSideEffects
          .filter(se => !se.store || se.store === storeName)
          .map(se => se.target);
        const allVars = [name, ...localTargets].filter(v => isSharedValue(parameters, v));
        
        if (allVars.length > 0) {
          body += `const { ${allVars.join(', ')} } = get();\n`;
        }
        if (loggerLine) body += `${loggerLine}\n`;
        
        if (isSharedValue(parameters, name)) {
          body += `${name}.value = ${argName};\n`;
        } else {
          body += `set({ ${name}: ${argName} });\n`;
        }
        if (p.nitro) {
          body += `getNitroConfig().${p.name} = ${argName};\n`;
        }
        
        const conditionalEffects = p.zustand.setSideEffects.filter(se => se.condition);
        const directEffects = p.zustand.setSideEffects.filter(se => !se.condition);
        
        for (const se of directEffects) {
          if (se.store === 'preferences') {
            body += `usePreferencesStore.getState().${se.target}(${se.value});\n`;
          } else {
            if (isSharedValue(parameters, se.target)) {
              body += `${se.target}.value = ${se.value};\n`;
            } else {
              body += `set({ ${se.target}: ${se.value} });\n`;
            }
            const targetParam = parameters.find(pr => pr.name === se.target || (pr.zustand && pr.zustand.name === se.target));
            if (targetParam && targetParam.nitro) {
              body += `getNitroConfig().${targetParam.name} = ${se.value};\n`;
            }
          }
        }
        
        if (conditionalEffects.length > 0) {
          const conditions = [...new Set(conditionalEffects.map(se => se.condition))];
          for (const cond of conditions) {
            const effectsForCond = conditionalEffects.filter(se => se.condition === cond);
            body += `if (${cond}) {\n  ` + effectsForCond.map(se => {
              if (se.store === 'preferences') {
                return `usePreferencesStore.getState().${se.target}(${se.value});`;
              } else {
                let effectStr = '';
                if (isSharedValue(parameters, se.target)) {
                  effectStr = `${se.target}.value = ${se.value};`;
                } else {
                  effectStr = `set({ ${se.target}: ${se.value} });`;
                }
                const targetParam = parameters.find(pr => pr.name === se.target || (pr.zustand && pr.zustand.name === se.target));
                if (targetParam && targetParam.nitro) {
                  effectStr += `\n  getNitroConfig().${targetParam.name} = ${se.value};`;
                }
                return effectStr;
              }
            }).join('\n  ') + '\n}\n';
          }
        }
      } else {
        if (loggerLine) {
          body += `${loggerLine}\n`;
        }
        if (isSharedValue(parameters, name)) {
          body += `get().${name}.value = ${argName};`;
        } else {
          body += `set({ ${name}: ${argName} });`;
        }
        if (p.nitro) {
          body += `\ngetNitroConfig().${p.name} = ${argName};`;
        }
      }
      
      return `set${capitalized}: (${argName}) => {\n  ${body.split('\n').join('\n  ')}\n},`;
    })
    .join('\n');
  replaceBetweenMarkers(filePath, '  // @@GEN_SETTERS_START@@', '  // @@GEN_SETTERS_END@@', settersContent, '  ');
}

function generateZustandStore(parameters) {
  console.log('\n--- Generating Zustand Store (Step 4) ---');
  // 1. Generate Film Store
  generateZustandStoreForStore(parameters, 'film', FILE_PATHS.zustandStore, '  // @@GEN_INIT_START@@', '  // @@GEN_INIT_END@@');
  
  // 2. Generate Body Store
  generateZustandStoreForStore(parameters, 'body', FILE_PATHS.bodyStore, '  // @@GEN_STATE_START@@', '  // @@GEN_STATE_END@@');
  
  // 3. Generate Lens Store
  generateZustandStoreForStore(parameters, 'lens', FILE_PATHS.lensStore, '  // @@GEN_STATE_START@@', '  // @@GEN_STATE_END@@');

  // 4. Generate Reset Cases specifically for Film Store
  const filmParams = parameters.filter(p => p.zustand && (p.zustand.store || 'film') === 'film');
  const groups = {};
  for (const p of filmParams) {
    if (p.zustand.resetGroup) {
      const rg = p.zustand.resetGroup;
      if (!groups[rg]) groups[rg] = [];
      groups[rg].push(p);
    }
  }
  
  const cases = [];
  const processed = new Set();
  
  for (const rg of Object.keys(groups)) {
    if (processed.has(rg)) continue;
    
    const params = [...groups[rg]];
    let caseLabels = `case '${rg}':`;
    
    if (rg === 'temperature' && groups['tint']) {
      caseLabels += `\ncase 'tint':`;
      params.push(...groups['tint']);
      processed.add('tint');
    } else if (rg === 'tint' && groups['temperature']) {
      caseLabels = `case 'temperature':\ncase 'tint':`;
      params.push(...groups['temperature']);
      processed.add('temperature');
    }
    
    processed.add(rg);
    
    const assignments = [];
    for (const p of params) {
      const name = p.zustand.name || p.name;
      assignments.push(`state.${name}.value = ${p.zustand.default};`);
      if (p.nitro) {
        assignments.push(`getNitroConfig().${p.name} = ${p.zustand.default};`);
      }
    }
    
    if (params.some(p => p.name === 'whiteBalance' || p.name === 'tint')) {
      if (!assignments.some(a => a.includes('temperatureAuto'))) {
        assignments.push(`state.temperatureAuto.value = true;`);
      }
    }
    
    cases.push(`${caseLabels}\n  ${assignments.join('\n  ')}\n  break;`);
  }
  
  const resetContent = cases.join('\n');
  replaceBetweenMarkers(FILE_PATHS.zustandStore, '      // @@GEN_RESET_START@@', '      // @@GEN_RESET_END@@', resetContent, '      ');

  // 5. Generate Excluded Film Setters
  const excludedParams = parameters.filter(p => p.zustand && (p.zustand.store || 'film') === 'film' && p.excludeFromPreset);
  const excludedSettersContent = excludedParams
    .map(p => {
      const name = p.zustand.name || p.name;
      const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
      return `'set${capitalized}',`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.zustandStore, '  // @@GEN_EXCLUDED_SETTERS_START@@', '  // @@GEN_EXCLUDED_SETTERS_END@@', excludedSettersContent, '  ');
}

module.exports = {
  generateZustandTypes,
  generateZustandStore
};
