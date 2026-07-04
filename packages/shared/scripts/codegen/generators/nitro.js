const path = require('path');
const { execSync } = require('child_process');
const { FILE_PATHS, replaceBetweenMarkers, PROJECT_ROOT } = require('../utils/helpers');

function generateNitroConfig(parameters) {
  console.log('\n--- Generating Nitro Configuration (Step 7) ---');
  const nitroParams = parameters.filter(p => p.nitro);

  // 1. Generate NitroCameraConfiguration.nitro.ts properties
  const specProperties = nitroParams
    .map(p => {
      const name = p.name;
      const type = p.ts?.type === 'boolean' ? 'boolean' : 'number';
      return `${name}: ${type};`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.nitroSpec, '  // @@GEN_PROPERTIES_START@@', '  // @@GEN_PROPERTIES_END@@', specProperties, '  ');

  // 2. Generate C++ declarations for HybridNitroCameraConfiguration.hpp
  const headerProperties = nitroParams
    .map(p => {
      const funcName = p.name;
      const capitalized = funcName.charAt(0).toUpperCase() + funcName.slice(1);
      const cppType = p.ts?.type === 'boolean' ? 'bool' : 'double';
      return `${cppType} get${capitalized}() override;\nvoid set${capitalized}(${cppType} value) override;`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.cppNitroHeader, '    // @@GEN_PROPERTIES_START@@', '    // @@GEN_PROPERTIES_END@@', headerProperties, '    ');

  // 3. Generate C++ implementations for HybridNitroCameraConfiguration.cpp
  const sourceProperties = nitroParams
    .map(p => {
      const funcName = p.name;
      const cppFieldName = p.cpp?.name || p.name;
      const capitalized = funcName.charAt(0).toUpperCase() + funcName.slice(1);
      const isBool = p.ts?.type === 'boolean';
      const cppType = isBool ? 'bool' : 'double';
      
      let getterBody = `return CameraStateManager::getInstance().getActiveState()->renderParams.${cppFieldName};`;
      if (isBool) {
        getterBody = `return CameraStateManager::getInstance().getActiveState()->renderParams.${cppFieldName} > 0.5f;`;
      }
      
      let setterBody = `CameraStateManager::getInstance().updateStateField([=](RenderState& state) {
    state.renderParams.${cppFieldName} = static_cast<float>(value);
});`;
      if (isBool) {
        setterBody = `CameraStateManager::getInstance().updateStateField([=](RenderState& state) {
    state.renderParams.${cppFieldName} = value ? 1.0f : 0.0f;
});`;
      }
      
      return `${cppType} HybridNitroCameraConfiguration::get${capitalized}() {
    ${getterBody}
}

void HybridNitroCameraConfiguration::set${capitalized}(${cppType} value) {
    ${setterBody}
}`;
    })
    .join('\n\n');
  replaceBetweenMarkers(FILE_PATHS.cppNitroSource, '// @@GEN_PROPERTIES_START@@', '// @@GEN_PROPERTIES_END@@', sourceProperties, '');

  // Trigger Nitrogen code generation automatically
  try {
    const engineDir = path.resolve(PROJECT_ROOT, 'packages/engine');
    console.log('\n--- Running Nitrogen Generator (Step 7.5) ---');
    execSync('npx nitrogen .', { cwd: engineDir, stdio: 'inherit' });
  } catch (e) {
    console.error('Failed to trigger Nitrogen:', e);
  }
}

module.exports = {
  generateNitroConfig
};
