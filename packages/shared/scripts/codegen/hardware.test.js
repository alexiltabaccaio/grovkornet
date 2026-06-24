const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const hardwareCodegen = require('./hardware');
const { PROJECT_ROOT } = require('./utils/config-loader');

test('Hardware Configuration Codegen generates expected outputs', (t) => {
  // Define paths
  const cppPath = path.resolve(PROJECT_ROOT, 'packages/engine/android/src/main/cpp/core/HardwareConfig.h');
  const tsPath = path.resolve(PROJECT_ROOT, 'packages/shared/src/hardwareConfig.ts');

  // Clean up existing files if they exist to avoid stale test results
  if (fs.existsSync(cppPath)) fs.unlinkSync(cppPath);
  if (fs.existsSync(tsPath)) fs.unlinkSync(tsPath);

  // Run generator
  hardwareCodegen.main();

  // Verify files exist
  assert.ok(fs.existsSync(cppPath), 'C++ hardware config file should be created');
  assert.ok(fs.existsSync(tsPath), 'TS hardware config file should be created');

  // Verify C++ file content
  const cppContent = fs.readFileSync(cppPath, 'utf8');
  assert.match(cppContent, /namespace HardwareConfig/, 'C++ should define namespace HardwareConfig');
  assert.match(cppContent, /static constexpr int LUT_SIZE =/, 'C++ should define LUT_SIZE');
  assert.match(cppContent, /static constexpr float MIN_DRS_SCALE =/, 'C++ should define MIN_DRS_SCALE');

  // Verify TS file content
  const tsContent = fs.readFileSync(tsPath, 'utf8');
  assert.match(tsContent, /export const HARDWARE_CONFIG =/, 'TS should export HARDWARE_CONFIG');
  assert.match(tsContent, /lut: \{/, 'TS should contain lut config object');
  assert.match(tsContent, /drs: \{/, 'TS should contain drs config object');
});
