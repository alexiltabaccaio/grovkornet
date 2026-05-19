import { useStylesStore } from './useStylesStore';
import { 
  DEFAULT_GRAIN_INTENSITY, 
  DEFAULT_SATURATION, 
  DEFAULT_CONTRAST, 
  DEFAULT_CHROMATIC_ABERRATION,
} from '@grovkornet/shared';

describe('useStylesStore', () => {
  it('sets Grain Intensity and updates enabled state', () => {
    const store = useStylesStore.getState();
    store.setGrainIntensity(0.5);
    expect(useStylesStore.getState().grainIntensity.value).toBe(0.5);
    expect(useStylesStore.getState().grainEnabled.value).toBe(true);

    store.setGrainIntensity(0);
    expect(useStylesStore.getState().grainIntensity.value).toBe(0);
    expect(useStylesStore.getState().grainEnabled.value).toBe(false);
  });

  it('sets Grain Chroma and Size', () => {
    const store = useStylesStore.getState();
    store.setGrainChroma(0.2);
    expect(useStylesStore.getState().grainChroma.value).toBe(0.2);

    store.setGrainSize(1.5);
    expect(useStylesStore.getState().grainSize.value).toBe(1.5);
  });

  it('sets Saturation and Contrast', () => {
    const store = useStylesStore.getState();
    store.setSaturation(1.2);
    expect(useStylesStore.getState().saturation.value).toBe(1.2);

    store.setContrast(1.1);
    expect(useStylesStore.getState().contrast.value).toBe(1.1);
  });

  it('sets Chromatic Aberration and Direction', () => {
    const store = useStylesStore.getState();
    store.setChromaticAberration(0.05);
    expect(useStylesStore.getState().chromaticAberration.value).toBe(0.05);

    store.setAberrationDirection(1);
    expect(useStylesStore.getState().aberrationDirection.value).toBe(1);
  });

  it('sets GrainEnabled, NoiseReductionAuto, NoiseReductionMode, Sharpening', () => {
    const store = useStylesStore.getState();
    store.setGrainEnabled(true);
    expect(useStylesStore.getState().grainEnabled.value).toBe(true);

    store.setNoiseReductionAuto(false);
    expect(useStylesStore.getState().noiseReductionAuto.value).toBe(false);

    store.setNoiseReductionMode(2);
    expect(useStylesStore.getState().noiseReductionMode.value).toBe(2);

    store.setSharpening(0.8);
    expect(useStylesStore.getState().sharpening.value).toBe(0.8);
  });

  it('resets effects correctly', () => {
    const store = useStylesStore.getState();
    
    store.setGrainIntensity(0.9);
    store.resetEffect('grain');
    expect(useStylesStore.getState().grainIntensity.value).toBe(DEFAULT_GRAIN_INTENSITY);
    expect(useStylesStore.getState().grainEnabled.value).toBe(false);
    expect(useStylesStore.getState().grainChroma.value).toBe(0);
    expect(useStylesStore.getState().grainSize.value).toBe(1);

    store.setSaturation(2.0);
    store.resetEffect('saturation');
    expect(useStylesStore.getState().saturation.value).toBe(DEFAULT_SATURATION);

    store.setContrast(2.0);
    store.resetEffect('contrast');
    expect(useStylesStore.getState().contrast.value).toBe(DEFAULT_CONTRAST);

    store.setChromaticAberration(0.5);
    store.resetEffect('chromatic_aberration');
    expect(useStylesStore.getState().chromaticAberration.value).toBe(DEFAULT_CHROMATIC_ABERRATION);
    expect(useStylesStore.getState().aberrationDirection.value).toBe(0);

    store.setSharpening(1.0);
    store.resetEffect('sharpening');
    expect(useStylesStore.getState().sharpening.value).toBe(0.0);

    store.setNoiseReductionAuto(false);
    store.resetEffect('noise_reduction');
    expect(useStylesStore.getState().noiseReductionAuto.value).toBe(true);
  });
});
