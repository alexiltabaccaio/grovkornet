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
  DEFAULT_GRAIN_CHROMA,
  DEFAULT_GRAIN_SIZE,
  DEFAULT_VIGNETTE_INTENSITY,
  DEFAULT_CHROMA_SHIFT,
  DEFAULT_BLOOM_INTENSITY,
  DEFAULT_CHROMA_SHIFT_DIRECTION,
  DEFAULT_SHARPENING,
  DEFAULT_ABERRATION_INVERT,
  DEFAULT_GRAIN_ROUGHNESS,
  DEFAULT_GRAIN_ENABLED,
  DEFAULT_BLOOM_ENABLED,
  DEFAULT_NOISE_REDUCTION_MODE,
  DEFAULT_NOISE_REDUCTION_AUTO,
  DEFAULT_TEMPERATURE_AUTO,
  DEFAULT_IS_SELFIE_CAMERA,
  DEFAULT_BLACK_LEVEL,
  DEFAULT_HIGHLIGHTS,
  DEFAULT_PIVOT,
  DEFAULT_CONTRAST_AUTO,
  DEFAULT_BLACK_LEVEL_AUTO,
  DEFAULT_HIGHLIGHTS_AUTO,
  DEFAULT_PIVOT_AUTO,
  DEFAULT_TAPE_JITTER,
  DEFAULT_SCANLINES,
  DEFAULT_CHROMA_SHIFT_INVERT,
} from '@grovkornet/shared';

let nitroConfig: any = null;
export const getNitroConfig = () => {
  if (nitroConfig) return nitroConfig;
  try {
    const { NitroModules } = require('react-native-nitro-modules');
    nitroConfig = NitroModules.createHybridObject('NitroCameraConfiguration');
    console.log('[Nitro] Successfully created NitroCameraConfiguration hybrid object!');
  } catch (e) {
    console.error('[Nitro] Failed to create NitroCameraConfiguration hybrid object:', e);
    nitroConfig = { saturation: 1.0 };
  }
  return nitroConfig;
};

export const useFilmStore = create<FilmStore>((set, get) => ({
  // @@GEN_INIT_START@@
  saturation: makeMutable(DEFAULT_SATURATION),
  contrast: makeMutable(DEFAULT_CONTRAST),
  grainIntensity: makeMutable(DEFAULT_GRAIN_INTENSITY),
  grainChroma: makeMutable(DEFAULT_GRAIN_CHROMA),
  grainSize: makeMutable(DEFAULT_GRAIN_SIZE),
  grainSpeed: makeMutable(DEFAULT_GRAIN_SPEED),
  vignetteIntensity: makeMutable(DEFAULT_VIGNETTE_INTENSITY),
  chromaShift: makeMutable(DEFAULT_CHROMA_SHIFT),
  temperature: makeMutable(DEFAULT_TEMPERATURE),
  tint: makeMutable(DEFAULT_TINT),
  bloomIntensity: makeMutable(DEFAULT_BLOOM_INTENSITY),
  chromaticAberration: makeMutable(DEFAULT_CHROMATIC_ABERRATION),
  chromaShiftDirection: makeMutable(DEFAULT_CHROMA_SHIFT_DIRECTION),
  sharpening: makeMutable(DEFAULT_SHARPENING),
  satRed: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satOrange: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satYellow: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satGreen: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satCyan: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satBlue: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satPurple: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satMagenta: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  aberrationInvert: makeMutable(DEFAULT_ABERRATION_INVERT),
  boundMagentaRed: makeMutable(DEFAULT_BOUND_MAGENTA_RED),
  boundRedOrange: makeMutable(DEFAULT_BOUND_RED_ORANGE),
  boundOrangeYellow: makeMutable(DEFAULT_BOUND_ORANGE_YELLOW),
  boundYellowGreen: makeMutable(DEFAULT_BOUND_YELLOW_GREEN),
  boundGreenCyan: makeMutable(DEFAULT_BOUND_GREEN_CYAN),
  boundCyanBlue: makeMutable(DEFAULT_BOUND_CYAN_BLUE),
  boundBluePurple: makeMutable(DEFAULT_BOUND_BLUE_PURPLE),
  boundPurpleMagenta: makeMutable(DEFAULT_BOUND_PURPLE_MAGENTA),
  grainRoughness: makeMutable(DEFAULT_GRAIN_ROUGHNESS),
  grainEnabled: makeMutable(DEFAULT_GRAIN_ENABLED),
  bloomEnabled: makeMutable(DEFAULT_BLOOM_ENABLED),
  noiseReductionMode: makeMutable(DEFAULT_NOISE_REDUCTION_MODE),
  noiseReductionAuto: makeMutable(DEFAULT_NOISE_REDUCTION_AUTO),
  temperatureAuto: makeMutable(DEFAULT_TEMPERATURE_AUTO),
  isSelfieCamera: makeMutable(DEFAULT_IS_SELFIE_CAMERA),
  blackLevel: makeMutable(DEFAULT_BLACK_LEVEL),
  highlights: makeMutable(DEFAULT_HIGHLIGHTS),
  pivot: makeMutable(DEFAULT_PIVOT),
  contrastAuto: makeMutable(DEFAULT_CONTRAST_AUTO),
  blackLevelAuto: makeMutable(DEFAULT_BLACK_LEVEL_AUTO),
  highlightsAuto: makeMutable(DEFAULT_HIGHLIGHTS_AUTO),
  pivotAuto: makeMutable(DEFAULT_PIVOT_AUTO),
  pixelationFactor: makeMutable(DEFAULT_PIXELATION_FACTOR),
  tapeJitter: makeMutable(DEFAULT_TAPE_JITTER),
  scanlines: makeMutable(DEFAULT_SCANLINES),
  chromaShiftInvert: makeMutable(DEFAULT_CHROMA_SHIFT_INVERT),
  // @@GEN_INIT_END@@
  capabilities: {
    availableNoiseReductionModes: [],
    availableEdgeModes: [],
  },

  // @@GEN_SETTERS_START@@
  setSaturation: (value) => {
    logger.debug('FilmStore', `Setting Saturation: ${value}`);
    get().saturation.value = value;
    getNitroConfig().saturation = value;
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
  setChromaShift: (value) => {
    get().chromaShift.value = value;
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
  setChromaShiftDirection: (value) => {
    get().chromaShiftDirection.value = value;
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
      blackLevel.value = DEFAULT_BLACK_LEVEL;
    }

  },
  setHighlightsAuto: (value) => {
    const { highlightsAuto, highlights } = get();
    highlightsAuto.value = value;
    if (value) {
      highlights.value = DEFAULT_HIGHLIGHTS;
    }

  },
  setPivotAuto: (value) => {
    const { pivotAuto, pivot } = get();
    pivotAuto.value = value;
    if (value) {
      pivot.value = DEFAULT_PIVOT;
    }

  },
  setPixelationFactor: (value) => {
    get().pixelationFactor.value = value;
  },
  setTapeJitter: (value) => {
    get().tapeJitter.value = value;
  },
  setScanlines: (value) => {
    get().scanlines.value = value;
  },
  setChromaShiftInvert: (value) => {
    get().chromaShiftInvert.value = value;
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
        getNitroConfig().saturation = DEFAULT_SATURATION;
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
        state.grainChroma.value = DEFAULT_GRAIN_CHROMA;
        state.grainSize.value = DEFAULT_GRAIN_SIZE;
        state.grainSpeed.value = DEFAULT_GRAIN_SPEED;
        state.grainRoughness.value = DEFAULT_GRAIN_ROUGHNESS;
        state.grainEnabled.value = DEFAULT_GRAIN_ENABLED;
        break;
      case 'vignette':
        state.vignetteIntensity.value = DEFAULT_VIGNETTE_INTENSITY;
        break;
      case 'chroma_shift':
        state.chromaShift.value = DEFAULT_CHROMA_SHIFT;
        state.chromaShiftDirection.value = DEFAULT_CHROMA_SHIFT_DIRECTION;
        state.chromaShiftInvert.value = DEFAULT_CHROMA_SHIFT_INVERT;
        break;
      case 'temperature':
      case 'tint':
        state.temperature.value = DEFAULT_TEMPERATURE;
        state.temperatureAuto.value = DEFAULT_TEMPERATURE_AUTO;
        state.tint.value = DEFAULT_TINT;
        break;
      case 'bloom':
        state.bloomIntensity.value = DEFAULT_BLOOM_INTENSITY;
        state.bloomEnabled.value = DEFAULT_BLOOM_ENABLED;
        break;
      case 'chromatic_aberration':
        state.chromaticAberration.value = DEFAULT_CHROMATIC_ABERRATION;
        state.aberrationInvert.value = DEFAULT_ABERRATION_INVERT;
        break;
      case 'sharpening':
        state.sharpening.value = DEFAULT_SHARPENING;
        break;
      case 'noise_reduction':
        state.noiseReductionMode.value = DEFAULT_NOISE_REDUCTION_MODE;
        state.noiseReductionAuto.value = DEFAULT_NOISE_REDUCTION_AUTO;
        break;
      case 'camera_facing':
        state.isSelfieCamera.value = DEFAULT_IS_SELFIE_CAMERA;
        break;
      case 'tone':
        state.blackLevel.value = DEFAULT_BLACK_LEVEL;
        state.highlights.value = DEFAULT_HIGHLIGHTS;
        state.pivot.value = DEFAULT_PIVOT;
        state.contrastAuto.value = DEFAULT_CONTRAST_AUTO;
        state.blackLevelAuto.value = DEFAULT_BLACK_LEVEL_AUTO;
        state.highlightsAuto.value = DEFAULT_HIGHLIGHTS_AUTO;
        state.pivotAuto.value = DEFAULT_PIVOT_AUTO;
        break;
      case 'pixelation':
        state.pixelationFactor.value = DEFAULT_PIXELATION_FACTOR;
        break;
      case 'tape_jitter':
        state.tapeJitter.value = DEFAULT_TAPE_JITTER;
        break;
      case 'scanlines':
        state.scanlines.value = DEFAULT_SCANLINES;
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
const excludedFilmSetters = ['setCapabilities', 'resetEffect', 'setIsSelfieCamera'];

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


