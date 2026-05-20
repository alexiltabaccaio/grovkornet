import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';
import { 
  DEFAULT_EV,
} from '@grovkornet/shared';

export const useCameraWorklets = () => {
  const styles = useStylesStore();
  const hw = useHardwareStore();

  const updateGrain = (value: number) => {
    'worklet';
    const safeValue = Math.min(Math.max(value, 0), 1);
    updateSharedValue(styles.grainIntensity, safeValue);
    updateSharedValue(styles.grainEnabled, safeValue > 0);
  };
  
  const updateGrainChroma = (value: number) => {
    'worklet';
    updateSharedValue(styles.grainChroma, value);
  };
  
  const updateGrainSize = (value: number) => {
    'worklet';
    updateSharedValue(styles.grainSize, value);
  };

  const updateSaturation = (value: number) => {
    'worklet';
    updateSharedValue(styles.saturation, value);
  };

  const updateContrast = (value: number) => {
    'worklet';
    updateSharedValue(styles.contrast, value);
  };

  const updateChromaticAberration = (value: number) => {
    'worklet';
    updateSharedValue(styles.chromaticAberration, value);
  };

  const updateAberrationDirection = (value: number) => {
    'worklet';
    updateSharedValue(styles.aberrationDirection, value);
  };

  const updateIso = (value: number) => {
    'worklet';
    updateSharedValue(hw.iso, value);
    updateSharedValue(hw.isoAuto, false);
    updateSharedValue(hw.shutterSpeedAuto, false);
    updateSharedValue(hw.evAuto, true);
    updateSharedValue(hw.ev, DEFAULT_EV);
  };

  const updateEv = (value: number) => {
    'worklet';
    updateSharedValue(hw.ev, value);
    updateSharedValue(hw.evAuto, false);
    updateSharedValue(hw.isoAuto, true);
    updateSharedValue(hw.shutterSpeedAuto, true);
  };

  const updateShutterSpeed = (value: number) => {
    'worklet';
    updateSharedValue(hw.shutterSpeed, value);
    updateSharedValue(hw.shutterSpeedAuto, false);
    updateSharedValue(hw.isoAuto, false);
    updateSharedValue(hw.evAuto, true);
    updateSharedValue(hw.ev, DEFAULT_EV);
  };

  const updateTemperature = (value: number) => {
    'worklet';
    updateSharedValue(hw.temperature, value);
    updateSharedValue(hw.temperatureAuto, false);
  };

  const updateTint = (value: number) => {
    'worklet';
    updateSharedValue(hw.tint, value);
    updateSharedValue(hw.temperatureAuto, false);
  };

  const updateFocusDistance = (value: number) => {
    'worklet';
    updateSharedValue(hw.focusDistance, value);
    updateSharedValue(hw.focusAuto, false);
  };

  const updateSharpening = (value: number) => {
    'worklet';
    updateSharedValue(styles.sharpening, value);
  };

  const updateTorchStrength = (value: number) => {
    'worklet';
    updateSharedValue(hw.torchStrength, value);
  };

  return {
    updateGrain,
    updateGrainChroma,
    updateGrainSize,
    updateSaturation,
    updateContrast,
    updateChromaticAberration,
    updateAberrationDirection,
    updateIso,
    updateEv,
    updateShutterSpeed,
    updateTemperature,
    updateTint,
    updateFocusDistance,
    updateSharpening,
    updateTorchStrength,
  };
};
