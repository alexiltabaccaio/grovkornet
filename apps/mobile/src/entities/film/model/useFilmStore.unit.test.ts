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
  DEFAULT_BOUND_MAGENTA_RED,
  DEFAULT_BLACK_LEVEL,
  DEFAULT_HIGHLIGHTS,
  DEFAULT_PIVOT,
  DEFAULT_GRAIN_CHROMA,
  DEFAULT_GRAIN_SIZE,
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

  it('sets Selective Saturation boundaries', () => {
    const store = useFilmStore.getState();
    store.setBoundMagentaRed(340);
    store.setBoundRedOrange(50);
    store.setBoundOrangeYellow(85);
    store.setBoundYellowGreen(120);
    store.setBoundGreenCyan(175);
    store.setBoundCyanBlue(225);
    store.setBoundBluePurple(285);
    store.setBoundPurpleMagenta(310);

    expect(useFilmStore.getState().boundMagentaRed.value).toBe(340);
    expect(useFilmStore.getState().boundRedOrange.value).toBe(50);
    expect(useFilmStore.getState().boundOrangeYellow.value).toBe(85);
    expect(useFilmStore.getState().boundYellowGreen.value).toBe(120);
    expect(useFilmStore.getState().boundGreenCyan.value).toBe(175);
    expect(useFilmStore.getState().boundCyanBlue.value).toBe(225);
    expect(useFilmStore.getState().boundBluePurple.value).toBe(285);
    expect(useFilmStore.getState().boundPurpleMagenta.value).toBe(310);
  });

  it('sets Chromatic Aberration and Chroma Shift Direction/Invert', () => {
    const store = useFilmStore.getState();
    store.setChromaticAberration(0.05);
    expect(useFilmStore.getState().chromaticAberration.value).toBe(0.05);

    store.setChromaShiftDirection(1);
    expect(useFilmStore.getState().chromaShiftDirection.value).toBe(1);

    store.setChromaShiftInvert(true);
    expect(useFilmStore.getState().chromaShiftInvert.value).toBe(true);
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

  it('sets Vignette Intensity', () => {
    const store = useFilmStore.getState();
    store.setVignetteIntensity(0.7);
    expect(useFilmStore.getState().vignetteIntensity.value).toBe(0.7);
  });

  it('sets Temperature and Tint', () => {
    const store = useFilmStore.getState();
    store.setTemperature(6500);
    expect(useFilmStore.getState().temperature.value).toBe(6500);
    expect(useFilmStore.getState().temperatureAuto.value).toBe(false);

    store.setTint(10);
    expect(useFilmStore.getState().tint.value).toBe(10);
  });

  it('sets Tone parameters: blackLevel, highlights, pivot, contrastAuto', () => {
    const store = useFilmStore.getState();
    
    store.setContrast(1.5);
    expect(useFilmStore.getState().contrast.value).toBe(1.5);
    expect(useFilmStore.getState().contrastAuto.value).toBe(false);

    store.setBlackLevel(0.2);
    expect(useFilmStore.getState().blackLevel.value).toBe(0.2);
    expect(useFilmStore.getState().blackLevelAuto.value).toBe(false);

    store.setHighlights(0.8);
    expect(useFilmStore.getState().highlights.value).toBe(0.8);
    expect(useFilmStore.getState().highlightsAuto.value).toBe(false);

    store.setPivot(0.4);
    expect(useFilmStore.getState().pivot.value).toBe(0.4);
    expect(useFilmStore.getState().pivotAuto.value).toBe(false);

    store.setContrastAuto(true);
    expect(useFilmStore.getState().contrastAuto.value).toBe(true);
    expect(useFilmStore.getState().contrast.value).toBe(DEFAULT_CONTRAST);

    store.setBlackLevelAuto(true);
    expect(useFilmStore.getState().blackLevelAuto.value).toBe(true);
    expect(useFilmStore.getState().blackLevel.value).toBe(DEFAULT_BLACK_LEVEL);

    store.setHighlightsAuto(true);
    expect(useFilmStore.getState().highlightsAuto.value).toBe(true);
    expect(useFilmStore.getState().highlights.value).toBe(DEFAULT_HIGHLIGHTS);

    store.setPivotAuto(true);
    expect(useFilmStore.getState().pivotAuto.value).toBe(true);
    expect(useFilmStore.getState().pivot.value).toBe(DEFAULT_PIVOT);
  });

  it('resets effects correctly', () => {
    const store = useFilmStore.getState();
    
    store.setGrainIntensity(0.9);
    store.resetEffect('grain');
    expect(useFilmStore.getState().grainIntensity.value).toBe(DEFAULT_GRAIN_INTENSITY);
    expect(useFilmStore.getState().grainEnabled.value).toBe(false);
    expect(useFilmStore.getState().grainChroma.value).toBe(DEFAULT_GRAIN_CHROMA);
    expect(useFilmStore.getState().grainSize.value).toBe(DEFAULT_GRAIN_SIZE);
    expect(useFilmStore.getState().grainSpeed.value).toBe(DEFAULT_GRAIN_SPEED);

    store.setSaturation(2.0);
    store.setSatRed(90);
    store.setSatBlue(10);
    store.setBoundMagentaRed(340);
    store.resetEffect('saturation');
    expect(useFilmStore.getState().saturation.value).toBe(DEFAULT_SATURATION);
    expect(useFilmStore.getState().satRed.value).toBe(DEFAULT_SELECTIVE_SATURATION);
    expect(useFilmStore.getState().satOrange.value).toBe(DEFAULT_SELECTIVE_SATURATION);
    expect(useFilmStore.getState().satBlue.value).toBe(DEFAULT_SELECTIVE_SATURATION);
    expect(useFilmStore.getState().boundMagentaRed.value).toBe(DEFAULT_BOUND_MAGENTA_RED);

    store.setContrast(2.0);
    store.resetEffect('contrast');
    expect(useFilmStore.getState().contrast.value).toBe(DEFAULT_CONTRAST);

    store.setChromaticAberration(0.5);
    store.resetEffect('chromatic_aberration');
    expect(useFilmStore.getState().chromaticAberration.value).toBe(DEFAULT_CHROMATIC_ABERRATION);

    store.setChromaShift(1.0);
    store.setChromaShiftDirection(1);
    store.setChromaShiftInvert(true);
    store.resetEffect('chroma_shift');
    expect(useFilmStore.getState().chromaShift.value).toBe(0.0);
    expect(useFilmStore.getState().chromaShiftDirection.value).toBe(0);
    expect(useFilmStore.getState().chromaShiftInvert.value).toBe(false);

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

    store.setBlackLevel(0.3);
    store.setHighlights(1.4);
    store.setPivot(0.7);
    store.resetEffect('tone');
    expect(useFilmStore.getState().blackLevel.value).toBe(DEFAULT_BLACK_LEVEL);
    expect(useFilmStore.getState().highlights.value).toBe(DEFAULT_HIGHLIGHTS);
    expect(useFilmStore.getState().pivot.value).toBe(DEFAULT_PIVOT);
    expect(useFilmStore.getState().blackLevelAuto.value).toBe(true);
    expect(useFilmStore.getState().highlightsAuto.value).toBe(true);
    expect(useFilmStore.getState().pivotAuto.value).toBe(true);

    store.setVignetteIntensity(0.8);
    store.resetEffect('vignette');
    expect(useFilmStore.getState().vignetteIntensity.value).toBe(0.0);
  });

  it('sets isSelfieCamera correctly and resets it', () => {
    const store = useFilmStore.getState();
    expect(store.isSelfieCamera.value).toBe(false);

    store.setIsSelfieCamera(true);
    expect(useFilmStore.getState().isSelfieCamera.value).toBe(true);

    store.resetEffect('camera_facing');
    expect(useFilmStore.getState().isSelfieCamera.value).toBe(false);
  });

  it('resets parameters correctly using resetParameter', () => {
    const store = useFilmStore.getState();

    const spyTemp = jest.spyOn(store, 'setTemperatureAuto');
    const spyContrast = jest.spyOn(store, 'setContrastAuto');
    const spyPivot = jest.spyOn(store, 'setPivotAuto');
    const spyBlack = jest.spyOn(store, 'setBlackLevelAuto');
    const spyHighlights = jest.spyOn(store, 'setHighlightsAuto');
    const spyResetEffect = jest.spyOn(store, 'resetEffect');

    expect(store.resetParameter('temperature')).toBe(true);
    expect(spyTemp).toHaveBeenCalledWith(true);

    expect(store.resetParameter('contrast')).toBe(true);
    expect(spyContrast).toHaveBeenCalledWith(true);
    expect(spyPivot).toHaveBeenCalledWith(true);

    expect(store.resetParameter('blackLevel')).toBe(true);
    expect(spyBlack).toHaveBeenCalledWith(true);

    expect(store.resetParameter('highlights')).toBe(true);
    expect(spyHighlights).toHaveBeenCalledWith(true);

    expect(store.resetParameter('grain')).toBe(true);
    expect(spyResetEffect).toHaveBeenCalledWith('grain');

    expect(store.resetParameter('ev' as any)).toBe(false);

    spyTemp.mockRestore();
    spyContrast.mockRestore();
    spyPivot.mockRestore();
    spyBlack.mockRestore();
    spyHighlights.mockRestore();
    spyResetEffect.mockRestore();
  });
});
