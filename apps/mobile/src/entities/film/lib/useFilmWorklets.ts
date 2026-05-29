import { useMemo } from 'react';
import { useFilmStore } from '../model/useFilmStore';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';

export const useFilmWorklets = () => {
  return useMemo(() => {
    const film = useFilmStore.getState();

    const updateGrain = (value: number) => {
      'worklet';
      const safeValue = Math.min(Math.max(value, 0), 2.0);
      updateSharedValue(film.grainIntensity, safeValue);
      updateSharedValue(film.grainEnabled, safeValue > 0);
    };
    
    const updateGrainChroma = (value: number) => {
      'worklet';
      updateSharedValue(film.grainChroma, value);
    };
    
    const updateGrainSize = (value: number) => {
      'worklet';
      updateSharedValue(film.grainSize, value);
    };

    const updateGrainSpeed = (value: number) => {
      'worklet';
      updateSharedValue(film.grainSpeed, value);
    };

    const updateGrainRoughness = (value: number) => {
      'worklet';
      updateSharedValue(film.grainRoughness, value);
    };

    const updateSaturation = (value: number) => {
      'worklet';
      updateSharedValue(film.saturation, value);
    };

    const updateSatRed = (value: number) => {
      'worklet';
      updateSharedValue(film.satRed, value);
    };

    const updateSatOrange = (value: number) => {
      'worklet';
      updateSharedValue(film.satOrange, value);
    };

    const updateSatYellow = (value: number) => {
      'worklet';
      updateSharedValue(film.satYellow, value);
    };

    const updateSatGreen = (value: number) => {
      'worklet';
      updateSharedValue(film.satGreen, value);
    };

    const updateSatCyan = (value: number) => {
      'worklet';
      updateSharedValue(film.satCyan, value);
    };

    const updateSatBlue = (value: number) => {
      'worklet';
      updateSharedValue(film.satBlue, value);
    };

    const updateSatPurple = (value: number) => {
      'worklet';
      updateSharedValue(film.satPurple, value);
    };

    const updateSatMagenta = (value: number) => {
      'worklet';
      updateSharedValue(film.satMagenta, value);
    };

    const updateBoundMagentaRed = (value: number) => {
      'worklet';
      updateSharedValue(film.boundMagentaRed, value);
    };

    const updateBoundRedOrange = (value: number) => {
      'worklet';
      updateSharedValue(film.boundRedOrange, value);
    };

    const updateBoundOrangeYellow = (value: number) => {
      'worklet';
      updateSharedValue(film.boundOrangeYellow, value);
    };

    const updateBoundYellowGreen = (value: number) => {
      'worklet';
      updateSharedValue(film.boundYellowGreen, value);
    };

    const updateBoundGreenCyan = (value: number) => {
      'worklet';
      updateSharedValue(film.boundGreenCyan, value);
    };

    const updateBoundCyanBlue = (value: number) => {
      'worklet';
      updateSharedValue(film.boundCyanBlue, value);
    };

    const updateBoundBluePurple = (value: number) => {
      'worklet';
      updateSharedValue(film.boundBluePurple, value);
    };

    const updateBoundPurpleMagenta = (value: number) => {
      'worklet';
      updateSharedValue(film.boundPurpleMagenta, value);
    };

    const updateContrast = (value: number) => {
      'worklet';
      updateSharedValue(film.contrast, value);
      updateSharedValue(film.contrastAuto, false);
    };

    const updateBlackLevel = (value: number) => {
      'worklet';
      updateSharedValue(film.blackLevel, value);
      updateSharedValue(film.blackLevelAuto, false);
    };

    const updateHighlights = (value: number) => {
      'worklet';
      updateSharedValue(film.highlights, value);
      updateSharedValue(film.highlightsAuto, false);
    };

    const updatePivot = (value: number) => {
      'worklet';
      updateSharedValue(film.pivot, value);
      updateSharedValue(film.pivotAuto, false);
    };

    const updateChromaticAberration = (value: number) => {
      'worklet';
      updateSharedValue(film.chromaticAberration, value);
    };

    const updateAberrationDirection = (value: number) => {
      'worklet';
      updateSharedValue(film.aberrationDirection, value);
    };

    const updateAberrationInvert = (value: boolean) => {
      'worklet';
      updateSharedValue(film.aberrationInvert, value);
    };

    const updateTemperature = (value: number) => {
      'worklet';
      updateSharedValue(film.temperature, value);
      updateSharedValue(film.temperatureAuto, false);
    };

    const updateTint = (value: number) => {
      'worklet';
      updateSharedValue(film.tint, value);
      updateSharedValue(film.temperatureAuto, false);
    };

    const updateSharpening = (value: number) => {
      'worklet';
      updateSharedValue(film.sharpening, value);
    };

    const updateBloomIntensity = (value: number) => {
      'worklet';
      const safeValue = Math.max(value, 0);
      updateSharedValue(film.bloomIntensity, safeValue);
      updateSharedValue(film.bloomEnabled, safeValue > 0);
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
      updateAberrationDirection,
      updateAberrationInvert,
      updateTemperature,
      updateTint,
      updateSharpening,
      updateBloomIntensity,
    };
  }, []);
};
