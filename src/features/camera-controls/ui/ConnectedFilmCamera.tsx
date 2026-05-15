import React from 'react';
import { StyleSheet } from 'react-native';
import { useCameraEffectsStore } from '../model/useCameraEffectsStore';
import { NativeFilmCamera } from '@entities/camera/ui/NativeFilmCamera';
import { useEvent } from 'react-native-reanimated';

interface ConnectedFilmCameraProps {
  cameraKey?: number;
}

import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';

export const ConnectedFilmCamera = ({ cameraKey }: ConnectedFilmCameraProps) => {
  const store = useCameraEffectsStore();

  const exposureHandler = useEvent((event: any) => {
    'worklet';
    if (store.isoAuto.value) {
      updateSharedValue(store.iso, event.iso);
    }
    if (store.shutterSpeedAuto.value) {
      updateSharedValue(store.shutterSpeed, event.shutterSpeed);
    }
    if (store.focusAuto.value && event.focusDistance !== undefined) {
      updateSharedValue(store.focusDistance, event.focusDistance);
    }
  }, ['onExposureUpdate']);

  const debugHandler = useEvent((event: any) => {
    'worklet';
    updateSharedValue(store.fps, event.fps);
    updateSharedValue(store.hwFps, event.hwFps);
    // Note: resolution is a string, updateSharedValue only handles number/boolean.
    // However, store.resolution.value = event.resolution is allowed in worklets for strings.
    store.resolution.value = event.resolution;
  }, ['onDebugUpdate']);

  return (
    <NativeFilmCamera
      key={`camera-${cameraKey}`}
      style={StyleSheet.absoluteFill}
      saturation={store.saturation}
      contrast={store.contrast}
      chromaticAberration={store.chromaticAberration}
      grainIntensity={store.grainIntensity}
      grainChroma={store.grainChroma}
      grainSize={store.grainSize}
      grainEnabled={store.grainEnabled}
      iso={store.iso}
      exposureTime={store.shutterSpeed}
      ev={store.ev}
      whiteBalance={store.whiteBalance}
      isoAuto={store.isoAuto}
      shutterSpeedAuto={store.shutterSpeedAuto}
      whiteBalanceAuto={store.whiteBalanceAuto}
      autoFocus={store.focusAuto}
      focusDistance={store.focusDistance}
      cameraId={store.cameraId}
      torchState={store.torchState}
      torchStrength={store.torchStrength}
      onCapabilitiesUpdate={(event) => {
        if (event.nativeEvent) {
          store.setCapabilities(event.nativeEvent);
        }
      }}
      onDebugUpdate={debugHandler}
      onExposureUpdate={exposureHandler}
    />
  );
};
