const { FILE_PATHS, replaceBetweenMarkers } = require('../utils/helpers');

function generateWorklets(parameters) {
  console.log('\n--- Generating Worklets ---');
  const filmParams = parameters.filter(p => p.zustand && (p.zustand.store || 'film') === 'film');

  const flagsContent = filmParams
    .filter(p => {
      const isNumeric = p.ts?.type === 'number' || (p.zustand && p.zustand.type === 'number') || (!p.ts?.type && (!p.zustand || p.zustand.type !== 'boolean'));
      return isNumeric;
    })
    .map(p => {
      const name = p.zustand.name || p.name;
      return `const hasWarnedNaN_${name} = useSharedValue(false);`;
    })
    .join('\n');

  const content = filmParams.map(p => {
    const name = p.zustand.name || p.name;
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    const wConfig = p.worklet || {};
    const isNumeric = p.ts?.type === 'number' || (p.zustand && p.zustand.type === 'number') || (!p.ts?.type && (!p.zustand || p.zustand.type !== 'boolean'));

    let body = "    'worklet';\n";
    let valVar = 'value';

    if (isNumeric) {
      body += `    if (isNaN(value)) {\n`;
      body += `      if (__DEV__ && !hasWarnedNaN_${name}.value) {\n`;
      body += `        hasWarnedNaN_${name}.value = true;\n`;
      body += `        console.warn(\`[Camera Codegen Warning]: NaN value intercepted for parameter '${name}'\`);\n`;
      body += `      }\n`;
      body += `      return;\n`;
      body += `    }\n`;

      let clampMin = null;
      let clampMax = null;

      if (wConfig.clamp) {
        [clampMin, clampMax] = wConfig.clamp;
      } else if (p.ui && typeof p.ui.min === 'number' && typeof p.ui.max === 'number') {
        clampMin = p.ui.min;
        clampMax = p.ui.max;
      }

      if (clampMin !== null && clampMax !== null) {
        body += `    const safeValue = Math.min(Math.max(value, ${clampMin.toFixed(1)}), ${clampMax.toFixed(1)});\n`;
        valVar = 'safeValue';
      }
    }

    body += `    updateSharedValue(film.${name}, ${valVar});\n`;
    if (p.nitro) {
      body += `    config.${p.name} = ${valVar};\n`;
    }

    if (wConfig.sideEffects) {
      wConfig.sideEffects.forEach(se => {
        const resolvedValue = se.value.replace('value', valVar);
        body += `    updateSharedValue(film.${se.target}, ${resolvedValue});\n`;
        
        const targetParam = parameters.find(pr => pr.name === se.target || (pr.zustand && pr.zustand.name === se.target));
        if (targetParam && targetParam.nitro) {
          body += `    config.${targetParam.name} = ${resolvedValue};\n`;
        }
      });
    }

    return `    const update${capitalized} = (value: ${p.ts?.type || 'number'}) => {\n${body}    };`;
  }).join('\n\n');

  const exportsContent = filmParams.map(p => {
    const name = p.zustand.name || p.name;
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    return `update${capitalized},`;
  }).join('\n      ');

  replaceBetweenMarkers(FILE_PATHS.worklets, '  // @@GEN_WORKLET_FLAGS_START@@', '  // @@GEN_WORKLET_FLAGS_END@@', flagsContent, '  ');
  replaceBetweenMarkers(FILE_PATHS.worklets, '    // @@GEN_WORKLETS_START@@', '    // @@GEN_WORKLETS_END@@', content, '    ');
  replaceBetweenMarkers(FILE_PATHS.worklets, '      // @@GEN_WORKLET_EXPORTS_START@@', '      // @@GEN_WORKLET_EXPORTS_END@@', exportsContent, '      ');
}

module.exports = {
  generateWorklets,
};
