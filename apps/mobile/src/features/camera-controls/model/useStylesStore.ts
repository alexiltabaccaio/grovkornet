import { create } from 'zustand';
import { makeMutable } from 'react-native-reanimated';
import { logger } from '@shared/lib/logger';
import { EffectsStore } from '@shared/types/stores';
import { 
  DEFAULT_GRAIN_INTENSITY, 
  DEFAULT_SATURATION, 
  DEFAULT_CONTRAST, 
  DEFAULT_CHROMATIC_ABERRATION,
} from '@grovkornet/shared';

export const useStylesStore = create<EffectsStore>((set, get) => ({
  grainIntensity: makeMutable(DEFAULT_GRAIN_INTENSITY),
  grainChroma: makeMutable(0.0),
  grainSize: makeMutable(1.0),
  saturation: makeMutable(DEFAULT_SATURATION),
  contrast: makeMutable(DEFAULT_CONTRAST),
  chromaticAberration: makeMutable(DEFAULT_CHROMATIC_ABERRATION),
  aberrationDirection: makeMutable(0), // 0: Vertical, 1: Horizontal, 2: Radial
  grainEnabled: makeMutable(false),
  noiseReductionAuto: makeMutable(true),
  noiseReductionMode: makeMutable(1), // 0=OFF, 1=FAST, 2=HQ
  sharpening: makeMutable(0.0),

  setGrainIntensity: (value) => {
    logger.debug('StylesStore', `Setting Grain Intensity: ${value}`);
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
  setSaturation: (value) => {
    get().saturation.value = value;
  },
  setContrast: (value) => {
    get().contrast.value = value;
  },
  setChromaticAberration: (value) => {
    logger.debug('StylesStore', `Setting Chromatic Aberration: ${value}`);
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
    get().sharpening.value = value;
  },
  resetEffect: (effect) => {
    const state = get();
    switch (effect) {
      case 'grain':
        state.grainIntensity.value = DEFAULT_GRAIN_INTENSITY;
        state.grainEnabled.value = false;
        state.grainChroma.value = 0;
        state.grainSize.value = 1;
        break;
      case 'saturation':
        state.saturation.value = DEFAULT_SATURATION;
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
    }
  },
}));
