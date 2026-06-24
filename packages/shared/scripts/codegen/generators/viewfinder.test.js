const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { generateViewfinderProps } = require('./viewfinder');

test('generateViewfinderProps correctly generates Viewfinder props', () => {
  const originalRead = fs.readFileSync;
  const originalWrite = fs.writeFileSync;
  const originalExists = fs.existsSync;

  const written = {};

  fs.existsSync = (filePath) => true;

  const fileTemplates = {
    'Viewfinder.tsx': '    // @@GEN_SELECTOR_START@@\n    // @@GEN_SELECTOR_END@@\n      // @@GEN_ANIMATED_PROPS_START@@\n      // @@GEN_ANIMATED_PROPS_END@@\n        // @@GEN_PROPS_START@@\n        // @@GEN_PROPS_END@@'
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
        zustand: { store: 'film', name: 'saturation' }
      },
      {
        name: 'panelY',
        category: 'viewport',
        ts: { type: 'number' },
        zustand: { store: 'film', name: 'panelY' }
      }
    ];

    generateViewfinderProps(mockParameters);

    assert.ok(Object.keys(written).length > 0, 'Should have written files');
    assert.ok(written['Viewfinder.tsx']);

    assert.match(written['Viewfinder.tsx'], /saturation,/, 'Should contain saturation selector');
    assert.match(written['Viewfinder.tsx'], /panelY: panelY\.value,/, 'Should bind panelY in animatedProps');
    assert.match(written['Viewfinder.tsx'], /animatedProps=\{animatedProps\}/, 'Should set animatedProps JSX');

  } finally {
    fs.readFileSync = originalRead;
    fs.writeFileSync = originalWrite;
    fs.existsSync = originalExists;
  }
});
