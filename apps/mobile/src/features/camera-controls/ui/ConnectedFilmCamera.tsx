import React from 'react';
import { StyleSheet } from 'react-native';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { NativeFilmCamera } from '@entities/camera/ui/NativeFilmCamera';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { FlashOverlay } from './FlashOverlay';
import { useCameraCapture } from '@features/camera-controls/lib/useCameraCapture';
import { useCameraEvents } from '@features/camera-controls/lib/useCameraEvents';

interface ConnectedFilmCameraProps {
  cameraKey?: number;
}

export const ConnectedFilmCamera = ({ cameraKey }: ConnectedFilmCameraProps) => {
  const hwStore = useHardwareStore();
  const styleStore = useStylesStore();
  const setLatestCapturedUri = useUIStore(state => state.setLatestCapturedUri);
  const cameraRef = useCameraCapture();
  const { exposureHandler, debugHandler, capabilitiesHandler } = useCameraEvents(hwStore, styleStore);

  const photoHandler = React.useCallback((event: { nativeEvent: { uri: string } }) => {
    setLatestCapturedUri(event.nativeEvent.uri);
  }, [setLatestCapturedUri]);

  const resolvedNoiseReduction = useDerivedValue(() => {
    return styleStore.noiseReductionAuto.value ? -1 : styleStore.noiseReductionMode.value;
  });

  const resolvedTorchStrength = useDerivedValue(() => {
    return Math.max(1, Math.round(hwStore.torchStrength.value * (hwStore.capabilities.maxTorchStrength ?? 1)));
  });

  return (
    <>
      <NativeFilmCamera
        ref={cameraRef}
        key={`camera-${cameraKey}`}
        style={StyleSheet.absoluteFill}
        saturation={styleStore.saturation as unknown as SharedValue<number | undefined>}
        contrast={styleStore.contrast as unknown as SharedValue<number | undefined>}
        chromaticAberration={styleStore.chromaticAberration as unknown as SharedValue<number | undefined>}
        aberrationDirection={styleStore.aberrationDirection as unknown as SharedValue<number | undefined>}
        grainIntensity={styleStore.grainIntensity as unknown as SharedValue<number | undefined>}
        grainChroma={styleStore.grainChroma as unknown as SharedValue<number | undefined>}
        grainSize={styleStore.grainSize as unknown as SharedValue<number | undefined>}
        grainEnabled={styleStore.grainEnabled as unknown as SharedValue<boolean | undefined>}
        iso={hwStore.iso as unknown as SharedValue<number | undefined>}
        exposureTime={hwStore.shutterSpeed as unknown as SharedValue<number | undefined>}
        ev={hwStore.ev as unknown as SharedValue<number | undefined>}
        whiteBalance={hwStore.temperature as unknown as SharedValue<number | undefined>}
        tint={hwStore.tint as unknown as SharedValue<number | undefined>}
        isoAuto={hwStore.isoAuto as unknown as SharedValue<boolean | undefined>}
        shutterSpeedAuto={hwStore.shutterSpeedAuto as unknown as SharedValue<boolean | undefined>}
        whiteBalanceAuto={hwStore.temperatureAuto as unknown as SharedValue<boolean | undefined>}
        autoFocus={hwStore.focusAuto as unknown as SharedValue<boolean | undefined>}
        focusDistance={hwStore.focusDistance as unknown as SharedValue<number | undefined>}
        cameraId={hwStore.cameraAuto ? undefined : hwStore.cameraId}
        torchState={hwStore.torchState as unknown as SharedValue<number | undefined>}
        torchStrength={resolvedTorchStrength as unknown as SharedValue<number | undefined>}
        noiseReduction={resolvedNoiseReduction as unknown as SharedValue<number | undefined>}
        sharpening={styleStore.sharpening as unknown as SharedValue<number | undefined>}
        aspectRatio={hwStore.aspectRatio as unknown as SharedValue<number | undefined>}
        resolutionSetting={hwStore.resolutionSetting as unknown as SharedValue<number | undefined>}
        targetFps={hwStore.fpsSetting as unknown as SharedValue<number | undefined>}
        onCapabilitiesUpdate={capabilitiesHandler}
        onDebugUpdate={debugHandler}
        onExposureUpdate={exposureHandler}
        onPhotoCaptured={photoHandler}
      />
      <FlashOverlay />
    </>
  );
};
