import { useFilmStore } from '../model/useFilmStore';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';

export const useFilmWorklets = () => {
  const film = useFilmStore();

  const updateGrain = (value: number) => {
    'worklet';
    const safeValue = Math.min(Math.max(value, 0), 1);
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

  const updateSaturation = (value: number) => {
    'worklet';
    updateSharedValue(film.saturation, value);
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
    updateSaturation,
    updateContrast,
    updateChromaticAberration,
    updateAberrationDirection,
    updateTemperature,
    updateTint,
    updateSharpening,
    updateBloomIntensity,
  };
};
