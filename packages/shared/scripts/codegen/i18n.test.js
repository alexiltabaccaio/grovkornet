const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const i18nCodegen = require('./i18n');
const { PROJECT_ROOT } = require('./utils/config-loader');

test('i18n Codegen validates locales and generates TypeScript definitions', (t) => {
  const enDir = path.resolve(PROJECT_ROOT, 'apps/mobile/src/app/providers/i18n/locales');
  const enPath = path.resolve(enDir, 'en.json');
  const itPath = path.resolve(enDir, 'it.json');
  const dtsPath = path.resolve(PROJECT_ROOT, 'apps/mobile/src/app/providers/i18n/i18next.d.ts');

  // Back up existing files if they exist (to avoid breaking real developer workspace)
  const backupEn = fs.existsSync(enPath) ? fs.readFileSync(enPath, 'utf8') : null;
  const backupIt = fs.existsSync(itPath) ? fs.readFileSync(itPath, 'utf8') : null;
  const backupDts = fs.existsSync(dtsPath) ? fs.readFileSync(dtsPath, 'utf8') : null;

  // Track if we created the directories
  const dtsDir = path.dirname(dtsPath);
  const createdEnDir = !fs.existsSync(enDir);
  const createdDtsDir = !fs.existsSync(dtsDir);

  try {
    // 1. Setup mock directories and files
    fs.mkdirSync(enDir, { recursive: true });
    fs.mkdirSync(dtsDir, { recursive: true });

    // Valid JSON with matching keys
    const mockEn = {
      translation: {
        welcome: "Welcome",
        nested: { key: "Value" }
      }
    };
    const mockIt = {
      translation: {
        welcome: "Benvenuto",
        nested: { key: "Valore" }
      }
    };

    fs.writeFileSync(enPath, JSON.stringify(mockEn, null, 2), 'utf8');
    fs.writeFileSync(itPath, JSON.stringify(mockIt, null, 2), 'utf8');

    if (fs.existsSync(dtsPath)) {
      fs.unlinkSync(dtsPath);
    }

    // 2. Run i18n codegen main function
    i18nCodegen.main();

    // 3. Verify target files and contents
    assert.ok(fs.existsSync(dtsPath), 'TypeScript definition file i18next.d.ts should be created');
    
    const dtsContent = fs.readFileSync(dtsPath, 'utf8');
    assert.match(dtsContent, /import 'react-i18next';/, 'd.ts should import react-i18next');
    assert.match(dtsContent, /resources: typeof en;/, 'd.ts should define resources type mapping');

    // 4. Verify validation warnings on missing keys (doesn't throw, just logs)
    const incompleteIt = {
      translation: {
        welcome: "Benvenuto"
        // missing "nested"
      }
    };
    fs.writeFileSync(itPath, JSON.stringify(incompleteIt, null, 2), 'utf8');
    
    // This should run and log warnings, but not crash
    i18nCodegen.main();

  } finally {
    // Restore backups or clean up created files
    if (backupEn !== null) {
      fs.writeFileSync(enPath, backupEn, 'utf8');
    } else {
      if (fs.existsSync(enPath)) fs.unlinkSync(enPath);
    }

    if (backupIt !== null) {
      fs.writeFileSync(itPath, backupIt, 'utf8');
    } else {
      if (fs.existsSync(itPath)) fs.unlinkSync(itPath);
    }

    if (backupDts !== null) {
      fs.writeFileSync(dtsPath, backupDts, 'utf8');
    } else {
      if (fs.existsSync(dtsPath)) fs.unlinkSync(dtsPath);
    }

    // Attempt to clean up directories we created
    if (createdEnDir && fs.existsSync(enDir)) {
      try {
        fs.rmdirSync(enDir);
      } catch (e) {
        // Directory might not be empty, ignore
      }
    }
    if (createdDtsDir && fs.existsSync(dtsDir)) {
      try {
        fs.rmdirSync(dtsDir);
      } catch (e) {
        // ignore
      }
    }
  }
});
