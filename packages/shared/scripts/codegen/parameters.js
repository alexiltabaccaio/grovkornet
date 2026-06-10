const { validateAndLoadParameters } = require('./utils/validator');
const { generateSharedIndex } = require('./generators/shared');
const { generateNativeBridge } = require('./generators/native');
const { generateZustandTypes, generateZustandStore } = require('./generators/zustand');
const { generateViewfinderProps } = require('./generators/viewfinder');
const { generatePresetSettings } = require('./generators/preset');
const { generateNitroConfig } = require('./generators/nitro');
const { generateWorklets } = require('./generators/worklets');
const { generateControlData } = require('./generators/controlData');

const PARAMETERS_YAML_PATH = 'packages/shared/camera-parameters';

function main() {
  const isDryRun = process.argv.includes('--dry-run');
  
  try {
    const { parameters, renderParams, data } = validateAndLoadParameters(PARAMETERS_YAML_PATH);
    
    if (isDryRun) {
      console.log("\n--- Dry Run Outputs ---");
      console.log(`Expected C++ RenderParams Struct fields: ${renderParams.map(p => (p.cpp?.name || p.name)).join(', ')}`);
      console.log("\nCodegen script running in DRY-RUN mode. Target files are unmodified.");
    } else {
      generateSharedIndex(data);
      generateNativeBridge(parameters, renderParams);
      generateZustandTypes(parameters);
      generateZustandStore(parameters);
      generateViewfinderProps(parameters);
      generatePresetSettings(parameters);
      generateNitroConfig(parameters);
      generateWorklets(parameters);
      generateControlData(parameters);
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

module.exports = {
  main
};
