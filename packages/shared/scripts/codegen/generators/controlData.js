const { FILE_PATHS, replaceBetweenMarkers } = require('../utils/helpers');

function generateControlData(parameters) {
  console.log('\n--- Generating Parameter Control Data ---');
  const filmParams = parameters.filter(p => p.zustand && (p.zustand.store || 'film') === 'film' && p.ui);

  // 1. Generate type union
  const typesContent = filmParams.map(p => `  | '${p.ui.name}'`).join('\n');
  replaceBetweenMarkers(FILE_PATHS.controlData, '// @@GEN_PARAMETER_TYPES_START@@', '// @@GEN_PARAMETER_TYPES_END@@', typesContent);

  // 2. Generate store selection cases
  const selectionCases = filmParams.map(p => {
    const uiName = p.ui.name;
    const storeProp = p.zustand.name || p.name;
    const capitalized = storeProp.charAt(0).toUpperCase() + storeProp.slice(1);
    
    const props = [`${storeProp}: s.${storeProp}`, `set${capitalized}: s.set${capitalized}`];
    
    // Check if it has auto toggle
    if (p.ui.hasAuto) {
      // Find the auto property name
      let autoProp = `${storeProp}Auto`;
      if (storeProp === 'tint') autoProp = 'temperatureAuto'; // tint shares temperatureAuto
      
      const capitalizedAuto = autoProp.charAt(0).toUpperCase() + autoProp.slice(1);
      props.push(`${autoProp}: s.${autoProp}`);
      props.push(`set${capitalizedAuto}: s.set${capitalizedAuto}`);
    }
    
    // Edge case for contrast
    if (storeProp === 'contrast') {
      props.push('contrastAuto: s.contrastAuto');
      props.push('setContrastAuto: s.setContrastAuto');
      props.push('setPivotAuto: s.setPivotAuto');
    }
    // Edge case for blackLevel
    if (storeProp === 'blackLevel') {
      props.push('blackLevelAuto: s.blackLevelAuto');
      props.push('setBlackLevelAuto: s.setBlackLevelAuto');
    }
    // Edge case for highlights
    if (storeProp === 'highlights') {
      props.push('highlightsAuto: s.highlightsAuto');
      props.push('setHighlightsAuto: s.setHighlightsAuto');
    }
    // Edge case for pivot
    if (storeProp === 'pivot') {
      props.push('pivotAuto: s.pivotAuto');
      props.push('setPivotAuto: s.setPivotAuto');
    }

    const uniqueProps = [...new Set(props)];
    
    return `        case '${uiName}':\n          return {\n            ${uniqueProps.join(',\n            ')}\n          };`;
  }).join('\n');

  replaceBetweenMarkers(FILE_PATHS.controlData, '        // @@GEN_STORE_SELECTION_START@@', '        // @@GEN_STORE_SELECTION_END@@', selectionCases, '        ');

  // 3. Generate control configs switch cases
  const uniqueDefaults = new Set();
  const configCases = filmParams.map(p => {
    const uiName = p.ui.name;
    const storeProp = p.zustand.name || p.name;
    const ui = p.ui;
    
    const capitalized = storeProp.charAt(0).toUpperCase() + storeProp.slice(1);
    const workletUpdateName = `update${capitalized}`;

    let valExpr = 'v';
    if (ui.formatterOffset !== undefined) {
      const offsetSign = ui.formatterOffset >= 0 ? '+' : '';
      valExpr = `(v ${offsetSign} ${ui.formatterOffset})`;
    }
    if (ui.formatterScale !== undefined) {
      valExpr = `(${valExpr} * ${ui.formatterScale})`;
    }

    let formatterFn = '';
    switch(ui.formatter) {
      case 'percentage':
        formatterFn = `(v: number) => {\n            'worklet';\n            return \`\${Math.round(${valExpr})}\`;\n          }`;
        break;
      case 'kelvin':
        formatterFn = `(v: number) => {\n            'worklet';\n            return \`\${Math.round(${valExpr})}K\`;\n          }`;
        break;
      case 'signed':
        formatterFn = `(v: number) => {\n            'worklet';\n            const rounded = Math.round(${valExpr});\n            return rounded > 0 ? \`+\${rounded}\` : \`\${rounded}\`;\n          }`;
        break;
      case 'multiplier':
        formatterFn = `(v: number) => {\n            'worklet';\n            return \`\${Math.round(${valExpr} * 10) / 10}x\`;\n          }`;
        break;
      case 'degree':
        formatterFn = `(v: number) => {\n            'worklet';\n            const rounded = Math.round(${valExpr});\n            return rounded > 0 ? \`+\${rounded}°\` : \`\${rounded}°\`;\n          }`;
        break;
      default:
        formatterFn = `(v: number) => {\n            'worklet';\n            return \`\${v}\`;\n          }`;
    }

    let fields = [
      `value: film.${storeProp}`,
      `minValue: ${ui.min.toFixed(1)}`,
      `maxValue: ${ui.max.toFixed(1)}`
    ];

    if (ui.center !== undefined) {
      fields.push(`centerValue: ${ui.center.toFixed(1)}`);
    }

    fields.push(`onChange: film.set${capitalized}`);
    fields.push(`onUpdateWorklet: filmWorklets.${workletUpdateName}`);

    if (ui.hasAuto) {
      let autoProp = `${storeProp}Auto`;
      if (storeProp === 'tint') autoProp = 'temperatureAuto';
      const capitalizedAuto = autoProp.charAt(0).toUpperCase() + autoProp.slice(1);
      
      fields.push(`isAuto: film.${autoProp}`);
      fields.push(`hideValueInAuto: true`);
      fields.push(`autoValueText: '${ui.autoText || 'AUTO'}'`);
      fields.push(`onReset: () => film.set${capitalizedAuto}(true)`);
      fields.push(`onToggleAuto: film.set${capitalizedAuto}`);
    } else {
      fields.push(`hideValueInAuto: false`);
      fields.push(`autoValueText: 'AUTO'`);
      
      // reset cases
      if (storeProp === 'contrast') {
        fields.push(`onReset: () => {\n            film.setContrastAuto(true);\n          }`);
        fields.push(`onResetGroup: () => {\n            film.setContrastAuto(true);\n            film.setPivotAuto(true);\n          }`);
      } else if (storeProp === 'blackLevel') {
        fields.push(`onReset: () => {\n            film.setBlackLevelAuto(true);\n          }`);
      } else if (storeProp === 'highlights') {
        fields.push(`onReset: () => {\n            film.setHighlightsAuto(true);\n          }`);
      } else if (storeProp === 'pivot') {
        fields.push(`onReset: () => {\n            film.setPivotAuto(true);\n          }`);
      } else {
        fields.push(`onReset: () => film.set${capitalized}(${p.zustand.default})`);
        if (p.zustand && p.zustand.default && typeof p.zustand.default === 'string' && p.zustand.default.startsWith('DEFAULT_')) {
          uniqueDefaults.add(p.zustand.default);
        }
      }
    }

    fields.push(`valueFormatter: ${formatterFn}`);

    return `      case '${uiName}':\n        return {\n          ${fields.join(',\n          ')}\n        };`;
  }).join('\n');

  replaceBetweenMarkers(FILE_PATHS.controlData, '      // @@GEN_CONTROL_CASES_START@@', '      // @@GEN_CONTROL_CASES_END@@', configCases, '      ');

  // 4. Generate imports
  const importsContent = `import {\n  ${Array.from(uniqueDefaults).join(',\n  ')}\n} from '@grovkornet/shared';`;
  replaceBetweenMarkers(FILE_PATHS.controlData, '// @@GEN_IMPORTS_START@@', '// @@GEN_IMPORTS_END@@', importsContent, '');
}

module.exports = {
  generateControlData,
};
