const { FILE_PATHS, replaceBetweenMarkers } = require('../utils/helpers');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generatePresetSettings(parameters) {
  console.log('\n--- Generating Preset Settings (Step 6) ---');
  
  // Detect all unique stores across parameters
  const stores = Array.from(
    new Set(
      parameters
        .filter(p => p.zustand)
        .map(p => p.zustand.store || 'film')
    )
  ).sort();

  // 1. Generate store-specific and master PresetPayload interfaces in types.ts
  const interfacesContent = stores
    .map(store => {
      const presetParams = parameters.filter(
        p => p.zustand && (p.zustand.store || 'film') === store && p.includeInPreset === true
      );
      const fields = presetParams
        .map(p => {
          const name = p.zustand.name || p.name;
          const type = p.zustand.type || (p.ts?.type === 'boolean' ? 'boolean' : 'number');
          return `  ${name}: ${type};`;
        })
        .join('\n');
      return `export interface ${capitalize(store)}PresetPayload {\n${fields ? fields + '\n' : ''}}`;
    })
    .join('\n\n');
  replaceBetweenMarkers(FILE_PATHS.presetTypes, '// @@GEN_PAYLOAD_INTERFACES_START@@', '// @@GEN_PAYLOAD_INTERFACES_END@@', interfacesContent, '');

  const masterPayloadContent = `export interface PresetPayload {\n` +
    stores.map(store => `  ${store}: ${capitalize(store)}PresetPayload;`).join('\n') +
    `\n}`;
  replaceBetweenMarkers(FILE_PATHS.presetTypes, '// @@GEN_MASTER_PAYLOAD_START@@', '// @@GEN_MASTER_PAYLOAD_END@@', masterPayloadContent, '');

  // 1.5. Generate store-specific ExcludedKeys union in types.ts
  const excludedContent = stores
    .map(store => {
      const excludedParams = parameters.filter(
        p => p.zustand && (p.zustand.store || 'film') === store && p.includeInPreset === false
      );
      const union = excludedParams
        .map(p => {
          const name = p.zustand.name || p.name;
          return `  | '${name}'`;
        })
        .join('\n');
      return `export type Generated${capitalize(store)}ExcludedKeys =\n${union ? union : '  | never'}\n  ;`;
    })
    .join('\n\n');
  replaceBetweenMarkers(FILE_PATHS.presetTypes, '// @@GEN_PAYLOAD_EXCLUDED_START@@', '// @@GEN_PAYLOAD_EXCLUDED_END@@', excludedContent, '');

  // 1.6. Generate store-specific ActionKeys union in types.ts
  const actionsContent = stores
    .map(store => {
      const allParams = parameters.filter(
        p => p.zustand && (p.zustand.store || 'film') === store
      );
      const union = allParams
        .map(p => {
          const name = p.zustand.name || p.name;
          return `  | 'set${capitalize(name)}'`;
        })
        .join('\n');
      return `export type Generated${capitalize(store)}ActionKeys =\n${union ? union : '  | never'}\n  ;`;
    })
    .join('\n\n');
  replaceBetweenMarkers(FILE_PATHS.presetTypes, '// @@GEN_PAYLOAD_ACTIONS_START@@', '// @@GEN_PAYLOAD_ACTIONS_END@@', actionsContent, '');

  // 2. Generate @grovkornet/shared imports in usePresetStore.ts
  const defaults = new Set();
  parameters.forEach(p => {
    if (p.zustand && p.zustand.default && p.zustand.default.startsWith('DEFAULT_') && p.includeInPreset === true) {
      defaults.add(p.zustand.default);
    }
  });
  const importsContent = Array.from(defaults)
    .sort()
    .map(d => `${d},`)
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.presetStore, '// @@GEN_IMPORTS_START@@', '// @@GEN_IMPORTS_END@@', importsContent, '  ');

  // 3. Generate store-specific and master DEFAULT_PRESET_PAYLOAD in usePresetStore.ts
  const defaultsPayloadContent = stores
    .map(store => {
      const presetParams = parameters.filter(
        p => p.zustand && (p.zustand.store || 'film') === store && p.includeInPreset === true
      );
      const fields = presetParams
        .map(p => {
          const name = p.zustand.name || p.name;
          const def = p.zustand.default;
          return `  ${name}: ${def},`;
        })
        .join('\n');
      return `export const DEFAULT_${store.toUpperCase()}_PAYLOAD: ${capitalize(store)}PresetPayload = {\n${fields ? fields + '\n' : ''}};`;
    })
    .join('\n\n');
  replaceBetweenMarkers(FILE_PATHS.presetStore, '// @@GEN_PAYLOAD_DEFAULTS_START@@', '// @@GEN_PAYLOAD_DEFAULTS_END@@', defaultsPayloadContent, '');

  const masterDefaultsContent = `export const DEFAULT_PRESET_PAYLOAD: PresetPayload = {\n` +
    stores.map(store => `  ${store}: DEFAULT_${store.toUpperCase()}_PAYLOAD,`).join('\n') +
    `\n};`;
  replaceBetweenMarkers(FILE_PATHS.presetStore, '// @@GEN_MASTER_DEFAULTS_START@@', '// @@GEN_MASTER_DEFAULTS_END@@', masterDefaultsContent, '');

  // 4. Generate dynamic marker injections in presetActions.ts
  // 4.1. Snapshot injection
  const snapshotContent = stores
    .map(store => `    ${store}: snapshotStorePayload(use${capitalize(store)}Store.getState(), DEFAULT_${store.toUpperCase()}_PAYLOAD),`)
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.presetActions, '// @@GEN_SNAPSHOT_START@@', '// @@GEN_SNAPSHOT_END@@', snapshotContent, '    ');

  // 4.2. Normalize injection
  const normalizeContent = stores
    .map(store => `    ${store}: normalizeStorePayload(p.${store}, DEFAULT_${store.toUpperCase()}_PAYLOAD),`)
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.presetActions, '// @@GEN_NORMALIZE_START@@', '// @@GEN_NORMALIZE_END@@', normalizeContent, '    ');

  // 4.3. Equal injection
  const equalContent = stores
    .map(store => `  if (!areStorePayloadsEqual(n1.${store}, n2.${store}, DEFAULT_${store.toUpperCase()}_PAYLOAD)) return false;`)
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.presetActions, '// @@GEN_EQUAL_START@@', '// @@GEN_EQUAL_END@@', equalContent, '  ');

  // 4.4. Apply injection
  const applyContent = stores
    .map(store => `  const target${capitalize(store)} = applyStorePayload(use${capitalize(store)}Store.getState(), DEFAULT_${store.toUpperCase()}_PAYLOAD, payload.${store});\n  syncPayloadToNitro(target${capitalize(store)});`)
    .join('\n\n');
  replaceBetweenMarkers(FILE_PATHS.presetActions, '// @@GEN_APPLY_START@@', '// @@GEN_APPLY_END@@', applyContent, '  ');

  // 4.5. Sync runtime to native injection
  const syncNativeContent = stores
    .map(store => `  const target${capitalize(store)} = snapshotStorePayload(use${capitalize(store)}Store.getState(), DEFAULT_${store.toUpperCase()}_PAYLOAD);\n  syncPayloadToNitro(target${capitalize(store)});`)
    .join('\n\n');
  replaceBetweenMarkers(FILE_PATHS.presetActions, '// @@GEN_SYNC_NATIVE_START@@', '// @@GEN_SYNC_NATIVE_END@@', syncNativeContent, '  ');
}

module.exports = {
  generatePresetSettings
};
