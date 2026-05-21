import { useEvent } from 'react-native-reanimated';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';
import { BodyStore, BodyCapabilities } from '@entities/body';
import { LensStore, LensCapabilities } from '@entities/lens';
import { FilmStore, FilmCapabilities } from '@entities/film';

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
  bodyStore: BodyStore,
  lensStore: LensStore,
  filmStore: FilmStore
) => {
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

  return {
    exposureHandler,
    debugHandler,
    capabilitiesHandler,
  };
};
