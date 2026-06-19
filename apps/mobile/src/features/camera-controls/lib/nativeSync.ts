// ⚠️ AI WARNING: Before modifying this cross-platform sync logic, query the dependency graph: node packages/shared/scripts/graphrag/query.js <query>
import { useFilmStore, setFilmStoreListener, getNitroConfig } from '@entities/film';
import { setBodyStoreListener } from '@entities/body';
import { usePresetStore, DEFAULT_FILM_PAYLOAD, DEFAULT_BODY_PAYLOAD } from '@entities/preset';
import { markAsCustomized } from '@features/system-settings';

let syncTimeout: NodeJS.Timeout | null = null;
let customizeTimeout: NodeJS.Timeout | null = null;

const SYNC_MAP: Record<string, string> = {
  saturation: 'saturation',
  contrast: 'contrast',
  grainIntensity: 'grainIntensity',
  grainChroma: 'grainChroma',
  grainSize: 'grainSize',
  grainSpeed: 'grainSpeed',
  vignetteIntensity: 'vignetteIntensity',
  chromaShift: 'chromaShift',
  temperature: 'whiteBalance', // Map temperature in store to whiteBalance in JSI
  tint: 'tint',
  bloomIntensity: 'bloomIntensity',
  chromaticAberration: 'chromaticAberration',
  chromaShiftDirection: 'chromaShiftDirection',
  sharpening: 'sharpening',
  satRed: 'satRed',
  satOrange: 'satOrange',
  satYellow: 'satYellow',
  satGreen: 'satGreen',
  satCyan: 'satCyan',
  satBlue: 'satBlue',
  satPurple: 'satPurple',
  satMagenta: 'satMagenta',
  aberrationInvert: 'aberrationInvert',
  boundMagentaRed: 'boundMagentaRed',
  boundRedOrange: 'boundRedOrange',
  boundOrangeYellow: 'boundOrangeYellow',
  boundYellowGreen: 'boundYellowGreen',
  boundGreenCyan: 'boundGreenCyan',
  boundCyanBlue: 'boundCyanBlue',
  boundBluePurple: 'boundBluePurple',
  boundPurpleMagenta: 'boundPurpleMagenta',
  grainRoughness: 'grainRoughness',
  grainEnabled: 'grainEnabled',
  bloomEnabled: 'bloomEnabled',
  blackLevel: 'blackLevel',
  highlights: 'highlights',
  pivot: 'pivot',
  contrastAuto: 'contrastAuto',
  blackLevelAuto: 'blackLevelAuto',
  highlightsAuto: 'highlightsAuto',
  pivotAuto: 'pivotAuto',
  pixelationFactor: 'pixelationFactor',
  tapeJitter: 'tapeJitter',
  scanlines: 'scanlines',
  scanlinesHorizontal: 'scanlinesHorizontal',
  scanlinesMode: 'scanlinesMode',
  scanlinesDensity: 'scanlinesDensity',
  chromaShiftInvert: 'chromaShiftInvert',
  hue: 'hue',
  hueRed: 'hueRed',
  hueOrange: 'hueOrange',
  hueYellow: 'hueYellow',
  hueGreen: 'hueGreen',
  hueCyan: 'hueCyan',
  hueBlue: 'hueBlue',
  huePurple: 'huePurple',
  hueMagenta: 'hueMagenta',
};

export const initNativeSync = () => {
  // Listen to film store changes and sync to native + mark as customized
  setFilmStoreListener((paramName) => {
    const presetStore = usePresetStore.getState();
    if (presetStore.isApplyingPreset) return;

    // 1. Debounce and sync parameters to Nitro JSI config
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      try {
        const nitro = getNitroConfig();
        const state = useFilmStore.getState();
        
        const stateRecord = state as unknown as Record<string, unknown>;
        const nitroRecord = nitro as unknown as Record<string, unknown>;

        Object.keys(SYNC_MAP).forEach((storeKey) => {
          const nitroKey = SYNC_MAP[storeKey];
          const sharedValue = stateRecord[storeKey];
          
          if (sharedValue && typeof sharedValue === 'object' && 'value' in sharedValue) {
            const currentValue = sharedValue.value;
            if (nitroRecord[nitroKey] !== currentValue) {
              nitroRecord[nitroKey] = currentValue;
            }
          }
        });
      } catch (e) {
        console.error('[nativeSync] Failed to sync film parameters to Nitro:', e);
      }
    }, 50);

    // 2. Debounce marking as customized
    if (paramName && !(paramName in DEFAULT_FILM_PAYLOAD)) {
      return;
    }

    if (customizeTimeout) clearTimeout(customizeTimeout);
    customizeTimeout = setTimeout(() => {
      markAsCustomized();
    }, 50);
  });

  // Listen to body store changes to mark preset as customized (e.g. EV, shutter speed changes)
  setBodyStoreListener((paramName) => {
    const presetStore = usePresetStore.getState();
    if (presetStore.isApplyingPreset) return;

    if (paramName && !(paramName in DEFAULT_BODY_PAYLOAD)) {
      return;
    }

    if (customizeTimeout) clearTimeout(customizeTimeout);
    customizeTimeout = setTimeout(() => {
      markAsCustomized();
    }, 50);
  });
};
