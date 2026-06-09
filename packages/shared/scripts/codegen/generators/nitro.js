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

  // 2. Generate HybridNitroCameraConfiguration.kt overrides
  const overrides = nitroParams
    .map(p => {
      const name = p.name;
      const kotlinName = p.kotlin?.name || p.name;
      const kotlinType = p.kotlin?.type || 'Float';
      
      let tsToKotlinType = 'Double';
      let castExpr = 'value.toFloat()';
      let returnCastExpr = '?.toDouble()';
      let defaultValue = '1.0';

      if (p.ts?.type === 'boolean') {
        tsToKotlinType = 'Boolean';
        castExpr = 'value';
        returnCastExpr = '';
        defaultValue = 'false';
      } else if (kotlinType === 'Int') {
        tsToKotlinType = 'Double';
        castExpr = 'value.toInt()';
        returnCastExpr = '?.toDouble()';
        defaultValue = '0.0';
      } else if (kotlinType === 'Long') {
        tsToKotlinType = 'Double';
        castExpr = 'value.toLong()';
        returnCastExpr = '?.toDouble()';
        defaultValue = '0.0';
      } else {
        tsToKotlinType = 'Double';
        castExpr = 'value.toFloat()';
        returnCastExpr = '?.toDouble()';
        defaultValue = p.kotlin?.default ? p.kotlin.default.replace('f', '') : '1.0';
      }

      return `override var ${name}: ${tsToKotlinType}
    get() = NativeFilmCameraView.getFirstValidConfig()?.${kotlinName}${returnCastExpr} ?: ${defaultValue}
    set(value) {
        NativeFilmCameraView.dispatchUpdate {
            ${kotlinName} = ${castExpr}
        }
    }`;
    })
    .join('\n\n');
  replaceBetweenMarkers(FILE_PATHS.nitroImpl, '    // @@GEN_OVERRIDES_START@@', '    // @@GEN_OVERRIDES_END@@', overrides, '    ');

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
