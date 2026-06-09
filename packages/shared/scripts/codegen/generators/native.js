const { FILE_PATHS, replaceBetweenMarkers } = require('../utils/helpers');

function generateNativeBridge(parameters, renderParams) {
  console.log('\n--- Generating Native Bridge (Step 2) ---');

  // 1. Generate index.ts TypeScript Interface Props
  const tsTypesContent = parameters
    .filter(p => p.ts && p.ts.type && !p.nitro)
    .map(p => {
      const tsName = p.ts.name || p.name;
      const isOptional = p.ts.optional !== false;
      return `${tsName}${isOptional ? '?' : ''}: ${p.ts.type};`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.tsInterface, '// @@GEN_PROPS_START@@', '// @@GEN_PROPS_END@@', tsTypesContent, '  ');

  // 2. Generate NativeFilmCameraModule.kt Prop handlers
  const kotlinPropsContent = parameters
    .filter(p => p.ts && p.kotlin && !p.kotlin.transient && !p.nitro)
    .map(p => {
      const propName = p.ts.name || p.name;
      const kotlinName = p.kotlin.name || p.name;
      
      let kotlinPropType = 'Float?';
      if (p.ts.type.includes('boolean')) {
        kotlinPropType = 'Boolean?';
      } else if (p.ts.type.includes('string')) {
        kotlinPropType = 'String?';
      } else if (p.ts.type.includes('number')) {
        if (p.kotlin.type === 'Long') {
          kotlinPropType = 'Double?';
        } else if (propName === 'cameraAspectRatio' || propName === 'torchState') {
          kotlinPropType = 'Float?';
        } else if (p.kotlin.type === 'Int') {
          kotlinPropType = 'Int?';
        } else {
          kotlinPropType = 'Float?';
        }
      }
      
      const isNullable = p.kotlin && p.kotlin.type && p.kotlin.type.endsWith('?');
      let body = '';
      if (p.kotlin.propHandler) {
        if (isNullable) {
          body = p.kotlin.propHandler;
        } else {
          body = `value?.let { value ->\n  ${p.kotlin.propHandler.split('\n').join('\n  ')}\n}`;
        }
      } else {
        if (isNullable) {
          if (p.category === 'render') {
            body = `view.updateEffect { ${kotlinName} = value }`;
          } else if (p.category === 'hardware') {
            body = `if (view.config.${kotlinName} != value) view.updateHardware { ${kotlinName} = value }`;
          } else {
            body = `if (view.config.${kotlinName} != value) view.updateBoth { ${kotlinName} = value }`;
          }
        } else {
          if (p.category === 'render') {
            body = `value?.let { view.updateEffect { ${kotlinName} = it } }`;
          } else if (p.category === 'hardware') {
            body = `value?.let { if (view.config.${kotlinName} != it) view.updateHardware { ${kotlinName} = it } }`;
          } else {
            body = `value?.let { if (view.config.${kotlinName} != it) view.updateBoth { ${kotlinName} = it } }`;
          }
        }
      }
      
      const indentedBody = body
        .split('\n')
        .map((line, idx) => idx === 0 ? line : '        ' + line)
        .join('\n');
      
      return `Prop("${propName}") { view: NativeFilmCameraView, value: ${kotlinPropType} ->\n  ${indentedBody}\n}`;
    })
    .join('\n\n');
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

module.exports = {
  generateNativeBridge
};
