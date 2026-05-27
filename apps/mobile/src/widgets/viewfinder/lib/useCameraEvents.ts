import { useEvent } from 'react-native-reanimated';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';
import { useBodyStore, BodyCapabilities } from '@entities/body';
import { useLensStore, LensCapabilities } from '@entities/lens';
import { useFilmStore, FilmCapabilities } from '@entities/film';

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
  timestamp?: number;
}

export const useCameraEvents = () => {
  const bodyStore = useBodyStore.getState();
  const lensStore = useLensStore.getState();
  const filmStore = useFilmStore.getState();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exposureHandler = useEvent((event: any) => {
    'worklet';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nativeEvent = (event.nativeEvent || event) as ExposureUpdatePayload;
    if (bodyStore.isoAuto.value) {
      updateSharedValue(bodyStore.iso, nativeEvent.iso);
    }
    if (bodyStore.shutterSpeedAuto.value) {
      updateSharedValue(bodyStore.shutterSpeed, nativeEvent.shutterSpeed);
    }
    if (lensStore.focusAuto.value && nativeEvent.focusDistance !== undefined) {
      updateSharedValue(lensStore.focusDistance, nativeEvent.focusDistance);
    }
    if (filmStore.noiseReductionAuto.value && nativeEvent.noiseReduction !== undefined) {
      updateSharedValue(filmStore.noiseReductionMode, nativeEvent.noiseReduction);
    }
  }, ['onExposureUpdate']);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debugHandler = useEvent((event: any) => {
    'worklet';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nativeEvent = (event.nativeEvent || event) as DebugUpdatePayload;

    if (__DEV__ && nativeEvent.timestamp) {
      const bridgeTime = Date.now() - nativeEvent.timestamp;
      if (bridgeTime > 15) {
        // eslint-disable-next-line no-console
        console.log(`[Bridge Latency] onDebugUpdate took ${bridgeTime}ms to reach JS worklet`);
      }
    }

    updateSharedValue(bodyStore.fps, nativeEvent.fps);
    updateSharedValue(bodyStore.hwFps, nativeEvent.hwFps);
     
    bodyStore.resolution.value = nativeEvent.resolution;
  }, ['onDebugUpdate']);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const capabilitiesHandler = (event: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nativeEvent = (event?.nativeEvent || event) as BodyCapabilities & LensCapabilities & FilmCapabilities;
    if (nativeEvent) {
      bodyStore.setCapabilities(nativeEvent);
      lensStore.setCapabilities(nativeEvent);
      if (filmStore.setCapabilities) {
        filmStore.setCapabilities(nativeEvent);
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const torchStateHandler = (event: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nativeEvent = (event?.nativeEvent || event) as { enabled: boolean };
    if (nativeEvent && nativeEvent.enabled !== undefined) {
      updateSharedValue(bodyStore.torchState, nativeEvent.enabled ? 1 : 0);
    }
  };

  return {
    exposureHandler,
    debugHandler,
    capabilitiesHandler,
    torchStateHandler,
  };
};
