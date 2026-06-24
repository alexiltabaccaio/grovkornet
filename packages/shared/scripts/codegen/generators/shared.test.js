const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { generateSharedIndex } = require('./shared');

test('generateSharedIndex correctly writes index.ts', () => {
  const originalWrite = fs.writeFileSync;
  let writtenPath = null;
  let writtenContent = null;

  fs.writeFileSync = (filePath, content, options) => {
    writtenPath = filePath;
    writtenContent = content;
  };

  try {
    const mockData = {
      constants: {
        DEFAULT_SATURATION: 1.0,
        DEFAULT_CONTRAST: 1.2,
        APP_NAME: 'Grovkornet',
      }
    };

    generateSharedIndex(mockData);

    assert.ok(writtenPath, 'writeFileSync should have been called');
    assert.match(writtenPath, /index\.ts$/, 'should write to index.ts');
    assert.match(writtenContent, /export const DEFAULT_SATURATION = 1;/, 'should contain DEFAULT_SATURATION');
    assert.match(writtenContent, /export const DEFAULT_CONTRAST = 1\.2;/, 'should contain DEFAULT_CONTRAST');
    assert.match(writtenContent, /export const APP_NAME = "Grovkornet";/, 'should contain APP_NAME');
    assert.match(writtenContent, /export \* from '\.\/hardwareConfig';/, 'should export hardwareConfig');
  } finally {
    fs.writeFileSync = originalWrite;
  }
});
