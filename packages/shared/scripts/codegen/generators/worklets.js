const { FILE_PATHS, replaceBetweenMarkers } = require('../utils/helpers');

function generateWorklets(parameters) {
  console.log('\n--- Generating Worklets ---');
  const filmParams = parameters.filter(p => p.zustand && (p.zustand.store || 'film') === 'film');

  const content = filmParams.map(p => {
    const name = p.zustand.name || p.name;
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    const wConfig = p.worklet || {};

    let body = "    'worklet';\n";
    let valVar = 'value';

    if (wConfig.clamp) {
      const [minVal, maxVal] = wConfig.clamp;
      body += `    const safeValue = Math.min(Math.max(value, ${minVal.toFixed(1)}), ${maxVal.toFixed(1)});\n`;
      valVar = 'safeValue';
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

  replaceBetweenMarkers(FILE_PATHS.worklets, '    // @@GEN_WORKLETS_START@@', '    // @@GEN_WORKLETS_END@@', content, '    ');
  replaceBetweenMarkers(FILE_PATHS.worklets, '      // @@GEN_WORKLET_EXPORTS_START@@', '      // @@GEN_WORKLET_EXPORTS_END@@', exportsContent, '      ');
}

module.exports = {
  generateWorklets,
};
