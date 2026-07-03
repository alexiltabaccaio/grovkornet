const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { generatePresetSettings } = require('./preset');

test('generatePresetSettings correctly outputs preset interfaces, defaults, and actions', () => {
  const originalRead = fs.readFileSync;
  const originalWrite = fs.writeFileSync;
  const originalExists = fs.existsSync;

  const written = {};

  fs.existsSync = (filePath) => true;

  const fileTemplates = {
    'types.ts': '// @@GEN_PAYLOAD_INTERFACES_START@@\n// @@GEN_PAYLOAD_INTERFACES_END@@\n// @@GEN_MASTER_PAYLOAD_START@@\n// @@GEN_MASTER_PAYLOAD_END@@\n// @@GEN_PAYLOAD_EXCLUDED_START@@\n// @@GEN_PAYLOAD_EXCLUDED_END@@\n// @@GEN_PAYLOAD_ACTIONS_START@@\n// @@GEN_PAYLOAD_ACTIONS_END@@',
    'usePresetStore.ts': '// @@GEN_IMPORTS_START@@\n// @@GEN_IMPORTS_END@@\n// @@GEN_PAYLOAD_DEFAULTS_START@@\n// @@GEN_PAYLOAD_DEFAULTS_END@@\n// @@GEN_MASTER_DEFAULTS_START@@\n// @@GEN_MASTER_DEFAULTS_END@@',
    'presetActions.ts': '// @@GEN_SNAPSHOT_START@@\n// @@GEN_SNAPSHOT_END@@\n// @@GEN_NORMALIZE_START@@\n// @@GEN_NORMALIZE_END@@\n// @@GEN_EQUAL_START@@\n// @@GEN_EQUAL_END@@\n// @@GEN_APPLY_START@@\n// @@GEN_APPLY_END@@\n// @@GEN_SYNC_NATIVE_START@@\n// @@GEN_SYNC_NATIVE_END@@'
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
        zustand: { store: 'film', name: 'saturation', default: 'DEFAULT_SATURATION' },
        includeInPreset: true
      },
      {
        name: 'noiseReductionMode',
        zustand: { store: 'film', name: 'noiseReductionMode', default: 'DEFAULT_NOISE_REDUCTION', type: 'string' },
        includeInPreset: false
      }
    ];

    generatePresetSettings(mockParameters);

    assert.ok(Object.keys(written).length > 0, 'Should have written files');
    assert.ok(written['types.ts']);
    assert.match(written['types.ts'], /export interface FilmPresetPayload/, 'Should generate FilmPresetPayload interface');
    assert.match(written['types.ts'], /saturation: number;/, 'Should include saturation field');
    assert.match(written['types.ts'], /export type GeneratedFilmExcludedKeys =\n  \| 'noiseReductionMode'/, 'Should list excluded keys');

    assert.ok(written['usePresetStore.ts']);
    assert.match(written['usePresetStore.ts'], /DEFAULT_SATURATION,/, 'Should generate import for DEFAULT_SATURATION');
    assert.match(written['usePresetStore.ts'], /export const DEFAULT_FILM_PAYLOAD: FilmPresetPayload = \{/, 'Should generate DEFAULT_FILM_PAYLOAD constant');

    assert.ok(written['presetActions.ts']);
    assert.match(written['presetActions.ts'], /film: snapshotStorePayload/, 'Should generate snapshot logic for film store');
    assert.match(written['presetActions.ts'], /areStorePayloadsEqual/, 'Should generate equal check logic');
    assert.match(written['presetActions.ts'], /applyStorePayload/, 'Should generate apply logic');

  } finally {
    fs.readFileSync = originalRead;
    fs.writeFileSync = originalWrite;
    fs.existsSync = originalExists;
  }
});
