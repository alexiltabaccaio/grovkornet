const fs = require('fs');
const path = require('path');

// Target file paths
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const PARAMETERS_JSON_PATH = path.join(PROJECT_ROOT, 'packages/shared/camera-parameters.json');

// File paths relative to PROJECT_ROOT
const FILE_PATHS = {
  tsInterface: 'packages/engine/src/index.ts',
  kotlinModule: 'packages/engine/android/src/main/java/com/grovkornet/nativefilmcamera/NativeFilmCameraModule.kt',
  kotlinConfig: 'packages/engine/android/src/main/java/com/grovkornet/nativefilmcamera/state/CameraConfiguration.kt',
  cppHeader: 'packages/engine/android/src/main/cpp/core/RenderParams.h',
  cppSource: 'packages/engine/android/src/main/cpp/core/GrovkornetEngine.cpp',
  zustandTypes: 'apps/mobile/src/entities/film/model/types.ts',
  zustandStore: 'apps/mobile/src/entities/film/model/useFilmStore.ts',
  bodyTypes: 'apps/mobile/src/entities/body/model/types.ts',
  bodyStore: 'apps/mobile/src/entities/body/model/useBodyStore.ts',
  lensTypes: 'apps/mobile/src/entities/lens/model/types.ts',
  lensStore: 'apps/mobile/src/entities/lens/model/useLensStore.ts',
  zustandViewfinder: 'apps/mobile/src/widgets/viewfinder/ui/Viewfinder.tsx',
  presetTypes: 'apps/mobile/src/entities/preset/model/types.ts',
  presetStore: 'apps/mobile/src/entities/preset/model/usePresetStore.ts'
};

function replaceBetweenMarkers(filePath, startMarker, endMarker, newContent, indent = '') {
  const absolutePath = path.resolve(PROJECT_ROOT, filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Target file not found: ${filePath}`);
  }
  
  let content = fs.readFileSync(absolutePath, 'utf8');
  
  // Detect original line endings
  const hasCrlf = content.includes('\r\n');
  const lineEnding = hasCrlf ? '\r\n' : '\n';
  
  // Normalize to LF for indexing
  content = content.replace(/\r\n/g, '\n');
  
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);
  
  if (startIndex === -1) {
    throw new Error(`Start marker "${startMarker}" not found in ${filePath}`);
  }
  if (endIndex === -1) {
    throw new Error(`End marker "${endMarker}" not found in ${filePath}`);
  }
  if (startIndex > endIndex) {
    throw new Error(`Markers are out of order in ${filePath}`);
  }
  
  const before = content.substring(0, startIndex + startMarker.length);
  const after = content.substring(endIndex);
  
  // Indent content lines
  const indentedContent = newContent
    .split('\n')
    .map(line => line.trim() ? indent + line : '')
    .join('\n');
    
  const updated = before + '\n' + indentedContent + '\n' + indent + after.trimStart();
  
  // Write back matching the original line ending format
  fs.writeFileSync(absolutePath, updated.split('\n').join(lineEnding), 'utf8');
  console.log(`Successfully updated: ${filePath}`);
}

function validateAndLoadParameters() {
  console.log(`Loading parameters from: ${PARAMETERS_JSON_PATH}`);
  
  if (!fs.existsSync(PARAMETERS_JSON_PATH)) {
    throw new Error(`Parameters JSON file not found at ${PARAMETERS_JSON_PATH}`);
  }
  
  const content = fs.readFileSync(PARAMETERS_JSON_PATH, 'utf8');
  let data;
  try {
    data = JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to parse camera-parameters.json: ${err.message}`);
  }
  
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
  return { parameters, renderParams };
}

function generateNativeBridge(parameters, renderParams) {
  console.log('\n--- Generating Native Bridge (Step 2) ---');

  // 1. Generate index.ts TypeScript Interface Props
  const tsTypesContent = parameters
    .filter(p => p.ts && p.ts.type)
    .map(p => {
      const tsName = p.ts.name || p.name;
      const isOptional = p.ts.optional !== false;
      return `${tsName}${isOptional ? '?' : ''}: ${p.ts.type};`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.tsInterface, '// @@GEN_PROPS_START@@', '// @@GEN_PROPS_END@@', tsTypesContent, '  ');

  // 2. Generate NativeFilmCameraModule.kt Prop handlers
  const kotlinPropsContent = parameters
    .filter(p => p.ts && p.kotlin && !p.kotlin.transient)
    .map(p => {
      const propName = p.ts.name || p.name;
      const kotlinName = p.kotlin.name || p.name;
      
      let kotlinPropType = 'Float';
      if (p.ts.type === 'boolean') {
        kotlinPropType = 'Boolean';
      } else if (p.ts.type === 'string') {
        kotlinPropType = 'String?';
      } else if (p.ts.type === 'number') {
        if (p.kotlin.type === 'Long') {
          kotlinPropType = 'Double';
        } else if (propName === 'cameraAspectRatio' || propName === 'torchState') {
          kotlinPropType = 'Float';
        } else if (p.kotlin.type === 'Int') {
          kotlinPropType = 'Int';
        } else {
          kotlinPropType = 'Float';
        }
      }
      
      let body = '';
      if (p.kotlin.propHandler) {
        body = p.kotlin.propHandler;
      } else {
        if (p.category === 'render') {
          body = `view.updateEffect { ${kotlinName} = value }`;
        } else if (p.category === 'hardware') {
          body = `if (view.config.${kotlinName} != value) view.updateHardware { ${kotlinName} = value }`;
        } else {
          body = `if (view.config.${kotlinName} != value) view.updateBoth { ${kotlinName} = value }`;
        }
      }
      
      const indentedBody = body
        .split('\n')
        .map((line, idx) => idx === 0 ? line : '        ' + line)
        .join('\n');
      
      return `Prop("${propName}") { view: NativeFilmCameraView, value: ${kotlinPropType} ->\n  ${indentedBody}\n}`;
    })
    .join('\n\n'); // Separate Prop declarations with empty line for legibility
  replaceBetweenMarkers(FILE_PATHS.kotlinModule, '// @@GEN_PROPS_START@@', '// @@GEN_PROPS_END@@', kotlinPropsContent, '      ');

  // 3. Generate CameraConfiguration.kt Fields
  const renderFields = parameters
    .filter(p => p.kotlin && !p.kotlin.transient && p.category === 'render')
    .map(p => `var ${p.kotlin.name || p.name}: ${p.kotlin.type} = ${p.kotlin.default},`)
    .join('\n');
  const hardwareFields = parameters
    .filter(p => p.kotlin && !p.kotlin.transient && p.category === 'hardware')
    .map(p => `var ${p.kotlin.name || p.name}: ${p.kotlin.type} = ${p.kotlin.default},`)
    .join('\n');
  const viewportFields = parameters
    .filter(p => p.kotlin && !p.kotlin.transient && p.category === 'viewport')
    .map((p, idx, arr) => `var ${p.kotlin.name || p.name}: ${p.kotlin.type} = ${p.kotlin.default}${idx === arr.length - 1 ? '' : ','}`)
    .join('\n');
  const kotlinFieldsContent = `// Rendering / Effect Props\n${renderFields}\n\n// Hardware Props\n${hardwareFields}\n\n// Viewport Props\n${viewportFields}`;
  replaceBetweenMarkers(FILE_PATHS.kotlinConfig, '// @@GEN_FIELDS_START@@', '// @@GEN_FIELDS_END@@', kotlinFieldsContent, '    ');

  // 4. Generate CameraConfiguration.kt toRenderParamsArray mapping
  const arraySize = renderParams.length > 0 ? renderParams[renderParams.length - 1].arrayIndex + 1 : 0;
  const arrayMappingsContent = renderParams
    .map(p => {
      const idx = p.arrayIndex;
      const kotlinName = p.kotlin.name || p.name;
      
      let expr = '';
      if (p.kotlin.arrayMapping) {
        expr = p.kotlin.arrayMapping;
      } else {
        if (p.kotlin.transient) {
          expr = p.kotlin.argumentName;
        } else if (p.kotlin.type === 'Boolean') {
          expr = `if (${kotlinName}) 1.0f else 0.0f`;
        } else if (p.kotlin.type === 'Int' || p.kotlin.type === 'Long') {
          expr = `${kotlinName}.toFloat()`;
        } else {
          expr = kotlinName;
        }
      }
      
      const idxStr = idx.toString().padEnd(2, ' ');
      return `this[${idxStr}] = ${expr}`;
    })
    .join('\n');
  const toRenderParamsContent = `FloatArray(${arraySize}).apply {\n${arrayMappingsContent.split('\n').map(line => '    ' + line).join('\n')}\n}`;
  replaceBetweenMarkers(FILE_PATHS.kotlinConfig, '// @@GEN_ARRAY_START@@', '// @@GEN_ARRAY_END@@', toRenderParamsContent, '');

  // 4b. Generate CameraConfiguration.kt loadFromMap mapping
  const mapLoaderContent = parameters
    .filter(p => p.kotlin && !p.kotlin.transient)
    .map(p => {
      const kotlinName = p.kotlin.name || p.name;
      const jsKey = p.zustand?.name || p.ts?.name || p.name;
      
      let castExpr = '';
      if (p.kotlin.type === 'Float') {
        castExpr = `(rawValue as? Number)?.toFloat()?.let { ${kotlinName} = it }`;
      } else if (p.kotlin.type === 'Int') {
        castExpr = `(rawValue as? Number)?.toInt()?.let { ${kotlinName} = it }`;
      } else if (p.kotlin.type === 'Long') {
        castExpr = `(rawValue as? Number)?.toLong()?.let { ${kotlinName} = it }`;
      } else if (p.kotlin.type === 'Boolean') {
        castExpr = `(rawValue as? Boolean)?.let { ${kotlinName} = it }`;
      } else if (p.kotlin.type === 'String' || p.kotlin.type === 'String?') {
        castExpr = `(rawValue as? String)?.let { ${kotlinName} = it }`;
      } else {
        castExpr = `// Unhandled type: ${p.kotlin.type}`;
      }
      
      if (jsKey !== p.name) {
        return `val raw_${kotlinName} = payload["${jsKey}"] ?: payload["${p.name}"]\nraw_${kotlinName}?.let { rawValue ->\n    ${castExpr}\n}`;
      } else {
        return `payload["${jsKey}"]?.let { rawValue ->\n    ${castExpr}\n}`;
      }
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.kotlinConfig, '// @@GEN_MAP_LOADER_START@@', '// @@GEN_MAP_LOADER_END@@', mapLoaderContent, '    ');

  // 5. Generate RenderParams.h struct fields
  const cppFieldsContent = renderParams
    .map(p => {
      const cppName = p.cpp?.name || p.name;
      return `float ${cppName};`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.cppHeader, '// @@GEN_STRUCT_START@@', '// @@GEN_STRUCT_END@@', cppFieldsContent, '    ');

  // 6. Generate GrovkornetEngine.cpp parsing
  const cppParsingContent = renderParams
    .map(p => {
      const cppName = p.cpp?.name || p.name;
      const idx = p.arrayIndex;
      return `rp.${cppName} = params[${idx}];`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.cppSource, '// @@GEN_PARSING_START@@', '// @@GEN_PARSING_END@@', cppParsingContent, '    ');
}

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
                if (isSharedValue(parameters, se.target)) {
                  return `${se.target}.value = ${se.value};`;
                } else {
                  return `set({ ${se.target}: ${se.value} });`;
                }
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
    
    const assignments = params.map(p => {
      const name = p.zustand.name || p.name;
      return `state.${name}.value = ${p.zustand.default};`;
    });
    
    if (params.some(p => p.name === 'whiteBalance' || p.name === 'tint')) {
      if (!assignments.some(a => a.includes('temperatureAuto'))) {
        assignments.push(`state.temperatureAuto.value = true;`);
      }
    }
    
    cases.push(`${caseLabels}\n  ${assignments.join('\n  ')}\n  break;`);
  }
  
  const resetContent = cases.join('\n');
  replaceBetweenMarkers(FILE_PATHS.zustandStore, '      // @@GEN_RESET_START@@', '      // @@GEN_RESET_END@@', resetContent, '      ');
}

function generateViewfinderProps(parameters) {
  console.log('\n--- Generating Viewfinder Props (Step 5) ---');
  
  const VIEWFINDER_PROP_EXPRESSIONS = {
    exposureTime: 'shutterSpeed as unknown as SharedValue<number | undefined>',
    whiteBalance: 'temperature as unknown as SharedValue<number | undefined>',
    whiteBalanceAuto: 'temperatureAuto as unknown as SharedValue<boolean | undefined>',
    torchStrength: 'resolvedTorchStrength as unknown as SharedValue<number | undefined>',
    noiseReduction: 'resolvedNoiseReduction as unknown as SharedValue<number | undefined>',
    previewIn4k: 'resolvedPreviewIn4k as unknown as SharedValue<boolean | undefined>',
    targetFps: 'fpsSetting as unknown as SharedValue<number | undefined>',
    cameraAspectRatio: 'aspectRatio as unknown as SharedValue<number | undefined>',
    cameraId: 'cameraAuto ? undefined : cameraId',
    autoFocus: 'focusAuto as unknown as SharedValue<boolean | undefined>',
    torchState: 'torchState as unknown as SharedValue<number | undefined>',
    force4k60fpsCrop: 'resolvedForce4k60fpsCrop as unknown as SharedValue<boolean | undefined>',
    secureViewEnabled: 'isCameraSecure'
  };

  // 1. Selector destructuring (FILM store parameters ONLY)
  const selectorParams = parameters.filter(p => p.zustand && (p.zustand.store || 'film') === 'film');
  const selectorContent = selectorParams
    .map(p => {
      const name = p.zustand.name || p.name;
      return `${name},`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.zustandViewfinder, '    // @@GEN_SELECTOR_START@@', '    // @@GEN_SELECTOR_END@@', selectorContent, '    ');

  // 2. JSX Prop mapping
  const OTHER_DESTRUCTURED_PROPS = new Set(['isoAuto', 'shutterSpeedAuto', 'focusDistance', 'iso', 'ev', 'resolutionSetting']);
  const propParams = parameters.filter(p => {
    if (!p.ts || !p.ts.type) return false;
    const propName = p.ts.name || p.name;
    return VIEWFINDER_PROP_EXPRESSIONS[propName] || p.zustand || OTHER_DESTRUCTURED_PROPS.has(propName);
  });

  const propsContent = propParams
    .map(p => {
      const propName = p.ts.name || p.name;
      const stateName = p.zustand?.name || p.name;
      
      let expr = '';
      if (VIEWFINDER_PROP_EXPRESSIONS[propName]) {
        expr = VIEWFINDER_PROP_EXPRESSIONS[propName];
      } else {
        const type = p.ts.type;
        if (type === 'boolean') {
          expr = `${stateName} as unknown as SharedValue<boolean | undefined>`;
        } else if (type === 'string') {
          expr = stateName;
        } else {
          expr = `${stateName} as unknown as SharedValue<number | undefined>`;
        }
      }
      return `${propName}={${expr}}`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.zustandViewfinder, '        // @@GEN_PROPS_START@@', '        // @@GEN_PROPS_END@@', propsContent, '        ');
}

function generatePresetSettings(parameters) {
  console.log('\n--- Generating Preset Settings (Step 6) ---');
  
  const zustandParams = parameters.filter(p => p.zustand && (p.zustand.store || 'film') === 'film' && !p.excludeFromPreset);
  
  // 1. Generate FilmPresetPayload fields in types.ts
  const fieldsContent = zustandParams
    .map(p => {
      const name = p.zustand.name || p.name;
      const type = p.zustand.type || (p.ts?.type === 'boolean' ? 'boolean' : 'number');
      return `${name}: ${type};`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.presetTypes, '  // @@GEN_FILM_PAYLOAD_START@@', '  // @@GEN_FILM_PAYLOAD_END@@', fieldsContent, '  ');

  // 2. Generate @grovkornet/shared imports in usePresetStore.ts
  const defaults = new Set(['DEFAULT_ISO', 'DEFAULT_EV', 'DEFAULT_SHUTTER_SPEED']);
  parameters.forEach(p => {
    if (p.zustand && p.zustand.default && p.zustand.default.startsWith('DEFAULT_')) {
      defaults.add(p.zustand.default);
    }
  });
  const importsContent = Array.from(defaults)
    .sort()
    .map(d => `${d},`)
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.presetStore, '  // @@GEN_IMPORTS_START@@', '  // @@GEN_IMPORTS_END@@', importsContent, '  ');

  // 3. Generate DEFAULT_FILM_PAYLOAD in usePresetStore.ts
  const defaultsContent = zustandParams
    .map(p => {
      const name = p.zustand.name || p.name;
      const def = p.zustand.default;
      return `${name}: ${def},`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.presetStore, '  // @@GEN_DEFAULTS_START@@', '  // @@GEN_DEFAULTS_END@@', defaultsContent, '  ');
}

function main() {
  const isDryRun = process.argv.includes('--dry-run');
  
  try {
    const { parameters, renderParams } = validateAndLoadParameters();
    
    if (isDryRun) {
      console.log("\n--- Dry Run Outputs ---");
      console.log(`Expected C++ RenderParams Struct fields: ${renderParams.map(p => (p.cpp?.name || p.name)).join(', ')}`);
      console.log("\nCodegen script running in DRY-RUN mode. Target files are unmodified.");
    } else {
      generateNativeBridge(parameters, renderParams);
      generateZustandTypes(parameters);
      generateZustandStore(parameters);
      generateViewfinderProps(parameters);
      generatePresetSettings(parameters);
      console.log("\nCodegen execution completed successfully!");
    }
  } catch (err) {
    console.error(`\nValidation/Codegen Failed: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
