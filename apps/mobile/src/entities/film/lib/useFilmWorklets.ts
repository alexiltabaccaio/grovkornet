import { useMemo } from 'react';
import { useFilmStore, getNitroConfig } from '../model/useFilmStore';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';

export const useFilmWorklets = () => {
  const config = getNitroConfig();

  return useMemo(() => {
    const film = useFilmStore.getState();

    const updateGrain = (value: number) => {
      'worklet';
      const safeValue = Math.min(Math.max(value, 0), 2.0);
      updateSharedValue(film.grainIntensity, safeValue);
      updateSharedValue(film.grainEnabled, safeValue > 0);
      config.grainIntensity = safeValue;
      config.grainEnabled = safeValue > 0;
    };
    
    const updateGrainChroma = (value: number) => {
      'worklet';
      updateSharedValue(film.grainChroma, value);
      config.grainChroma = value;
    };
    
    const updateGrainSize = (value: number) => {
      'worklet';
      updateSharedValue(film.grainSize, value);
      config.grainSize = value;
    };

    const updateGrainSpeed = (value: number) => {
      'worklet';
      updateSharedValue(film.grainSpeed, value);
      config.grainSpeed = value;
    };

    const updateGrainRoughness = (value: number) => {
      'worklet';
      updateSharedValue(film.grainRoughness, value);
      config.grainRoughness = value;
    };

    const updateSaturation = (value: number) => {
      'worklet';
      updateSharedValue(film.saturation, value);
      config.saturation = value;
    };

    const updateSatRed = (value: number) => {
      'worklet';
      updateSharedValue(film.satRed, value);
      config.satRed = value;
    };

    const updateSatOrange = (value: number) => {
      'worklet';
      updateSharedValue(film.satOrange, value);
      config.satOrange = value;
    };

    const updateSatYellow = (value: number) => {
      'worklet';
      updateSharedValue(film.satYellow, value);
      config.satYellow = value;
    };

    const updateSatGreen = (value: number) => {
      'worklet';
      updateSharedValue(film.satGreen, value);
      config.satGreen = value;
    };

    const updateSatCyan = (value: number) => {
      'worklet';
      updateSharedValue(film.satCyan, value);
      config.satCyan = value;
    };

    const updateSatBlue = (value: number) => {
      'worklet';
      updateSharedValue(film.satBlue, value);
      config.satBlue = value;
    };

    const updateSatPurple = (value: number) => {
      'worklet';
      updateSharedValue(film.satPurple, value);
      config.satPurple = value;
    };

    const updateSatMagenta = (value: number) => {
      'worklet';
      updateSharedValue(film.satMagenta, value);
      config.satMagenta = value;
    };

    const updateBoundMagentaRed = (value: number) => {
      'worklet';
      updateSharedValue(film.boundMagentaRed, value);
      config.boundMagentaRed = value;
    };

    const updateBoundRedOrange = (value: number) => {
      'worklet';
      updateSharedValue(film.boundRedOrange, value);
      config.boundRedOrange = value;
    };

    const updateBoundOrangeYellow = (value: number) => {
      'worklet';
      updateSharedValue(film.boundOrangeYellow, value);
      config.boundOrangeYellow = value;
    };

    const updateBoundYellowGreen = (value: number) => {
      'worklet';
      updateSharedValue(film.boundYellowGreen, value);
      config.boundYellowGreen = value;
    };

    const updateBoundGreenCyan = (value: number) => {
      'worklet';
      updateSharedValue(film.boundGreenCyan, value);
      config.boundGreenCyan = value;
    };

    const updateBoundCyanBlue = (value: number) => {
      'worklet';
      updateSharedValue(film.boundCyanBlue, value);
      config.boundCyanBlue = value;
    };

    const updateBoundBluePurple = (value: number) => {
      'worklet';
      updateSharedValue(film.boundBluePurple, value);
      config.boundBluePurple = value;
    };

    const updateBoundPurpleMagenta = (value: number) => {
      'worklet';
      updateSharedValue(film.boundPurpleMagenta, value);
      config.boundPurpleMagenta = value;
    };

    const updateContrast = (value: number) => {
      'worklet';
      updateSharedValue(film.contrast, value);
      updateSharedValue(film.contrastAuto, false);
      config.contrast = value;
      config.contrastAuto = false;
    };

    const updateBlackLevel = (value: number) => {
      'worklet';
      updateSharedValue(film.blackLevel, value);
      updateSharedValue(film.blackLevelAuto, false);
      config.blackLevel = value;
      config.blackLevelAuto = false;
    };

    const updateHighlights = (value: number) => {
      'worklet';
      updateSharedValue(film.highlights, value);
      updateSharedValue(film.highlightsAuto, false);
      config.highlights = value;
      config.highlightsAuto = false;
    };

    const updatePivot = (value: number) => {
      'worklet';
      updateSharedValue(film.pivot, value);
      updateSharedValue(film.pivotAuto, false);
      config.pivot = value;
      config.pivotAuto = false;
    };

    const updateChromaticAberration = (value: number) => {
      'worklet';
      updateSharedValue(film.chromaticAberration, value);
      config.chromaticAberration = value;
    };

    const updateAberrationInvert = (value: boolean) => {
      'worklet';
      updateSharedValue(film.aberrationInvert, value);
      config.aberrationInvert = value;
    };

    const updateChromaShift = (value: number) => {
      'worklet';
      updateSharedValue(film.chromaShift, value);
      config.chromaShift = value;
    };

    const updateChromaShiftDirection = (value: number) => {
      'worklet';
      updateSharedValue(film.chromaShiftDirection, value);
      config.chromaShiftDirection = value;
    };

    const updateChromaShiftInvert = (value: boolean) => {
      'worklet';
      updateSharedValue(film.chromaShiftInvert, value);
      config.chromaShiftInvert = value;
    };

    const updateTapeJitter = (value: number) => {
      'worklet';
      updateSharedValue(film.tapeJitter, value);
      config.tapeJitter = value;
    };

    const updateScanlines = (value: number) => {
      'worklet';
      updateSharedValue(film.scanlines, value);
      config.scanlines = value;
    };

    const updateTemperature = (value: number) => {
      'worklet';
      updateSharedValue(film.temperature, value);
      updateSharedValue(film.temperatureAuto, false);
      config.whiteBalance = value;
    };

    const updateTint = (value: number) => {
      'worklet';
      updateSharedValue(film.tint, value);
      updateSharedValue(film.temperatureAuto, false);
      config.tint = value;
    };

    const updateSharpening = (value: number) => {
      'worklet';
      updateSharedValue(film.sharpening, value);
      config.sharpening = value;
    };

    const updatePixelationFactor = (value: number) => {
      'worklet';
      updateSharedValue(film.pixelationFactor, value);
      config.pixelationFactor = value;
    };

    const updateVignetteIntensity = (value: number) => {
      'worklet';
      updateSharedValue(film.vignetteIntensity, value);
      config.vignetteIntensity = value;
    };

    const updateBloomIntensity = (value: number) => {
      'worklet';
      const safeValue = Math.max(value, 0);
      updateSharedValue(film.bloomIntensity, safeValue);
      updateSharedValue(film.bloomEnabled, safeValue > 0);
      config.bloomIntensity = safeValue;
      config.bloomEnabled = safeValue > 0;
    };

    return {
      updateGrain,
      updateGrainChroma,
      updateGrainSize,
      updateGrainSpeed,
      updateGrainRoughness,
      updateSaturation,
      updateSatRed,
      updateSatOrange,
      updateSatYellow,
      updateSatGreen,
      updateSatCyan,
      updateSatBlue,
      updateSatPurple,
      updateSatMagenta,
      updateBoundMagentaRed,
      updateBoundRedOrange,
      updateBoundOrangeYellow,
      updateBoundYellowGreen,
      updateBoundGreenCyan,
      updateBoundCyanBlue,
      updateBoundBluePurple,
      updateBoundPurpleMagenta,
      updateContrast,
      updateBlackLevel,
      updateHighlights,
      updatePivot,
      updateChromaticAberration,
      updateAberrationInvert,
      updateChromaShift,
      updateChromaShiftDirection,
      updateChromaShiftInvert,
      updateTapeJitter,
      updateScanlines,
      updateTemperature,
      updateTint,
      updateSharpening,
      updateBloomIntensity,
      updatePixelationFactor,
      updateVignetteIntensity,
    };
  }, []);
};
