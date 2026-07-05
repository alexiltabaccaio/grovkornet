const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { generateNativeBridge } = require('./native');

test('generateNativeBridge correctly replaces content in native files', () => {
  const originalRead = fs.readFileSync;
  const originalWrite = fs.writeFileSync;
  const originalExists = fs.existsSync;

  const written = {};

  fs.existsSync = (filePath) => true;

  const fileTemplates = {
    'index.ts': '// @@GEN_PROPS_START@@\n// @@GEN_PROPS_END@@',
    'NativeFilmCameraModule.kt': '// @@GEN_PROPS_START@@\n// @@GEN_PROPS_END@@',
    'CameraConfiguration.kt': '// @@GEN_FIELDS_START@@\n// @@GEN_FIELDS_END@@\n// @@GEN_MAP_LOADER_START@@\n// @@GEN_MAP_LOADER_END@@',
    'RenderParams.h': '// @@GEN_STRUCT_START@@\n// @@GEN_STRUCT_END@@',
    'CameraStateManager.cpp': '// @@GEN_DEFAULTS_START@@\n// @@GEN_DEFAULTS_END@@\n// @@GEN_CLAMPING_START@@\n// @@GEN_CLAMPING_END@@',
    'CameraStateJNI.kt': '// @@GEN_JNI_METHODS_START@@\n// @@GEN_JNI_METHODS_END@@',
    'GrovkornetJni.cpp': '// @@GEN_JNI_BINDINGS_START@@\n// @@GEN_JNI_BINDINGS_END@@'
  };

  fs.readFileSync = (filePath, options) => {
    const strPath = String(filePath).replace(/\\/g, '/');
    const matchedKey = Object.keys(fileTemplates).find(k => strPath.endsWith(k));
    
    if (matchedKey) {
      if (written[matchedKey]) {
        return written[matchedKey];
      }
      return fileTemplates[matchedKey];
    }
    return '';
  };

  fs.writeFileSync = (filePath, content, options) => {
    const strPath = String(filePath).replace(/\\/g, '/');
    const matchedKey = Object.keys(fileTemplates).find(k => strPath.endsWith(k));
    if (matchedKey) {
      written[matchedKey] = content;
    } else {
      written[strPath] = content;
    }
  };

  try {
    const mockParameters = [
      {
        name: 'saturation',
        category: 'render',
        ts: { type: 'number' },
        kotlin: { type: 'Float', name: 'saturation', default: '1.0f' },
        cpp: { name: 'saturation' },
        worklet: { clamp: [0.0, 2.0] }
      },
      {
        name: 'torchState',
        category: 'hardware',
        ts: { type: 'boolean' },
        kotlin: { type: 'Boolean', name: 'torchState', default: false },
        cpp: { name: 'torchState' }
      },
      {
        name: 'grainSpeed',
        category: 'render',
        ts: { type: 'number' },
        zustand: { default: 'DEFAULT_GRAIN_SPEED' },
        kotlin: { type: 'Float', name: 'grainSpeed' },
        cpp: { name: 'grainSpeed' },
        worklet: { clamp: [0.0, 100.0] }
      }
    ];
    const mockRenderParams = [mockParameters[0], mockParameters[2]];
    const mockConstants = {
      DEFAULT_GRAIN_SPEED: 30.0
    };

    generateNativeBridge(mockParameters, mockRenderParams, mockConstants);

    assert.ok(Object.keys(written).length > 0, 'Should have written files');
    assert.ok(written['index.ts']);
    assert.match(written['index.ts'], /saturation\?: number;/, 'Should define TS prop saturation');
    assert.match(written['index.ts'], /torchState\?: boolean;/, 'Should define TS prop torchState');
    assert.ok(written['RenderParams.h']);
    assert.match(written['RenderParams.h'], /float saturation;/, 'Should define C++ field saturation');
    assert.match(written['RenderParams.h'], /float grainSpeed;/, 'Should define C++ field grainSpeed');
    assert.ok(written['CameraStateManager.cpp']);
    assert.match(written['CameraStateManager.cpp'], /initial->renderParams\.saturation = 1\.0f;/, 'Should set default saturation');
    assert.match(written['CameraStateManager.cpp'], /initial->renderParams\.grainSpeed = 30\.0f;/, 'Should set default grainSpeed from constants');
    assert.match(written['CameraStateManager.cpp'], /std::clamp/, 'Should contain clamp expression');
    assert.ok(written['CameraConfiguration.kt']);
    assert.match(written['CameraConfiguration.kt'], /CameraStateJNI\.fallbackGet\("grainSpeed", nativePointer, 30f\)/, 'Should use constant fallback for Kotlin default');

  } finally {
    fs.readFileSync = originalRead;
    fs.writeFileSync = originalWrite;
    fs.existsSync = originalExists;
  }
});
