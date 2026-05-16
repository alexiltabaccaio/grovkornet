import React from 'react';
import { StyleSheet } from 'react-native';
import { useCameraEffectsStore } from '../model/useCameraEffectsStore';
import { NativeFilmCamera, NativeFilmCameraRef } from '@entities/camera/ui/NativeFilmCamera';
import { useEvent, useDerivedValue } from 'react-native-reanimated';
import { useUIStore } from '../model/useUIStore';

interface ConnectedFilmCameraProps {
  cameraKey?: number;
}

import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';
import { FlashOverlay } from './FlashOverlay';

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

export const ConnectedFilmCamera = ({ cameraKey }: ConnectedFilmCameraProps) => {
  const store = useCameraEffectsStore();
  const cameraRef = React.useRef<NativeFilmCameraRef>(null);
  const isCapturing = useUIStore(state => state.isCapturing);

  // Trigger scatto nativo quando lo store UI cambia
  React.useEffect(() => {
    if (isCapturing && cameraRef.current) {
      cameraRef.current.takePhoto();
      
      // Feedback visivo: Se siamo in AUTO, forziamo temporaneamente l'UI su HQ.
      // Il successivo aggiornamento hardware (entro 200ms) lo riporterà a FAST.
      if (store.noiseReductionAuto.value) {
        store.noiseReductionMode.value = 2;
      }
    }
  }, [isCapturing, store.noiseReductionAuto.value, store.noiseReductionMode]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exposureHandler = useEvent((event: any) => {
    'worklet';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nativeEvent = (event.nativeEvent || event) as ExposureUpdatePayload;
    if (store.isoAuto.value) {
      updateSharedValue(store.iso, nativeEvent.iso);
    }
    if (store.shutterSpeedAuto.value) {
      updateSharedValue(store.shutterSpeed, nativeEvent.shutterSpeed);
    }
    if (store.focusAuto.value && nativeEvent.focusDistance !== undefined) {
      updateSharedValue(store.focusDistance, nativeEvent.focusDistance);
    }
    if (store.noiseReductionAuto.value && nativeEvent.noiseReduction !== undefined) {
      updateSharedValue(store.noiseReductionMode, nativeEvent.noiseReduction);
    }
  }, ['onExposureUpdate']);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debugHandler = useEvent((event: any) => {
    'worklet';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nativeEvent = (event.nativeEvent || event) as DebugUpdatePayload;
    updateSharedValue(store.fps, nativeEvent.fps);
    updateSharedValue(store.hwFps, nativeEvent.hwFps);
    // Note: resolution is a string, updateSharedValue only handles number/boolean.
    // eslint-disable-next-line react-hooks/immutability
    store.resolution.value = nativeEvent.resolution;
  }, ['onDebugUpdate']);

  const resolvedNoiseReduction = useDerivedValue(() => {
    return store.noiseReductionAuto.value ? -1 : store.noiseReductionMode.value;
  }) as any;

  const CameraComponent = NativeFilmCamera as any;

  return (
    <>
      <CameraComponent
        ref={cameraRef}
        key={`camera-${cameraKey}`}
        style={StyleSheet.absoluteFill}
        saturation={store.saturation}
        contrast={store.contrast}
        chromaticAberration={store.chromaticAberration}
        aberrationDirection={store.aberrationDirection}
        grainIntensity={store.grainIntensity}
        grainChroma={store.grainChroma}
        grainSize={store.grainSize}
        grainEnabled={store.grainEnabled}
        iso={store.iso}
        exposureTime={store.shutterSpeed}
        ev={store.ev}
        whiteBalance={store.temperature}
        isoAuto={store.isoAuto}
        shutterSpeedAuto={store.shutterSpeedAuto}
        whiteBalanceAuto={store.temperatureAuto}
        autoFocus={store.focusAuto}
        focusDistance={store.focusDistance}
        cameraId={store.cameraId}
        torchState={store.torchState}
        torchStrength={store.torchStrength}
        noiseReduction={resolvedNoiseReduction}
        sharpening={store.sharpening}
        onCapabilitiesUpdate={(event: any) => {
          if (event?.nativeEvent) {
            store.setCapabilities(event.nativeEvent);
          }
        }}
        onDebugUpdate={debugHandler}
        onExposureUpdate={exposureHandler}
      />
      <FlashOverlay />
    </>
  );
};
