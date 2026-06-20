const { FILE_PATHS, replaceBetweenMarkers } = require('../utils/helpers');

function generateViewfinderProps(parameters) {
  console.log('\n--- Generating Viewfinder Props (Step 5) ---');
  
  const VIEWFINDER_PROP_EXPRESSIONS = {
    exposureTime: 'resolvedShutterSpeed as unknown as SharedValue<number | undefined>',
    temperature: 'temperature as unknown as SharedValue<number | undefined>',
    temperatureAuto: 'temperatureAuto as unknown as SharedValue<boolean | undefined>',
    torchStrength: 'resolvedTorchStrength as unknown as SharedValue<number | undefined>',
    noiseReduction: 'resolvedNoiseReduction as unknown as SharedValue<number | undefined>',
    previewQuality: 'previewQuality as unknown as SharedValue<number | undefined>',
    targetFps: 'effectiveFps as unknown as SharedValue<number | undefined>',
    cameraAspectRatio: 'aspectRatio as unknown as SharedValue<number | undefined>',
    cameraId: 'cameraAuto ? null : cameraId',
    autoFocus: 'focusAuto as unknown as SharedValue<boolean | undefined>',
    iso: 'resolvedIso as unknown as SharedValue<number | undefined>',
    focusDistance: 'resolvedFocusDistance as unknown as SharedValue<number | undefined>',
    torchState: 'torchState as unknown as SharedValue<number | undefined>',
    force60fpsCrop: 'resolvedForce60fpsCrop as unknown as SharedValue<boolean | undefined>',
    secureViewEnabled: 'isCameraSecure',
    panelY: 'panelY as unknown as SharedValue<number | undefined>'
  };

  // 1. Selector destructuring (FILM store parameters ONLY)
  const selectorParams = parameters.filter(p => p.zustand && (p.zustand.store || 'film') === 'film' && !p.nitro);
  const selectorContent = selectorParams
    .map(p => {
      const name = p.zustand.name || p.name;
      return `${name},`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.zustandViewfinder, '    // @@GEN_SELECTOR_START@@', '    // @@GEN_SELECTOR_END@@', selectorContent, '    ');

  // 2. Filter prop params
  const OTHER_DESTRUCTURED_PROPS = new Set(['isoAuto', 'shutterSpeedAuto', 'focusDistance', 'iso', 'ev', 'resolutionSetting', 'panelY']);
  const propParams = parameters.filter(p => {
    if (!p.ts || !p.ts.type) return false;
    const propName = p.ts.name || p.name;
    return VIEWFINDER_PROP_EXPRESSIONS[propName] || p.zustand || OTHER_DESTRUCTURED_PROPS.has(propName);
  });

  // 3. Generate animated props content for useAnimatedProps
  const animatedPropsContent = propParams
    .filter(p => {
      const propName = p.ts.name || p.name;
      return propName !== 'cameraId' && propName !== 'secureViewEnabled' && !p.nitro;
    })
    .map(p => {
      const propName = p.ts.name || p.name;
      const stateName = p.zustand?.name || p.name;
      
      let baseVar = stateName;
      if (VIEWFINDER_PROP_EXPRESSIONS[propName]) {
        const expr = VIEWFINDER_PROP_EXPRESSIONS[propName];
        if (expr.includes(' as ')) {
          baseVar = expr.split(' as ')[0];
        }
      }
      return `${propName}: ${baseVar}.value,`;
    })
    .join('\n');
  replaceBetweenMarkers(FILE_PATHS.zustandViewfinder, '      // @@GEN_ANIMATED_PROPS_START@@', '      // @@GEN_ANIMATED_PROPS_END@@', animatedPropsContent, '      ');

  // 4. Generate JSX Props
  const propsContent = `animatedProps={animatedProps}
cameraId={cameraAuto ? null : cameraId}
secureViewEnabled={isCameraSecure}`;
  replaceBetweenMarkers(FILE_PATHS.zustandViewfinder, '        // @@GEN_PROPS_START@@', '        // @@GEN_PROPS_END@@', propsContent, '        ');
}

module.exports = {
  generateViewfinderProps
};
