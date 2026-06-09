const { FILE_PATHS, replaceBetweenMarkers } = require('../utils/helpers');

function generatePresetSettings(parameters) {
  console.log('\n--- Generating Preset Settings (Step 6) ---');
  
  const zustandParams = parameters.filter(p => p.zustand && (p.zustand.store || 'film') === 'film' && !p.excludeFromPreset);
  
  // 1. Generate FilmPresetPayload fields in types.ts
  const fieldsContent = zustandParams
    .map(p => {
      const name = p.zustand.name || p.name;
      const type = p.zustand.type || (p.ts?.type === 'boolean' ? 'boolean' : 'number');
      return `${name}: ${type};`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.presetTypes, '  // @@GEN_FILM_PAYLOAD_START@@', '  // @@GEN_FILM_PAYLOAD_END@@', fieldsContent, '  ');

  // 1.5. Generate GeneratedFilmExcludedKeys union in types.ts
  const excludedParams = parameters.filter(p => p.zustand && (p.zustand.store || 'film') === 'film' && p.excludeFromPreset);
  const excludedContent = excludedParams
    .map(p => {
      const name = p.zustand.name || p.name;
      return `| '${name}'`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.presetTypes, '  // @@GEN_FILM_EXCLUDED_START@@', '  // @@GEN_FILM_EXCLUDED_END@@', excludedContent, '  ');

  // 2. Generate @grovkornet/shared imports in usePresetStore.ts
  const defaults = new Set(['DEFAULT_ISO', 'DEFAULT_EV', 'DEFAULT_SHUTTER_SPEED']);
  parameters.forEach(p => {
    if (p.zustand && p.zustand.default && p.zustand.default.startsWith('DEFAULT_')) {
      defaults.add(p.zustand.default);
    }
  });
  const importsContent = Array.from(defaults)
    .sort()
    .map(d => `${d},`)
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.presetStore, '  // @@GEN_IMPORTS_START@@', '  // @@GEN_IMPORTS_END@@', importsContent, '  ');

  // 3. Generate DEFAULT_FILM_PAYLOAD in usePresetStore.ts
  const defaultsContent = zustandParams
    .map(p => {
      const name = p.zustand.name || p.name;
      const def = p.zustand.default;
      return `${name}: ${def},`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.presetStore, '  // @@GEN_DEFAULTS_START@@', '  // @@GEN_DEFAULTS_END@@', defaultsContent, '  ');
}

module.exports = {
  generatePresetSettings
};
