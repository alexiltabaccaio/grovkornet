import { useCallback } from 'react';
import { useEvent, runOnJS } from 'react-native-reanimated';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';
import { useBodyStore, BodyCapabilities } from '@entities/body';
import { useLensStore, LensCapabilities } from '@entities/lens';
import { useFilmStore, FilmCapabilities } from '@entities/film';

interface ExposureUpdatePayload {
  iso: number;
  shutterSpeed: number;
  focusDistance?: number;
  noiseReduction?: number;
  activeCameraId?: string;
}

interface DebugUpdatePayload {
  fps: number;
  hwFps: number;
  resolution: string;
  timestamp?: number;
}

export const useCameraEvents = () => {
  // Destructure ONLY the SharedValues needed in the worklets to prevent capturing the entire store objects
  const { 
    isoAuto, 
    iso, 
    shutterSpeedAuto, 
    shutterSpeed, 
    fps, 
    hwFps, 
    resolution, 
    torchState 
  } = useBodyStore.getState();
  
  const { 
    focusAuto, 
    focusDistance 
  } = useLensStore.getState();
  
  const { 
    noiseReductionAuto, 
    noiseReductionMode 
  } = useFilmStore.getState();

  // Extract JS functions to avoid capturing the whole store object on Hermes JSI via JSI reference copying
  const setActiveCameraId = useLensStore.getState().setActiveCameraId;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exposureHandler = useEvent((event: any) => {
    'worklet';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nativeEvent = (event.nativeEvent || event) as ExposureUpdatePayload;
    if (isoAuto.value) {
      updateSharedValue(iso, nativeEvent.iso);
    }
    if (shutterSpeedAuto.value) {
      updateSharedValue(shutterSpeed, nativeEvent.shutterSpeed);
    }
    if (focusAuto.value && nativeEvent.focusDistance !== undefined) {
      updateSharedValue(focusDistance, nativeEvent.focusDistance);
    }
    if (noiseReductionAuto.value && nativeEvent.noiseReduction !== undefined) {
      updateSharedValue(noiseReductionMode, nativeEvent.noiseReduction);
    }
    if (nativeEvent.activeCameraId !== undefined) {
      runOnJS(setActiveCameraId)(nativeEvent.activeCameraId);
    }
  }, ['onExposureUpdate']);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debugHandler = useEvent((event: any) => {
    'worklet';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nativeEvent = (event.nativeEvent || event) as DebugUpdatePayload;

    // Bridge latency logging disabled to reduce terminal noise

    updateSharedValue(fps, nativeEvent.fps);
    updateSharedValue(hwFps, nativeEvent.hwFps);
     
    resolution.value = nativeEvent.resolution;
  }, ['onDebugUpdate']);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const capabilitiesHandler = useCallback((event: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nativeEvent = (event?.nativeEvent || event) as BodyCapabilities & LensCapabilities & FilmCapabilities;
    if (nativeEvent) {
      useBodyStore.getState().setCapabilities(nativeEvent);
      useLensStore.getState().setCapabilities(nativeEvent);
      const filmStore = useFilmStore.getState();
      if (filmStore.setCapabilities) {
        filmStore.setCapabilities(nativeEvent);
      }
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const torchStateHandler = useCallback((event: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nativeEvent = (event?.nativeEvent || event) as { enabled: boolean };
    if (nativeEvent && nativeEvent.enabled !== undefined) {
      updateSharedValue(torchState, nativeEvent.enabled ? 1 : 0);
    }
  }, [torchState]);

  return {
    exposureHandler,
    debugHandler,
    capabilitiesHandler,
    torchStateHandler,
  };
};
