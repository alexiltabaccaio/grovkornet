import { SharedValue } from 'react-native-reanimated';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';

/**
 * Safety Guardrail: A worklet-friendly way to update Reanimated SharedValues.
 * This ensures that mutations are encapsulated and can include validation logic.
 */

export const useCameraWorklets = (
  grainIntensity: SharedValue<number>,
  grainChroma: SharedValue<number>,
  grainSize: SharedValue<number>,
  grainEnabled: SharedValue<boolean>,
  saturation: SharedValue<number>,
  contrast: SharedValue<number>,
  chromaticAberration: SharedValue<number>,
  iso: SharedValue<number>,
  ev: SharedValue<number>,
  shutterSpeed: SharedValue<number>,
  temperature: SharedValue<number>,
  isoAuto: SharedValue<boolean>,
  evAuto: SharedValue<boolean>,
  shutterSpeedAuto: SharedValue<boolean>,
  temperatureAuto: SharedValue<boolean>,
  focusDistance: SharedValue<number>,
  focusAuto: SharedValue<boolean>,
) => {
  /**
   * Updates the grain intensity and automatically toggles the enabled state.
   * @param value Normalized value 0-1
   */
  const updateGrain = (value: number) => {
    'worklet';
    const safeValue = Math.min(Math.max(value, 0), 1);
    updateSharedValue(grainIntensity, safeValue);
    updateSharedValue(grainEnabled, safeValue > 0);
  };
  
  const updateGrainChroma = (value: number) => {
    'worklet';
    updateSharedValue(grainChroma, value);
  };
  
  const updateGrainSize = (value: number) => {
    'worklet';
    updateSharedValue(grainSize, value);
  };

  const updateSaturation = (value: number) => {
    'worklet';
    updateSharedValue(saturation, value);
  };

  const updateContrast = (value: number) => {
    'worklet';
    updateSharedValue(contrast, value);
  };

  const updateChromaticAberration = (value: number) => {
    'worklet';
    updateSharedValue(chromaticAberration, value);
  };

  const updateIso = (value: number) => {
    'worklet';
    updateSharedValue(iso, value);
    updateSharedValue(isoAuto, false);
  };

  const updateEv = (value: number) => {
    'worklet';
    updateSharedValue(ev, value);
    updateSharedValue(evAuto, false);
  };

  const updateShutterSpeed = (value: number) => {
    'worklet';
    updateSharedValue(shutterSpeed, value);
    updateSharedValue(shutterSpeedAuto, false);
  };

  const updateTemperature = (value: number) => {
    'worklet';
    updateSharedValue(temperature, value);
    updateSharedValue(temperatureAuto, false);
  };

  const updateFocusDistance = (value: number) => {
    'worklet';
    updateSharedValue(focusDistance, value);
    updateSharedValue(focusAuto, false);
  };

  return {
    updateGrain,
    updateGrainChroma,
    updateGrainSize,
    updateSaturation,
    updateContrast,
    updateChromaticAberration,
    updateIso,
    updateEv,
    updateShutterSpeed,
    updateTemperature,
    updateFocusDistance,
  };
};

