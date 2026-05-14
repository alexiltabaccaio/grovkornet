import React from 'react';
import { StyleSheet } from 'react-native';
import { useCameraEffectsStore } from '../model/useCameraEffectsStore';
import { NativeFilmCamera } from '@entities/camera/ui/NativeFilmCamera';

interface ConnectedFilmCameraProps {
  cameraKey?: number;
}

import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';

export const ConnectedFilmCamera = ({ cameraKey }: ConnectedFilmCameraProps) => {
  const store = useCameraEffectsStore();

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
      onCapabilitiesUpdate={(event) => {
        if (event.nativeEvent) {
          store.setCapabilities(event.nativeEvent);
        }
      }}
      onDebugUpdate={(event) => {
        if (event.nativeEvent) {
          store.setDebugInfo(event.nativeEvent.fps, event.nativeEvent.resolution);
        }
      }}
      onExposureUpdate={(event) => {
        if (event.nativeEvent) {
          if (store.isoAuto.value) {
            updateSharedValue(store.iso, event.nativeEvent.iso);
          }
          if (store.shutterSpeedAuto.value) {
            updateSharedValue(store.shutterSpeed, event.nativeEvent.shutterSpeed);
          }
          if (store.focusAuto.value && event.nativeEvent.focusDistance !== undefined) {
            updateSharedValue(store.focusDistance, event.nativeEvent.focusDistance);
          }
        }
      }}
    />
  );
};
