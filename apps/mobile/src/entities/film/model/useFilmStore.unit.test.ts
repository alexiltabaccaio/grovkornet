import { useFilmStore } from './useFilmStore';
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

describe('useFilmStore', () => {
  it('sets Grain Intensity and updates enabled state', () => {
    const store = useFilmStore.getState();
    store.setGrainIntensity(0.5);
    expect(useFilmStore.getState().grainIntensity.value).toBe(0.5);
    expect(useFilmStore.getState().grainEnabled.value).toBe(true);

    store.setGrainIntensity(0);
    expect(useFilmStore.getState().grainIntensity.value).toBe(0);
    expect(useFilmStore.getState().grainEnabled.value).toBe(false);
  });

  it('sets Grain Chroma and Size', () => {
    const store = useFilmStore.getState();
    store.setGrainChroma(0.2);
    expect(useFilmStore.getState().grainChroma.value).toBe(0.2);

    store.setGrainSize(1.5);
    expect(useFilmStore.getState().grainSize.value).toBe(1.5);
  });

  it('sets Saturation and Contrast', () => {
    const store = useFilmStore.getState();
    store.setSaturation(1.2);
    expect(useFilmStore.getState().saturation.value).toBe(1.2);

    store.setContrast(1.1);
    expect(useFilmStore.getState().contrast.value).toBe(1.1);
  });

  it('sets Selective Saturation values', () => {
    const store = useFilmStore.getState();
    store.setSatRed(75.5);
    store.setSatOrange(80);
    store.setSatYellow(10);
    store.setSatGreen(20);
    store.setSatCyan(30);
    store.setSatBlue(40);
    store.setSatPurple(50);
    store.setSatMagenta(60);

    expect(useFilmStore.getState().satRed.value).toBe(75.5);
    expect(useFilmStore.getState().satOrange.value).toBe(80);
    expect(useFilmStore.getState().satYellow.value).toBe(10);
    expect(useFilmStore.getState().satGreen.value).toBe(20);
    expect(useFilmStore.getState().satCyan.value).toBe(30);
    expect(useFilmStore.getState().satBlue.value).toBe(40);
    expect(useFilmStore.getState().satPurple.value).toBe(50);
    expect(useFilmStore.getState().satMagenta.value).toBe(60);
  });

  it('sets Chromatic Aberration and Direction', () => {
    const store = useFilmStore.getState();
    store.setChromaticAberration(0.05);
    expect(useFilmStore.getState().chromaticAberration.value).toBe(0.05);

    store.setAberrationDirection(1);
    expect(useFilmStore.getState().aberrationDirection.value).toBe(1);
  });

  it('sets GrainEnabled, NoiseReductionAuto, NoiseReductionMode, Sharpening', () => {
    const store = useFilmStore.getState();
    store.setGrainEnabled(true);
    expect(useFilmStore.getState().grainEnabled.value).toBe(true);

    store.setNoiseReductionAuto(false);
    expect(useFilmStore.getState().noiseReductionAuto.value).toBe(false);

    store.setNoiseReductionMode(2);
    expect(useFilmStore.getState().noiseReductionMode.value).toBe(2);

    store.setSharpening(0.8);
    expect(useFilmStore.getState().sharpening.value).toBe(0.8);
  });

  it('sets Temperature and Tint', () => {
    const store = useFilmStore.getState();
    store.setTemperature(6500);
    expect(useFilmStore.getState().temperature.value).toBe(6500);
    expect(useFilmStore.getState().temperatureAuto.value).toBe(false);

    store.setTint(10);
    expect(useFilmStore.getState().tint.value).toBe(10);
  });

  it('resets effects correctly', () => {
    const store = useFilmStore.getState();
    
    store.setGrainIntensity(0.9);
    store.resetEffect('grain');
    expect(useFilmStore.getState().grainIntensity.value).toBe(DEFAULT_GRAIN_INTENSITY);
    expect(useFilmStore.getState().grainEnabled.value).toBe(false);
    expect(useFilmStore.getState().grainChroma.value).toBe(0);
    expect(useFilmStore.getState().grainSize.value).toBe(1);
    expect(useFilmStore.getState().grainSpeed.value).toBe(DEFAULT_GRAIN_SPEED);

    store.setSaturation(2.0);
    store.setSatRed(90);
    store.setSatBlue(10);
    store.resetEffect('saturation');
    expect(useFilmStore.getState().saturation.value).toBe(DEFAULT_SATURATION);
    expect(useFilmStore.getState().satRed.value).toBe(DEFAULT_SELECTIVE_SATURATION);
    expect(useFilmStore.getState().satOrange.value).toBe(DEFAULT_SELECTIVE_SATURATION);
    expect(useFilmStore.getState().satBlue.value).toBe(DEFAULT_SELECTIVE_SATURATION);

    store.setContrast(2.0);
    store.resetEffect('contrast');
    expect(useFilmStore.getState().contrast.value).toBe(DEFAULT_CONTRAST);

    store.setChromaticAberration(0.5);
    store.resetEffect('chromatic_aberration');
    expect(useFilmStore.getState().chromaticAberration.value).toBe(DEFAULT_CHROMATIC_ABERRATION);
    expect(useFilmStore.getState().aberrationDirection.value).toBe(0);

    store.setSharpening(1.0);
    store.resetEffect('sharpening');
    expect(useFilmStore.getState().sharpening.value).toBe(0.0);

    store.setNoiseReductionAuto(false);
    store.resetEffect('noise_reduction');
    expect(useFilmStore.getState().noiseReductionAuto.value).toBe(true);

    store.setTemperature(6500);
    store.resetEffect('temperature');
    expect(useFilmStore.getState().temperature.value).toBe(DEFAULT_TEMPERATURE);
    expect(useFilmStore.getState().tint.value).toBe(DEFAULT_TINT);
    expect(useFilmStore.getState().temperatureAuto.value).toBe(true);
  });
});
