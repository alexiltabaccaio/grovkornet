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
      const cppName = p.cpp?.name || p.kotlin?.name || p.name;
      const capitalized = cppName.charAt(0).toUpperCase() + cppName.slice(1);
      const kotlinName = p.kotlin?.name || p.name;
      const kotlinType = p.kotlin?.type || 'Float';
      
      let tsToKotlinType = 'Double';
      let castExpr = 'value.toFloat()';
      let returnCastExpr = '?.toDouble()';
      let defaultValue = '1.0';
      let jniGetCall = `CameraStateJNI.get${capitalized}(0L)`;
      let jniSetCall = `CameraStateJNI.set${capitalized}(0L, ${castExpr})`;

      if (p.ts?.type === 'boolean') {
        tsToKotlinType = 'Boolean';
        castExpr = 'value';
        returnCastExpr = '';
        defaultValue = 'false';
        jniGetCall = `CameraStateJNI.get${capitalized}(0L)`;
        jniSetCall = `CameraStateJNI.set${capitalized}(0L, value)`;
      } else if (kotlinType === 'Int') {
        tsToKotlinType = 'Double';
        castExpr = 'value.toInt()';
        returnCastExpr = '?.toDouble()';
        defaultValue = '0.0';
        jniGetCall = `CameraStateJNI.get${capitalized}(0L).toDouble()`;
        jniSetCall = `CameraStateJNI.set${capitalized}(0L, value.toInt())`;
      } else if (kotlinType === 'Long') {
        tsToKotlinType = 'Double';
        castExpr = 'value.toLong()';
        returnCastExpr = '?.toDouble()';
        defaultValue = '0.0';
        jniGetCall = `CameraStateJNI.get${capitalized}(0L).toDouble()`;
        jniSetCall = `CameraStateJNI.set${capitalized}(0L, value.toLong())`;
      } else {
        tsToKotlinType = 'Double';
        castExpr = 'value.toFloat()';
        returnCastExpr = '?.toDouble()';
        defaultValue = p.kotlin?.default ? p.kotlin.default.replace('f', '') : '1.0';
        jniGetCall = `CameraStateJNI.get${capitalized}(0L).toDouble()`;
        jniSetCall = `CameraStateJNI.set${capitalized}(0L, value.toFloat())`;
      }

      return `override var ${name}: ${tsToKotlinType}
    get() = try { ${jniGetCall} } catch (e: Throwable) { ${defaultValue} }
    set(value) {
        try {
            ${jniSetCall}
        } catch (e: Throwable) {
            Log.e("HybridNitroCameraConfiguration", "Failed to set ${name}", e)
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
