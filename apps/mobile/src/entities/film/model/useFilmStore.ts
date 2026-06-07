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
  DEFAULT_HUE,
  DEFAULT_SELECTIVE_HUE,
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
  hue: makeMutable(DEFAULT_HUE),
  hueRed: makeMutable(DEFAULT_SELECTIVE_HUE),
  hueOrange: makeMutable(DEFAULT_SELECTIVE_HUE),
  hueYellow: makeMutable(DEFAULT_SELECTIVE_HUE),
  hueGreen: makeMutable(DEFAULT_SELECTIVE_HUE),
  hueCyan: makeMutable(DEFAULT_SELECTIVE_HUE),
  hueBlue: makeMutable(DEFAULT_SELECTIVE_HUE),
  huePurple: makeMutable(DEFAULT_SELECTIVE_HUE),
  hueMagenta: makeMutable(DEFAULT_SELECTIVE_HUE),
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
    getNitroConfig().contrast = value;
    contrastAuto.value = false;
    getNitroConfig().contrastAuto = false;

  },
  setGrainIntensity: (value) => {
    const { grainIntensity, grainEnabled } = get();
    logger.debug('FilmStore', `Setting Grain Intensity: ${value}`);
    grainIntensity.value = value;
    getNitroConfig().grainIntensity = value;
    grainEnabled.value = value > 0;
    getNitroConfig().grainEnabled = value > 0;

  },
  setGrainChroma: (value) => {
    get().grainChroma.value = value;
    getNitroConfig().grainChroma = value;
  },
  setGrainSize: (value) => {
    get().grainSize.value = value;
    getNitroConfig().grainSize = value;
  },
  setGrainSpeed: (value) => {
    get().grainSpeed.value = value;
    getNitroConfig().grainSpeed = value;
  },
  setVignetteIntensity: (value) => {
    get().vignetteIntensity.value = value;
    getNitroConfig().vignetteIntensity = value;
  },
  setChromaShift: (value) => {
    get().chromaShift.value = value;
    getNitroConfig().chromaShift = value;
  },
  setTemperature: (value) => {
    const { temperature, temperatureAuto } = get();
    logger.debug('FilmStore', `Setting Temperature: ${value}`);
    temperature.value = value;
    getNitroConfig().whiteBalance = value;
    temperatureAuto.value = false;

  },
  setTint: (value) => {
    const { tint, temperatureAuto } = get();
    logger.debug('FilmStore', `Setting Tint: ${value}`);
    tint.value = value;
    getNitroConfig().tint = value;
    temperatureAuto.value = false;

  },
  setBloomIntensity: (value) => {
    const { bloomIntensity, bloomEnabled } = get();
    logger.debug('FilmStore', `Setting Bloom Intensity: ${value}`);
    bloomIntensity.value = value;
    getNitroConfig().bloomIntensity = value;
    bloomEnabled.value = value > 0;
    getNitroConfig().bloomEnabled = value > 0;

  },
  setChromaticAberration: (value) => {
    logger.debug('FilmStore', `Setting Chromatic Aberration: ${value}`);
    get().chromaticAberration.value = value;
    getNitroConfig().chromaticAberration = value;
  },
  setChromaShiftDirection: (value) => {
    get().chromaShiftDirection.value = value;
    getNitroConfig().chromaShiftDirection = value;
  },
  setSharpening: (value) => {
    logger.debug('FilmStore', `Setting Sharpening: ${value}`);
    get().sharpening.value = value;
    getNitroConfig().sharpening = value;
  },
  setSatRed: (value) => {
    get().satRed.value = value;
    getNitroConfig().satRed = value;
  },
  setSatOrange: (value) => {
    get().satOrange.value = value;
    getNitroConfig().satOrange = value;
  },
  setSatYellow: (value) => {
    get().satYellow.value = value;
    getNitroConfig().satYellow = value;
  },
  setSatGreen: (value) => {
    get().satGreen.value = value;
    getNitroConfig().satGreen = value;
  },
  setSatCyan: (value) => {
    get().satCyan.value = value;
    getNitroConfig().satCyan = value;
  },
  setSatBlue: (value) => {
    get().satBlue.value = value;
    getNitroConfig().satBlue = value;
  },
  setSatPurple: (value) => {
    get().satPurple.value = value;
    getNitroConfig().satPurple = value;
  },
  setSatMagenta: (value) => {
    get().satMagenta.value = value;
    getNitroConfig().satMagenta = value;
  },
  setAberrationInvert: (value) => {
    get().aberrationInvert.value = value;
    getNitroConfig().aberrationInvert = value;
  },
  setBoundMagentaRed: (value) => {
    get().boundMagentaRed.value = value;
    getNitroConfig().boundMagentaRed = value;
  },
  setBoundRedOrange: (value) => {
    get().boundRedOrange.value = value;
    getNitroConfig().boundRedOrange = value;
  },
  setBoundOrangeYellow: (value) => {
    get().boundOrangeYellow.value = value;
    getNitroConfig().boundOrangeYellow = value;
  },
  setBoundYellowGreen: (value) => {
    get().boundYellowGreen.value = value;
    getNitroConfig().boundYellowGreen = value;
  },
  setBoundGreenCyan: (value) => {
    get().boundGreenCyan.value = value;
    getNitroConfig().boundGreenCyan = value;
  },
  setBoundCyanBlue: (value) => {
    get().boundCyanBlue.value = value;
    getNitroConfig().boundCyanBlue = value;
  },
  setBoundBluePurple: (value) => {
    get().boundBluePurple.value = value;
    getNitroConfig().boundBluePurple = value;
  },
  setBoundPurpleMagenta: (value) => {
    get().boundPurpleMagenta.value = value;
    getNitroConfig().boundPurpleMagenta = value;
  },
  setGrainRoughness: (value) => {
    get().grainRoughness.value = value;
    getNitroConfig().grainRoughness = value;
  },
  setGrainEnabled: (value) => {
    get().grainEnabled.value = value;
    getNitroConfig().grainEnabled = value;
  },
  setBloomEnabled: (value) => {
    get().bloomEnabled.value = value;
    getNitroConfig().bloomEnabled = value;
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
      getNitroConfig().whiteBalance = DEFAULT_TEMPERATURE;
      tint.value = DEFAULT_TINT;
      getNitroConfig().tint = DEFAULT_TINT;
    }

  },
  setIsSelfieCamera: (value) => {
    get().isSelfieCamera.value = value;
  },
  setBlackLevel: (value) => {
    const { blackLevel, blackLevelAuto } = get();
    blackLevel.value = value;
    getNitroConfig().blackLevel = value;
    blackLevelAuto.value = false;
    getNitroConfig().blackLevelAuto = false;

  },
  setHighlights: (value) => {
    const { highlights, highlightsAuto } = get();
    highlights.value = value;
    getNitroConfig().highlights = value;
    highlightsAuto.value = false;
    getNitroConfig().highlightsAuto = false;

  },
  setPivot: (value) => {
    const { pivot, pivotAuto } = get();
    pivot.value = value;
    getNitroConfig().pivot = value;
    pivotAuto.value = false;
    getNitroConfig().pivotAuto = false;

  },
  setContrastAuto: (value) => {
    const { contrastAuto, contrast } = get();
    contrastAuto.value = value;
    getNitroConfig().contrastAuto = value;
    if (value) {
      contrast.value = DEFAULT_CONTRAST;
      getNitroConfig().contrast = DEFAULT_CONTRAST;
    }

  },
  setBlackLevelAuto: (value) => {
    const { blackLevelAuto, blackLevel } = get();
    blackLevelAuto.value = value;
    getNitroConfig().blackLevelAuto = value;
    if (value) {
      blackLevel.value = DEFAULT_BLACK_LEVEL;
      getNitroConfig().blackLevel = DEFAULT_BLACK_LEVEL;
    }

  },
  setHighlightsAuto: (value) => {
    const { highlightsAuto, highlights } = get();
    highlightsAuto.value = value;
    getNitroConfig().highlightsAuto = value;
    if (value) {
      highlights.value = DEFAULT_HIGHLIGHTS;
      getNitroConfig().highlights = DEFAULT_HIGHLIGHTS;
    }

  },
  setPivotAuto: (value) => {
    const { pivotAuto, pivot } = get();
    pivotAuto.value = value;
    getNitroConfig().pivotAuto = value;
    if (value) {
      pivot.value = DEFAULT_PIVOT;
      getNitroConfig().pivot = DEFAULT_PIVOT;
    }

  },
  setPixelationFactor: (value) => {
    get().pixelationFactor.value = value;
    getNitroConfig().pixelationFactor = value;
  },
  setTapeJitter: (value) => {
    get().tapeJitter.value = value;
    getNitroConfig().tapeJitter = value;
  },
  setScanlines: (value) => {
    get().scanlines.value = value;
    getNitroConfig().scanlines = value;
  },
  setChromaShiftInvert: (value) => {
    get().chromaShiftInvert.value = value;
    getNitroConfig().chromaShiftInvert = value;
  },
  setHue: (value) => {
    get().hue.value = value;
    getNitroConfig().hue = value;
  },
  setHueRed: (value) => {
    get().hueRed.value = value;
    getNitroConfig().hueRed = value;
  },
  setHueOrange: (value) => {
    get().hueOrange.value = value;
    getNitroConfig().hueOrange = value;
  },
  setHueYellow: (value) => {
    get().hueYellow.value = value;
    getNitroConfig().hueYellow = value;
  },
  setHueGreen: (value) => {
    get().hueGreen.value = value;
    getNitroConfig().hueGreen = value;
  },
  setHueCyan: (value) => {
    get().hueCyan.value = value;
    getNitroConfig().hueCyan = value;
  },
  setHueBlue: (value) => {
    get().hueBlue.value = value;
    getNitroConfig().hueBlue = value;
  },
  setHuePurple: (value) => {
    get().huePurple.value = value;
    getNitroConfig().huePurple = value;
  },
  setHueMagenta: (value) => {
    get().hueMagenta.value = value;
    getNitroConfig().hueMagenta = value;
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
        getNitroConfig().satRed = DEFAULT_SELECTIVE_SATURATION;
        state.satOrange.value = DEFAULT_SELECTIVE_SATURATION;
        getNitroConfig().satOrange = DEFAULT_SELECTIVE_SATURATION;
        state.satYellow.value = DEFAULT_SELECTIVE_SATURATION;
        getNitroConfig().satYellow = DEFAULT_SELECTIVE_SATURATION;
        state.satGreen.value = DEFAULT_SELECTIVE_SATURATION;
        getNitroConfig().satGreen = DEFAULT_SELECTIVE_SATURATION;
        state.satCyan.value = DEFAULT_SELECTIVE_SATURATION;
        getNitroConfig().satCyan = DEFAULT_SELECTIVE_SATURATION;
        state.satBlue.value = DEFAULT_SELECTIVE_SATURATION;
        getNitroConfig().satBlue = DEFAULT_SELECTIVE_SATURATION;
        state.satPurple.value = DEFAULT_SELECTIVE_SATURATION;
        getNitroConfig().satPurple = DEFAULT_SELECTIVE_SATURATION;
        state.satMagenta.value = DEFAULT_SELECTIVE_SATURATION;
        getNitroConfig().satMagenta = DEFAULT_SELECTIVE_SATURATION;
        state.boundMagentaRed.value = DEFAULT_BOUND_MAGENTA_RED;
        getNitroConfig().boundMagentaRed = DEFAULT_BOUND_MAGENTA_RED;
        state.boundRedOrange.value = DEFAULT_BOUND_RED_ORANGE;
        getNitroConfig().boundRedOrange = DEFAULT_BOUND_RED_ORANGE;
        state.boundOrangeYellow.value = DEFAULT_BOUND_ORANGE_YELLOW;
        getNitroConfig().boundOrangeYellow = DEFAULT_BOUND_ORANGE_YELLOW;
        state.boundYellowGreen.value = DEFAULT_BOUND_YELLOW_GREEN;
        getNitroConfig().boundYellowGreen = DEFAULT_BOUND_YELLOW_GREEN;
        state.boundGreenCyan.value = DEFAULT_BOUND_GREEN_CYAN;
        getNitroConfig().boundGreenCyan = DEFAULT_BOUND_GREEN_CYAN;
        state.boundCyanBlue.value = DEFAULT_BOUND_CYAN_BLUE;
        getNitroConfig().boundCyanBlue = DEFAULT_BOUND_CYAN_BLUE;
        state.boundBluePurple.value = DEFAULT_BOUND_BLUE_PURPLE;
        getNitroConfig().boundBluePurple = DEFAULT_BOUND_BLUE_PURPLE;
        state.boundPurpleMagenta.value = DEFAULT_BOUND_PURPLE_MAGENTA;
        getNitroConfig().boundPurpleMagenta = DEFAULT_BOUND_PURPLE_MAGENTA;
        break;
      case 'contrast':
        state.contrast.value = DEFAULT_CONTRAST;
        getNitroConfig().contrast = DEFAULT_CONTRAST;
        break;
      case 'grain':
        state.grainIntensity.value = DEFAULT_GRAIN_INTENSITY;
        getNitroConfig().grainIntensity = DEFAULT_GRAIN_INTENSITY;
        state.grainChroma.value = DEFAULT_GRAIN_CHROMA;
        getNitroConfig().grainChroma = DEFAULT_GRAIN_CHROMA;
        state.grainSize.value = DEFAULT_GRAIN_SIZE;
        getNitroConfig().grainSize = DEFAULT_GRAIN_SIZE;
        state.grainSpeed.value = DEFAULT_GRAIN_SPEED;
        getNitroConfig().grainSpeed = DEFAULT_GRAIN_SPEED;
        state.grainRoughness.value = DEFAULT_GRAIN_ROUGHNESS;
        getNitroConfig().grainRoughness = DEFAULT_GRAIN_ROUGHNESS;
        state.grainEnabled.value = DEFAULT_GRAIN_ENABLED;
        getNitroConfig().grainEnabled = DEFAULT_GRAIN_ENABLED;
        break;
      case 'vignette':
        state.vignetteIntensity.value = DEFAULT_VIGNETTE_INTENSITY;
        getNitroConfig().vignetteIntensity = DEFAULT_VIGNETTE_INTENSITY;
        break;
      case 'chroma_shift':
        state.chromaShift.value = DEFAULT_CHROMA_SHIFT;
        getNitroConfig().chromaShift = DEFAULT_CHROMA_SHIFT;
        state.chromaShiftDirection.value = DEFAULT_CHROMA_SHIFT_DIRECTION;
        getNitroConfig().chromaShiftDirection = DEFAULT_CHROMA_SHIFT_DIRECTION;
        state.chromaShiftInvert.value = DEFAULT_CHROMA_SHIFT_INVERT;
        getNitroConfig().chromaShiftInvert = DEFAULT_CHROMA_SHIFT_INVERT;
        break;
      case 'temperature':
      case 'tint':
        state.temperature.value = DEFAULT_TEMPERATURE;
        getNitroConfig().whiteBalance = DEFAULT_TEMPERATURE;
        state.temperatureAuto.value = DEFAULT_TEMPERATURE_AUTO;
        state.tint.value = DEFAULT_TINT;
        getNitroConfig().tint = DEFAULT_TINT;
        break;
      case 'bloom':
        state.bloomIntensity.value = DEFAULT_BLOOM_INTENSITY;
        getNitroConfig().bloomIntensity = DEFAULT_BLOOM_INTENSITY;
        state.bloomEnabled.value = DEFAULT_BLOOM_ENABLED;
        getNitroConfig().bloomEnabled = DEFAULT_BLOOM_ENABLED;
        break;
      case 'chromatic_aberration':
        state.chromaticAberration.value = DEFAULT_CHROMATIC_ABERRATION;
        getNitroConfig().chromaticAberration = DEFAULT_CHROMATIC_ABERRATION;
        state.aberrationInvert.value = DEFAULT_ABERRATION_INVERT;
        getNitroConfig().aberrationInvert = DEFAULT_ABERRATION_INVERT;
        break;
      case 'sharpening':
        state.sharpening.value = DEFAULT_SHARPENING;
        getNitroConfig().sharpening = DEFAULT_SHARPENING;
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
        getNitroConfig().blackLevel = DEFAULT_BLACK_LEVEL;
        state.highlights.value = DEFAULT_HIGHLIGHTS;
        getNitroConfig().highlights = DEFAULT_HIGHLIGHTS;
        state.pivot.value = DEFAULT_PIVOT;
        getNitroConfig().pivot = DEFAULT_PIVOT;
        state.contrastAuto.value = DEFAULT_CONTRAST_AUTO;
        getNitroConfig().contrastAuto = DEFAULT_CONTRAST_AUTO;
        state.blackLevelAuto.value = DEFAULT_BLACK_LEVEL_AUTO;
        getNitroConfig().blackLevelAuto = DEFAULT_BLACK_LEVEL_AUTO;
        state.highlightsAuto.value = DEFAULT_HIGHLIGHTS_AUTO;
        getNitroConfig().highlightsAuto = DEFAULT_HIGHLIGHTS_AUTO;
        state.pivotAuto.value = DEFAULT_PIVOT_AUTO;
        getNitroConfig().pivotAuto = DEFAULT_PIVOT_AUTO;
        break;
      case 'pixelation':
        state.pixelationFactor.value = DEFAULT_PIXELATION_FACTOR;
        getNitroConfig().pixelationFactor = DEFAULT_PIXELATION_FACTOR;
        break;
      case 'tape_jitter':
        state.tapeJitter.value = DEFAULT_TAPE_JITTER;
        getNitroConfig().tapeJitter = DEFAULT_TAPE_JITTER;
        break;
      case 'scanlines':
        state.scanlines.value = DEFAULT_SCANLINES;
        getNitroConfig().scanlines = DEFAULT_SCANLINES;
        break;
      case 'hue':
        state.hue.value = DEFAULT_HUE;
        getNitroConfig().hue = DEFAULT_HUE;
        state.hueRed.value = DEFAULT_SELECTIVE_HUE;
        getNitroConfig().hueRed = DEFAULT_SELECTIVE_HUE;
        state.hueOrange.value = DEFAULT_SELECTIVE_HUE;
        getNitroConfig().hueOrange = DEFAULT_SELECTIVE_HUE;
        state.hueYellow.value = DEFAULT_SELECTIVE_HUE;
        getNitroConfig().hueYellow = DEFAULT_SELECTIVE_HUE;
        state.hueGreen.value = DEFAULT_SELECTIVE_HUE;
        getNitroConfig().hueGreen = DEFAULT_SELECTIVE_HUE;
        state.hueCyan.value = DEFAULT_SELECTIVE_HUE;
        getNitroConfig().hueCyan = DEFAULT_SELECTIVE_HUE;
        state.hueBlue.value = DEFAULT_SELECTIVE_HUE;
        getNitroConfig().hueBlue = DEFAULT_SELECTIVE_HUE;
        state.huePurple.value = DEFAULT_SELECTIVE_HUE;
        getNitroConfig().huePurple = DEFAULT_SELECTIVE_HUE;
        state.hueMagenta.value = DEFAULT_SELECTIVE_HUE;
        getNitroConfig().hueMagenta = DEFAULT_SELECTIVE_HUE;
        break;
      // @@GEN_RESET_END@@
    }
    logger.debug('FilmStore', 'end of resetEffect, triggering listener');
    if (process.env.NODE_ENV === 'test') {
      parameterChangeListener?.();
    } else {
      if (filmListenerTimeout) clearTimeout(filmListenerTimeout);
      filmListenerTimeout = setTimeout(() => {
        parameterChangeListener?.();
      }, 50);
    }
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
      if (process.env.NODE_ENV === 'test') {
        parameterChangeListener?.();
      } else {
        if (filmListenerTimeout) clearTimeout(filmListenerTimeout);
        filmListenerTimeout = setTimeout(() => {
          parameterChangeListener?.();
        }, 50);
      }
    };
  }
});


