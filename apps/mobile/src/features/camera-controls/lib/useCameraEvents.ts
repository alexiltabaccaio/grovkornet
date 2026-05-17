import { useEvent } from 'react-native-reanimated';
import { HardwareStore, EffectsStore } from '@shared/types/stores';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';

interface ExposureUpdatePayload {
  iso: number;
  shutterSpeed: number;
  focusDistance?: number;
  noiseReduction?: number;
}

interface DebugUpdatePayload {
  fps: number;
  hwFps: number;
  resolution: string;
}

export const useCameraEvents = (
  hwStore: HardwareStore,
  styleStore: EffectsStore
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exposureHandler = useEvent((event: any) => {
    'worklet';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nativeEvent = (event.nativeEvent || event) as ExposureUpdatePayload;
    if (hwStore.isoAuto.value) {
      updateSharedValue(hwStore.iso, nativeEvent.iso);
    }
    if (hwStore.shutterSpeedAuto.value) {
      updateSharedValue(hwStore.shutterSpeed, nativeEvent.shutterSpeed);
    }
    if (hwStore.focusAuto.value && nativeEvent.focusDistance !== undefined) {
      updateSharedValue(hwStore.focusDistance, nativeEvent.focusDistance);
    }
    if (styleStore.noiseReductionAuto.value && nativeEvent.noiseReduction !== undefined) {
      updateSharedValue(styleStore.noiseReductionMode, nativeEvent.noiseReduction);
    }
  }, ['onExposureUpdate']);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debugHandler = useEvent((event: any) => {
    'worklet';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nativeEvent = (event.nativeEvent || event) as DebugUpdatePayload;
    updateSharedValue(hwStore.fps, nativeEvent.fps);
    updateSharedValue(hwStore.hwFps, nativeEvent.hwFps);
    // eslint-disable-next-line react-hooks/immutability
    hwStore.resolution.value = nativeEvent.resolution;
  }, ['onDebugUpdate']);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const capabilitiesHandler = (event: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nativeEvent = (event?.nativeEvent || event) as unknown;
    if (nativeEvent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      hwStore.setCapabilities(nativeEvent as any);
    }
  };

  return {
    exposureHandler,
    debugHandler,
    capabilitiesHandler,
  };
};
