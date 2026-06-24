const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { generateControlData } = require('./controlData');

test('generateControlData correctly generates React Native UI control panel bindings', () => {
  const originalRead = fs.readFileSync;
  const originalWrite = fs.writeFileSync;
  const originalExists = fs.existsSync;

  const written = {};

  fs.existsSync = (filePath) => true;

  const fileTemplates = {
    'useFilmParameterControlData.ts': '// @@GEN_PARAMETER_TYPES_START@@\n// @@GEN_PARAMETER_TYPES_END@@\n        // @@GEN_STORE_SELECTION_START@@\n        // @@GEN_STORE_SELECTION_END@@\n      // @@GEN_CONTROL_CASES_START@@\n      // @@GEN_CONTROL_CASES_END@@'
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
        zustand: { store: 'film', name: 'saturation', default: '1.0' },
        ui: {
          name: 'Saturation',
          min: 0.0,
          max: 2.0,
          center: 1.0,
          formatter: 'percentage'
        }
      },
      {
        name: 'temperature',
        category: 'render',
        ts: { type: 'number' },
        zustand: { store: 'film', name: 'temperature', default: '5500.0' },
        ui: {
          name: 'Temperature',
          min: 2000.0,
          max: 10000.0,
          hasAuto: true,
          autoText: 'AWB',
          formatter: 'kelvin'
        }
      }
    ];

    generateControlData(mockParameters);

    assert.ok(Object.keys(written).length > 0, 'Should have written files');
    assert.ok(written['useFilmParameterControlData.ts']);

    assert.match(written['useFilmParameterControlData.ts'], /'Saturation'/, 'Should generate type union for Saturation');
    assert.match(written['useFilmParameterControlData.ts'], /'Temperature'/, 'Should generate type union for Temperature');
    assert.match(written['useFilmParameterControlData.ts'], /case 'Saturation':/, 'Should select Saturation store case');
    assert.match(written['useFilmParameterControlData.ts'], /case 'Temperature':/, 'Should select Temperature store case');
    assert.match(written['useFilmParameterControlData.ts'], /valueFormatter: \(v: number\) => \{/, 'Should generate value formatters');

  } finally {
    fs.readFileSync = originalRead;
    fs.writeFileSync = originalWrite;
    fs.existsSync = originalExists;
  }
});
