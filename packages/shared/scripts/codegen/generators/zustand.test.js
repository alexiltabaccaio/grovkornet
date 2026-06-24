const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { generateZustandTypes, generateZustandStore } = require('./zustand');

test('generateZustandTypes and generateZustandStore correctly output Zustand code', () => {
  const originalRead = fs.readFileSync;
  const originalWrite = fs.writeFileSync;
  const originalExists = fs.existsSync;

  const written = {};

  fs.existsSync = (filePath) => true;

  const fileTemplates = {
    'entities/film/model/types.ts': '  // @@GEN_STATE_START@@\n  // @@GEN_STATE_END@@\n  // @@GEN_ACTIONS_START@@\n  // @@GEN_ACTIONS_END@@\n// @@GEN_PARAMETERS_START@@\n// @@GEN_PARAMETERS_END@@',
    'entities/body/model/types.ts': '  // @@GEN_STATE_START@@\n  // @@GEN_STATE_END@@\n  // @@GEN_ACTIONS_START@@\n  // @@GEN_ACTIONS_END@@\n// @@GEN_PARAMETERS_START@@\n// @@GEN_PARAMETERS_END@@',
    'entities/lens/model/types.ts': '  // @@GEN_STATE_START@@\n  // @@GEN_STATE_END@@\n  // @@GEN_ACTIONS_START@@\n  // @@GEN_ACTIONS_END@@\n// @@GEN_PARAMETERS_START@@\n// @@GEN_PARAMETERS_END@@',
    'useFilmStore.ts': '  // @@GEN_INIT_START@@\n  // @@GEN_INIT_END@@\n  // @@GEN_SETTERS_START@@\n  // @@GEN_SETTERS_END@@\n  // @@GEN_STATE_START@@\n  // @@GEN_STATE_END@@',
    'useBodyStore.ts': '  // @@GEN_INIT_START@@\n  // @@GEN_INIT_END@@\n  // @@GEN_SETTERS_START@@\n  // @@GEN_SETTERS_END@@\n  // @@GEN_STATE_START@@\n  // @@GEN_STATE_END@@',
    'useLensStore.ts': '  // @@GEN_INIT_START@@\n  // @@GEN_INIT_END@@\n  // @@GEN_SETTERS_START@@\n  // @@GEN_SETTERS_END@@\n  // @@GEN_STATE_START@@\n  // @@GEN_STATE_END@@',
    'filmActions.ts': '    // @@GEN_RESET_START@@\n    // @@GEN_RESET_END@@',
    'nativeSync.ts': '  // @@GEN_SYNC_MAP_START@@\n  // @@GEN_SYNC_MAP_END@@'
  };

  const fileTemplateKeys = Object.keys(fileTemplates).sort((a, b) => b.length - a.length);

  fs.readFileSync = (filePath, options) => {
    const strPath = String(filePath).replace(/\\/g, '/');
    const matchedKey = fileTemplateKeys.find(k => strPath.endsWith(k));
    
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
    const matchedKey = fileTemplateKeys.find(k => strPath.endsWith(k));
    if (matchedKey) {
      written[matchedKey] = content;
      written[strPath] = content;
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
        zustand: { store: 'film', name: 'saturation', default: '1.0', resetGroup: 'saturation' },
        ui: { name: 'Saturation' }
      },
      {
        name: 'focus',
        category: 'viewport',
        ts: { type: 'number' },
        kotlin: { type: 'Float', name: 'focus', default: '0.0f' },
        zustand: { store: 'lens', name: 'focus', default: '0.0' }
      },
      {
        name: 'zoom',
        category: 'hardware',
        ts: { type: 'number' },
        kotlin: { type: 'Float', name: 'zoom', default: '1.0f' },
        zustand: { store: 'body', name: 'zoom', default: '1.0' }
      },
      {
        name: 'noiseReductionMode',
        category: 'render',
        ts: { type: 'string' },
        kotlin: { type: 'String', name: 'noiseReductionMode', default: '"auto"' },
        zustand: { store: 'film', name: 'noiseReductionMode', default: '"auto"', type: 'string' }
      }
    ];

    generateZustandTypes(mockParameters);
    generateZustandStore(mockParameters);

    assert.ok(Object.keys(written).length > 0, 'Should have written files');
    assert.ok(written['entities/film/model/types.ts']);
    assert.match(written['entities/film/model/types.ts'], /saturation: SharedValue<number>;/, 'Film state should be SharedValue');
    assert.match(written['entities/film/model/types.ts'], /noiseReductionMode: string;/, 'String parameter should not be SharedValue');
    assert.match(written['entities/film/model/types.ts'], /setSaturation: \(value: number\) => void;/, 'Film action setter should be defined');
    
    assert.ok(written['useFilmStore.ts']);
    assert.match(written['useFilmStore.ts'], /saturation: makeMutable\(1\.0\)/, 'Mutable initializer should be defined');
    assert.match(written['useFilmStore.ts'], /noiseReductionMode: "auto"/, 'String initializer should be normal value');
    assert.match(written['useFilmStore.ts'], /setSaturation: \(value\) =>/, 'Setter function should be defined');
    
    assert.ok(written['filmActions.ts']);
    assert.match(written['filmActions.ts'], /case 'saturation':/, 'Reset case for saturation should exist');
    assert.match(written['filmActions.ts'], /store.setSaturation\(1\.0\);/, 'Reset call for saturation should exist');

  } finally {
    fs.readFileSync = originalRead;
    fs.writeFileSync = originalWrite;
    fs.existsSync = originalExists;
  }
});
