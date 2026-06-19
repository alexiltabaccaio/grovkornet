import { useFilmStore } from './useFilmStore';
import { 
  DEFAULT_CONTRAST,
  DEFAULT_BLACK_LEVEL,
  DEFAULT_HIGHLIGHTS,
  DEFAULT_PIVOT,
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

});
