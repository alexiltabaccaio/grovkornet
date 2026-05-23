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
} from '@grovkornet/shared';

export const useFilmStore = create<FilmStore>((set, get) => ({
  grainIntensity: makeMutable(DEFAULT_GRAIN_INTENSITY),
  grainChroma: makeMutable(0.0),
  grainSize: makeMutable(1.0),
  grainSpeed: makeMutable(DEFAULT_GRAIN_SPEED),
  saturation: makeMutable(DEFAULT_SATURATION),
  contrast: makeMutable(DEFAULT_CONTRAST),
  chromaticAberration: makeMutable(DEFAULT_CHROMATIC_ABERRATION),
  aberrationDirection: makeMutable(0), // 0: Vertical, 1: Horizontal, 2: Radial
  grainEnabled: makeMutable(false),
  noiseReductionAuto: makeMutable(true),
  noiseReductionMode: makeMutable(1), // 0=OFF, 1=FAST, 2=HQ
  sharpening: makeMutable(0.0),
  bloomEnabled: makeMutable(false),
  bloomIntensity: makeMutable(0.0),
  temperature: makeMutable(DEFAULT_TEMPERATURE),
  tint: makeMutable(DEFAULT_TINT),
  temperatureAuto: makeMutable(true),
  satRed: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satOrange: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satYellow: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satGreen: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satCyan: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satBlue: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satPurple: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  satMagenta: makeMutable(DEFAULT_SELECTIVE_SATURATION),
  capabilities: {
    availableNoiseReductionModes: [],
    availableEdgeModes: [],
  },

  setGrainIntensity: (value) => {
    logger.debug('FilmStore', `Setting Grain Intensity: ${value}`);
    const { grainIntensity, grainEnabled } = get();
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
  setSaturation: (value) => {
    logger.debug('FilmStore', `Setting Saturation: ${value}`);
    get().saturation.value = value;
  },
  setContrast: (value) => {
    logger.debug('FilmStore', `Setting Contrast: ${value}`);
    get().contrast.value = value;
  },
  setChromaticAberration: (value) => {
    logger.debug('FilmStore', `Setting Chromatic Aberration: ${value}`);
    get().chromaticAberration.value = value;
  },
  setAberrationDirection: (value) => {
    get().aberrationDirection.value = value;
  },
  setGrainEnabled: (value) => {
    get().grainEnabled.value = value;
  },
  setNoiseReductionAuto: (value) => {
    get().noiseReductionAuto.value = value;
  },
  setNoiseReductionMode: (mode) => {
    get().noiseReductionMode.value = mode;
  },
  setSharpening: (value) => {
    logger.debug('FilmStore', `Setting Sharpening: ${value}`);
    get().sharpening.value = value;
  },
  setBloomEnabled: (value) => {
    get().bloomEnabled.value = value;
  },
  setBloomIntensity: (value) => {
    logger.debug('FilmStore', `Setting Bloom Intensity: ${value}`);
    get().bloomIntensity.value = value;
    get().bloomEnabled.value = value > 0;
  },
  setTemperature: (value) => {
    logger.debug('FilmStore', `Setting Temperature: ${value}`);
    get().temperature.value = value;
    get().temperatureAuto.value = false;
  },
  setTint: (value) => {
    logger.debug('FilmStore', `Setting Tint: ${value}`);
    get().tint.value = value;
    get().temperatureAuto.value = false;
  },
  setTemperatureAuto: (value) => {
    get().temperatureAuto.value = value;
    if (value) {
      get().temperature.value = DEFAULT_TEMPERATURE;
      get().tint.value = DEFAULT_TINT;
    }
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
      case 'grain':
        state.grainIntensity.value = DEFAULT_GRAIN_INTENSITY;
        state.grainEnabled.value = false;
        state.grainChroma.value = 0;
        state.grainSize.value = 1;
        state.grainSpeed.value = DEFAULT_GRAIN_SPEED;
        break;
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
        break;
      case 'contrast':
        state.contrast.value = DEFAULT_CONTRAST;
        break;
      case 'chromatic_aberration':
        state.chromaticAberration.value = DEFAULT_CHROMATIC_ABERRATION;
        state.aberrationDirection.value = 0;
        break;
      case 'sharpening':
        state.sharpening.value = 0.0;
        break;
      case 'noise_reduction':
        state.noiseReductionAuto.value = true;
        break;
      case 'bloom':
        state.bloomEnabled.value = false;
        state.bloomIntensity.value = 0.0;
        break;
      case 'temperature':
      case 'tint':
        state.temperatureAuto.value = true;
        state.temperature.value = DEFAULT_TEMPERATURE;
        state.tint.value = DEFAULT_TINT;
        break;
    }
  },
}));
