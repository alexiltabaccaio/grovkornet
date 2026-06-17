const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const parametersCodegen = require('./parameters');
const { validateAndLoadParameters } = require('./utils/validator');
const { PROJECT_ROOT, FILE_PATHS } = require('./utils/helpers');

test('Camera Parameters Codegen generates expected outputs and validates structure', (t) => {
  // Run the codegen main in dry-run mode (or regular to verify file writes)
  // To avoid modifying files during a standard test, we can pass --dry-run or execute main
  // Here, we run the regular main to make sure it functions, then verify output existence.
  const originalArgs = process.argv;
  process.argv = [...originalArgs, '--dry-run'];
  
  try {
    parametersCodegen.main();
  } finally {
    process.argv = originalArgs;
  }

  // Define critical generated paths
  const cppParamsPath = path.resolve(PROJECT_ROOT, 'packages/engine/android/src/main/cpp/core/RenderParams.h');
  const cppStateManagerPath = path.resolve(PROJECT_ROOT, 'packages/engine/android/src/main/cpp/state/CameraStateManager.cpp');
  const tsIndexPath = path.resolve(PROJECT_ROOT, 'packages/engine/src/index.ts');
  const zustandTypesPath = path.resolve(PROJECT_ROOT, 'apps/mobile/src/entities/film/model/types.ts');
  const zustandStorePath = path.resolve(PROJECT_ROOT, 'apps/mobile/src/entities/film/model/useFilmStore.ts');

  // Verify key files exist
  assert.ok(fs.existsSync(cppParamsPath), 'C++ RenderParams header file should exist');
  assert.ok(fs.existsSync(cppStateManagerPath), 'C++ CameraStateManager source file should exist');
  assert.ok(fs.existsSync(tsIndexPath), 'TS index file should exist');
  assert.ok(fs.existsSync(zustandTypesPath), 'Zustand types file should exist');
  assert.ok(fs.existsSync(zustandStorePath), 'Zustand store file should exist');

  // Verify C++ parameter struct definition matches the marker section
  const cppParamsContent = fs.readFileSync(cppParamsPath, 'utf8');
  assert.match(cppParamsContent, /float saturation;/, 'C++ struct should contain saturation field');
  assert.match(cppParamsContent, /float contrast;/, 'C++ struct should contain contrast field');
  assert.match(cppParamsContent, /float scanlines;/, 'C++ struct should contain scanlines field');

  // Verify C++ State Manager clamping limits matches the marker section
  const cppStateContent = fs.readFileSync(cppStateManagerPath, 'utf8');
  assert.match(cppStateContent, /state\.renderParams\.saturation =/, 'C++ clamping should handle saturation clamping');
  assert.match(cppStateContent, /state\.renderParams\.contrast =/, 'C++ clamping should handle contrast clamping');
});

test('Camera Parameters YAML schema bounds and integrity rules', (t) => {
  const PARAMETERS_YAML_PATH = 'packages/shared/camera-parameters';
  const { parameters, renderParams, data } = validateAndLoadParameters(PARAMETERS_YAML_PATH);

  // 1. Assert basic structure
  assert.ok(Array.isArray(parameters), 'parameters should be an array');
  assert.ok(parameters.length > 0, 'parameters should not be empty');

  // 2. Validate bounds on all numeric UI parameters
  parameters.forEach(p => {
    if (p.ui) {
      if (p.ui.min !== undefined && p.ui.max !== undefined) {
        assert.ok(p.ui.min <= p.ui.max, `UI limits invalid: parameter '${p.name}' min (${p.ui.min}) must be less than or equal to max (${p.ui.max})`);
      }
      if (p.ui.center !== undefined && p.ui.min !== undefined && p.ui.max !== undefined) {
        assert.ok(p.ui.center >= p.ui.min && p.ui.center <= p.ui.max, `UI center invalid: parameter '${p.name}' center (${p.ui.center}) must be between min (${p.ui.min}) and max (${p.ui.max})`);
      }
    }
  });

  // 3. Validate worklet clamps if defined
  parameters.forEach(p => {
    if (p.worklet && p.worklet.clamp) {
      assert.strictEqual(p.worklet.clamp.length, 2, `Worklet clamp for '${p.name}' must have exactly 2 numbers`);
      assert.ok(p.worklet.clamp[0] <= p.worklet.clamp[1], `Worklet clamp limits invalid: parameter '${p.name}' clamp[0] (${p.worklet.clamp[0]}) must be less than or equal to clamp[1] (${p.worklet.clamp[1]})`);
    }
  });

  // 4. Validate categorizations
  parameters.forEach(p => {
    assert.match(p.category, /^(render|hardware|transient|viewport)$/, `Parameter '${p.name}' has invalid category '${p.category}'`);
  });

  // 5. Validate JNI/array index contiguous mapping
  renderParams.forEach((rp, idx) => {
    assert.strictEqual(rp.arrayIndex, idx, `Render parameter array indices should be contiguous. Expected index ${idx} but found ${rp.arrayIndex} on parameter '${rp.name}'`);
  });
});
