import React from 'react';
import { StyleSheet } from 'react-native';
import { useCameraEffectsStore } from '../model/useCameraEffectsStore';
import { NativeFilmCamera } from '@entities/camera/ui/NativeFilmCamera';

interface ConnectedFilmCameraProps {
  cameraKey?: number;
}

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
      grainEnabled={store.grainEnabled}
      iso={store.iso}
      exposureTime={store.shutterSpeed}
      ev={store.ev}
      whiteBalance={store.whiteBalance}
      isoAuto={store.isoAuto}
      shutterSpeedAuto={store.shutterSpeedAuto}
      whiteBalanceAuto={store.whiteBalanceAuto}
      onDebugUpdate={(event) => {
        if (event.nativeEvent) {
          store.setDebugInfo(event.nativeEvent.fps, event.nativeEvent.resolution);
        }
      }}
      onExposureUpdate={(event) => {
        if (event.nativeEvent) {
          if (store.isoAuto.value) store.iso.value = event.nativeEvent.iso;
          if (store.shutterSpeedAuto.value) store.shutterSpeed.value = event.nativeEvent.shutterSpeed;
        }
      }}
    />
  );
};
