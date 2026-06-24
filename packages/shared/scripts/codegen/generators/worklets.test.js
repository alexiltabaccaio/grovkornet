const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { generateWorklets } = require('./worklets');

test('generateWorklets correctly generates React Native Reanimated worklet setters', () => {
  const originalRead = fs.readFileSync;
  const originalWrite = fs.writeFileSync;
  const originalExists = fs.existsSync;

  const written = {};

  fs.existsSync = (filePath) => true;

  const fileTemplates = {
    'useFilmWorklets.ts': '  // @@GEN_WORKLET_FLAGS_START@@\n  // @@GEN_WORKLET_FLAGS_END@@\n    // @@GEN_WORKLETS_START@@\n    // @@GEN_WORKLETS_END@@\n      // @@GEN_WORKLET_EXPORTS_START@@\n      // @@GEN_WORKLET_EXPORTS_END@@'
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
        zustand: { store: 'film', name: 'saturation' },
        worklet: { clamp: [0.0, 2.0] },
        nitro: true
      },
      {
        name: 'noiseReductionMode',
        category: 'render',
        ts: { type: 'string' },
        zustand: { store: 'film', name: 'noiseReductionMode', type: 'string' }
      }
    ];

    generateWorklets(mockParameters);

    assert.ok(Object.keys(written).length > 0, 'Should have written files');
    assert.ok(written['useFilmWorklets.ts']);

    assert.match(written['useFilmWorklets.ts'], /const hasWarnedNaN_saturation = useSharedValue\(false\);/, 'Should generate flags');
    assert.match(written['useFilmWorklets.ts'], /const updateSaturation = \(value: number\) => \{/, 'Should generate saturation updater worklet');
    assert.match(written['useFilmWorklets.ts'], /Math\.min\(Math\.max\(value, 0\.0\), 2\.0\)/, 'Should clamp saturation');
    assert.match(written['useFilmWorklets.ts'], /updateNoiseReductionMode,/, 'Should export noiseReductionMode updater');

  } finally {
    fs.readFileSync = originalRead;
    fs.writeFileSync = originalWrite;
    fs.existsSync = originalExists;
  }
});
