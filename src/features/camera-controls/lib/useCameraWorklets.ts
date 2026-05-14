import { SharedValue } from 'react-native-reanimated';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';

/**
 * Safety Guardrail: A worklet-friendly way to update Reanimated SharedValues.
 * This ensures that mutations are encapsulated and can include validation logic.
 */

export const useCameraWorklets = (
  grainIntensity: SharedValue<number>,
  grainEnabled: SharedValue<boolean>,
  saturation: SharedValue<number>,
  contrast: SharedValue<number>,
  chromaticAberration: SharedValue<number>,
  iso: SharedValue<number>,
  ev: SharedValue<number>,
  shutterSpeed: SharedValue<number>,
  whiteBalance: SharedValue<number>,
  isoAuto: SharedValue<boolean>,
  evAuto: SharedValue<boolean>,
  shutterSpeedAuto: SharedValue<boolean>,
  whiteBalanceAuto: SharedValue<boolean>,
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

  const updateWhiteBalance = (value: number) => {
    'worklet';
    updateSharedValue(whiteBalance, value);
    updateSharedValue(whiteBalanceAuto, false);
  };

  return {
    updateGrain,
    updateSaturation,
    updateContrast,
    updateChromaticAberration,
    updateIso,
    updateEv,
    updateShutterSpeed,
    updateWhiteBalance,
  };
};

