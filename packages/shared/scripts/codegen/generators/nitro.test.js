const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const child_process = require('child_process');

let executedCommand = null;
const originalExec = child_process.execSync;
child_process.execSync = (command, options) => {
  executedCommand = command;
};

const { generateNitroConfig } = require('./nitro');

test('generateNitroConfig correctly generates Nitro specs and Kotlin overrides, and invokes Nitrogen compiler', () => {
  const originalRead = fs.readFileSync;
  const originalWrite = fs.writeFileSync;
  const originalExists = fs.existsSync;

  const written = {};
  executedCommand = null;

  fs.existsSync = (filePath) => true;

  const fileTemplates = {
    'NitroCameraConfiguration.nitro.ts': '  // @@GEN_PROPERTIES_START@@\n  // @@GEN_PROPERTIES_END@@',
    'HybridNitroCameraConfiguration.kt': '    // @@GEN_OVERRIDES_START@@\n    // @@GEN_OVERRIDES_END@@'
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
        nitro: true,
        ts: { type: 'number' },
        kotlin: { type: 'Float' }
      },
      {
        name: 'torchState',
        nitro: true,
        ts: { type: 'boolean' },
        kotlin: { type: 'Boolean' }
      }
    ];

    generateNitroConfig(mockParameters);

    assert.ok(Object.keys(written).length > 0, 'Should have written files');
    assert.ok(written['NitroCameraConfiguration.nitro.ts']);
    assert.match(written['NitroCameraConfiguration.nitro.ts'], /saturation: number;/, 'Should define saturation property');
    assert.match(written['NitroCameraConfiguration.nitro.ts'], /torchState: boolean;/, 'Should define torchState property');

    assert.ok(written['HybridNitroCameraConfiguration.kt']);
    assert.match(written['HybridNitroCameraConfiguration.kt'], /override var saturation: Double/, 'Should override var saturation');
    assert.match(written['HybridNitroCameraConfiguration.kt'], /override var torchState: Boolean/, 'Should override var torchState');

    assert.strictEqual(executedCommand, 'npx nitrogen .', 'Should invoke nitrogen CLI');

  } finally {
    fs.readFileSync = originalRead;
    fs.writeFileSync = originalWrite;
    fs.existsSync = originalExists;
    child_process.execSync = originalExec;
  }
});
