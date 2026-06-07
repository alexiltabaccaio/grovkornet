const runParameters = require('./parameters');
const runErrors = require('./errors');
const runHardware = require('./hardware');
const runI18n = require('./i18n');

async function runAll() {
  console.log('🏁 Starting unified Codegen sequence...');
  try {
    console.log('\n[1/4] Generating Camera Parameters...');
    runParameters.main(); 
    
    console.log('\n[2/4] Generating Camera Errors...');
    runErrors.main();
    
    console.log('\n[3/4] Generating Hardware Configuration...');
    runHardware.main();
    
    console.log('\n[4/4] Running i18n Validation & Codegen...');
    runI18n.main();
    
    console.log('\n✅ Unified Codegen completed successfully!');
  } catch (error) {
    console.error(`\n❌ Codegen Pipeline Failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  runAll();
}

module.exports = {
  runAll
};
