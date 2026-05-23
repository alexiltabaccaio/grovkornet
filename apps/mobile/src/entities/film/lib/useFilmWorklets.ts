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

    const updateContrast = (value: number) => {
      'worklet';
      updateSharedValue(film.contrast, value);
    };

    const updateChromaticAberration = (value: number) => {
      'worklet';
      updateSharedValue(film.chromaticAberration, value);
    };

    const updateAberrationDirection = (value: number) => {
      'worklet';
      updateSharedValue(film.aberrationDirection, value);
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
      updateSaturation,
      updateSatRed,
      updateSatOrange,
      updateSatYellow,
      updateSatGreen,
      updateSatCyan,
      updateSatBlue,
      updateSatPurple,
      updateSatMagenta,
      updateContrast,
      updateChromaticAberration,
      updateAberrationDirection,
      updateTemperature,
      updateTint,
      updateSharpening,
      updateBloomIntensity,
    };
  }, []);
};
