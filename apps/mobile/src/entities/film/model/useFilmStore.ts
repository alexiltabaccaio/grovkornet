import { create } from 'zustand';
import { makeMutable } from 'react-native-reanimated';
import { logger } from '@shared/lib/logger';
import { FilmStore } from './types';
import { 
  DEFAULT_GRAIN_INTENSITY, 
  DEFAULT_SATURATION, 
  DEFAULT_CONTRAST, 
  DEFAULT_CHROMATIC_ABERRATION,
  DEFAULT_TEMPERATURE,
  DEFAULT_TINT,
  DEFAULT_GRAIN_SPEED,
  DEFAULT_SELECTIVE_SATURATION,
  DEFAULT_BOUND_MAGENTA_RED,
  DEFAULT_BOUND_RED_ORANGE,
  DEFAULT_BOUND_ORANGE_YELLOW,
  DEFAULT_BOUND_YELLOW_GREEN,
  DEFAULT_BOUND_GREEN_CYAN,
  DEFAULT_BOUND_CYAN_BLUE,
  DEFAULT_BOUND_BLUE_PURPLE,
  DEFAULT_BOUND_PURPLE_MAGENTA,
  DEFAULT_PIXELATION_FACTOR,
} from '@grovkornet/shared';

export const useFilmStore = create<FilmStore>((set, get) => ({
  // @@GEN_INIT_START@@
  saturation: makeMutable(DEFAULT_SATURATION),
  contrast: makeMutable(DEFAULT_CONTRAST),
  grainIntensity: makeMutable(DEFAULT_GRAIN_INTENSITY),
  grainChroma: makeMutable(0.0),
  grainSize: makeMutable(1.0),
  grainSpeed: makeMutable(DEFAULT_GRAIN_SPEED),
  vignetteIntensity: makeMutable(0.0),
  temperature: makeMutable(DEFAULT_TEMPERATURE),
  tint: makeMutable(DEFAULT_TINT),
  bloomIntensity: makeMutable(0.0),
  chromaticAberration: makeMutable(DEFAULT_CHROMATIC_ABERRATION),
  aberrationDirection: makeMutable(0),
  sharpening: makeMutable(0.0),
  satRed: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satOrange: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satYellow: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satGreen: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satCyan: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satBlue: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satPurple: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satMagenta: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  aberrationInvert: makeMutable(false),
  boundMagentaRed: makeMutable(DEFAULT_BOUND_MAGENTA_RED),
  boundRedOrange: makeMutable(DEFAULT_BOUND_RED_ORANGE),
  boundOrangeYellow: makeMutable(DEFAULT_BOUND_ORANGE_YELLOW),
  boundYellowGreen: makeMutable(DEFAULT_BOUND_YELLOW_GREEN),
  boundGreenCyan: makeMutable(DEFAULT_BOUND_GREEN_CYAN),
  boundCyanBlue: makeMutable(DEFAULT_BOUND_CYAN_BLUE),
  boundBluePurple: makeMutable(DEFAULT_BOUND_BLUE_PURPLE),
  boundPurpleMagenta: makeMutable(DEFAULT_BOUND_PURPLE_MAGENTA),
  grainRoughness: makeMutable(0.0),
  grainEnabled: makeMutable(false),
  bloomEnabled: makeMutable(false),
  noiseReductionMode: makeMutable(1),
  noiseReductionAuto: makeMutable(true),
  temperatureAuto: makeMutable(true),
  isSelfieCamera: makeMutable(false),
  blackLevel: makeMutable(0.0),
  highlights: makeMutable(1.0),
  pivot: makeMutable(0.5),
  contrastAuto: makeMutable(true),
  blackLevelAuto: makeMutable(true),
  highlightsAuto: makeMutable(true),
  pivotAuto: makeMutable(true),
  pixelationFactor: makeMutable(DEFAULT_PIXELATION_FACTOR),
  // @@GEN_INIT_END@@
  capabilities: {
    availableNoiseReductionModes: [],
    availableEdgeModes: [],
  },

  // @@GEN_SETTERS_START@@
  setSaturation: (value) => {
    logger.debug('FilmStore', `Setting Saturation: ${value}`);
    get().saturation.value = value;
  },
  setContrast: (value) => {
    const { contrast, contrastAuto } = get();
    logger.debug('FilmStore', `Setting Contrast: ${value}`);
    contrast.value = value;
    contrastAuto.value = false;

  },
  setGrainIntensity: (value) => {
    const { grainIntensity, grainEnabled } = get();
    logger.debug('FilmStore', `Setting Grain Intensity: ${value}`);
    grainIntensity.value = value;
    grainEnabled.value = value > 0;

  },
  setGrainChroma: (value) => {
    get().grainChroma.value = value;
  },
  setGrainSize: (value) => {
    get().grainSize.value = value;
  },
  setGrainSpeed: (value) => {
    get().grainSpeed.value = value;
  },
  setVignetteIntensity: (value) => {
    get().vignetteIntensity.value = value;
  },
  setTemperature: (value) => {
    const { temperature, temperatureAuto } = get();
    logger.debug('FilmStore', `Setting Temperature: ${value}`);
    temperature.value = value;
    temperatureAuto.value = false;

  },
  setTint: (value) => {
    const { tint, temperatureAuto } = get();
    logger.debug('FilmStore', `Setting Tint: ${value}`);
    tint.value = value;
    temperatureAuto.value = false;

  },
  setBloomIntensity: (value) => {
    const { bloomIntensity, bloomEnabled } = get();
    logger.debug('FilmStore', `Setting Bloom Intensity: ${value}`);
    bloomIntensity.value = value;
    bloomEnabled.value = value > 0;

  },
  setChromaticAberration: (value) => {
    logger.debug('FilmStore', `Setting Chromatic Aberration: ${value}`);
    get().chromaticAberration.value = value;
  },
  setAberrationDirection: (value) => {
    get().aberrationDirection.value = value;
  },
  setSharpening: (value) => {
    logger.debug('FilmStore', `Setting Sharpening: ${value}`);
    get().sharpening.value = value;
  },
  setSatRed: (value) => {
    get().satRed.value = value;
  },
  setSatOrange: (value) => {
    get().satOrange.value = value;
  },
  setSatYellow: (value) => {
    get().satYellow.value = value;
  },
  setSatGreen: (value) => {
    get().satGreen.value = value;
  },
  setSatCyan: (value) => {
    get().satCyan.value = value;
  },
  setSatBlue: (value) => {
    get().satBlue.value = value;
  },
  setSatPurple: (value) => {
    get().satPurple.value = value;
  },
  setSatMagenta: (value) => {
    get().satMagenta.value = value;
  },
  setAberrationInvert: (value) => {
    get().aberrationInvert.value = value;
  },
  setBoundMagentaRed: (value) => {
    get().boundMagentaRed.value = value;
  },
  setBoundRedOrange: (value) => {
    get().boundRedOrange.value = value;
  },
  setBoundOrangeYellow: (value) => {
    get().boundOrangeYellow.value = value;
  },
  setBoundYellowGreen: (value) => {
    get().boundYellowGreen.value = value;
  },
  setBoundGreenCyan: (value) => {
    get().boundGreenCyan.value = value;
  },
  setBoundCyanBlue: (value) => {
    get().boundCyanBlue.value = value;
  },
  setBoundBluePurple: (value) => {
    get().boundBluePurple.value = value;
  },
  setBoundPurpleMagenta: (value) => {
    get().boundPurpleMagenta.value = value;
  },
  setGrainRoughness: (value) => {
    get().grainRoughness.value = value;
  },
  setGrainEnabled: (value) => {
    get().grainEnabled.value = value;
  },
  setBloomEnabled: (value) => {
    get().bloomEnabled.value = value;
  },
  setNoiseReductionMode: (mode) => {
    get().noiseReductionMode.value = mode;
  },
  setNoiseReductionAuto: (value) => {
    get().noiseReductionAuto.value = value;
  },
  setTemperatureAuto: (value) => {
    const { temperatureAuto, temperature, tint } = get();
    temperatureAuto.value = value;
    if (value) {
      temperature.value = DEFAULT_TEMPERATURE;
      tint.value = DEFAULT_TINT;
    }

  },
  setIsSelfieCamera: (value) => {
    get().isSelfieCamera.value = value;
  },
  setBlackLevel: (value) => {
    const { blackLevel, blackLevelAuto } = get();
    blackLevel.value = value;
    blackLevelAuto.value = false;

  },
  setHighlights: (value) => {
    const { highlights, highlightsAuto } = get();
    highlights.value = value;
    highlightsAuto.value = false;

  },
  setPivot: (value) => {
    const { pivot, pivotAuto } = get();
    pivot.value = value;
    pivotAuto.value = false;

  },
  setContrastAuto: (value) => {
    const { contrastAuto, contrast } = get();
    contrastAuto.value = value;
    if (value) {
      contrast.value = DEFAULT_CONTRAST;
    }

  },
  setBlackLevelAuto: (value) => {
    const { blackLevelAuto, blackLevel } = get();
    blackLevelAuto.value = value;
    if (value) {
      blackLevel.value = 0.0;
    }

  },
  setHighlightsAuto: (value) => {
    const { highlightsAuto, highlights } = get();
    highlightsAuto.value = value;
    if (value) {
      highlights.value = 1.0;
    }

  },
  setPivotAuto: (value) => {
    const { pivotAuto, pivot } = get();
    pivotAuto.value = value;
    if (value) {
      pivot.value = 0.5;
    }

  },
  setPixelationFactor: (value) => {
    get().pixelationFactor.value = value;
  },
  // @@GEN_SETTERS_END@@
  setCapabilities: (caps) => {
    logger.info('FilmStore', 'Capabilities updated for Film');
    set((state) => ({
      capabilities: {
        ...state.capabilities,
        ...caps,
      }
    }));
  },
  resetEffect: (effect) => {
    const state = get();
    switch (effect) {
      // @@GEN_RESET_START@@
      case 'saturation':
        state.saturation.value = DEFAULT_SATURATION;
        state.satRed.value = DEFAULT_SELECTIVE_SATURATION;
        state.satOrange.value = DEFAULT_SELECTIVE_SATURATION;
        state.satYellow.value = DEFAULT_SELECTIVE_SATURATION;
        state.satGreen.value = DEFAULT_SELECTIVE_SATURATION;
        state.satCyan.value = DEFAULT_SELECTIVE_SATURATION;
        state.satBlue.value = DEFAULT_SELECTIVE_SATURATION;
        state.satPurple.value = DEFAULT_SELECTIVE_SATURATION;
        state.satMagenta.value = DEFAULT_SELECTIVE_SATURATION;
        state.boundMagentaRed.value = DEFAULT_BOUND_MAGENTA_RED;
        state.boundRedOrange.value = DEFAULT_BOUND_RED_ORANGE;
        state.boundOrangeYellow.value = DEFAULT_BOUND_ORANGE_YELLOW;
        state.boundYellowGreen.value = DEFAULT_BOUND_YELLOW_GREEN;
        state.boundGreenCyan.value = DEFAULT_BOUND_GREEN_CYAN;
        state.boundCyanBlue.value = DEFAULT_BOUND_CYAN_BLUE;
        state.boundBluePurple.value = DEFAULT_BOUND_BLUE_PURPLE;
        state.boundPurpleMagenta.value = DEFAULT_BOUND_PURPLE_MAGENTA;
        break;
      case 'contrast':
        state.contrast.value = DEFAULT_CONTRAST;
        break;
      case 'grain':
        state.grainIntensity.value = DEFAULT_GRAIN_INTENSITY;
        state.grainChroma.value = 0.0;
        state.grainSize.value = 1.0;
        state.grainSpeed.value = DEFAULT_GRAIN_SPEED;
        state.grainRoughness.value = 0.0;
        state.grainEnabled.value = false;
        break;
      case 'vignette':
        state.vignetteIntensity.value = 0.0;
        break;
      case 'temperature':
      case 'tint':
        state.temperature.value = DEFAULT_TEMPERATURE;
        state.temperatureAuto.value = true;
        state.tint.value = DEFAULT_TINT;
        break;
      case 'bloom':
        state.bloomIntensity.value = 0.0;
        state.bloomEnabled.value = false;
        break;
      case 'chromatic_aberration':
        state.chromaticAberration.value = DEFAULT_CHROMATIC_ABERRATION;
        state.aberrationDirection.value = 0;
        state.aberrationInvert.value = false;
        break;
      case 'sharpening':
        state.sharpening.value = 0.0;
        break;
      case 'noise_reduction':
        state.noiseReductionMode.value = 1;
        state.noiseReductionAuto.value = true;
        break;
      case 'camera_facing':
        state.isSelfieCamera.value = false;
        break;
      case 'tone':
        state.blackLevel.value = 0.0;
        state.highlights.value = 1.0;
        state.pivot.value = 0.5;
        state.contrastAuto.value = true;
        state.blackLevelAuto.value = true;
        state.highlightsAuto.value = true;
        state.pivotAuto.value = true;
        break;
      case 'pixelation':
        state.pixelationFactor.value = DEFAULT_PIXELATION_FACTOR;
        break;
      // @@GEN_RESET_END@@
    }
    logger.debug('FilmStore', 'end of resetEffect, triggering listener');
    if (filmListenerTimeout) clearTimeout(filmListenerTimeout);
    filmListenerTimeout = setTimeout(() => {
      parameterChangeListener?.();
    }, 50);
  },
}));

let parameterChangeListener: (() => void) | null = null;
let filmListenerTimeout: NodeJS.Timeout | null = null;

export const setFilmParameterChangeListener = (listener: () => void) => {
  parameterChangeListener = listener;
};

const filmStoreState = useFilmStore.getState();
const excludedFilmSetters = ['setCapabilities', 'resetEffect'];

const storeRecord = filmStoreState as unknown as Record<string, unknown>;

Object.keys(storeRecord).forEach((key) => {
  if (
    key.startsWith('set') &&
    !excludedFilmSetters.includes(key) &&
    typeof storeRecord[key] === 'function'
  ) {
    const originalFn = storeRecord[key] as (...args: unknown[]) => void;
    storeRecord[key] = (...args: unknown[]) => {
      originalFn(...args);
      if (filmListenerTimeout) clearTimeout(filmListenerTimeout);
      filmListenerTimeout = setTimeout(() => {
        parameterChangeListener?.();
      }, 50);
    };
  }
});


