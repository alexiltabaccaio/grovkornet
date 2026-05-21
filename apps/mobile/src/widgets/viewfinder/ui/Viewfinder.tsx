import React from 'react';
import { StyleSheet } from 'react-native';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { useFilmStore } from '@entities/film';
import { useSystemStore } from '@entities/system';
import { NativeRenderer } from '@entities/lens';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { FlashOverlay } from '@features/body-controls';
import { useCameraCapture } from '@widgets/viewfinder/lib/useCameraCapture';
import { useCameraEvents } from '@widgets/viewfinder/lib/useCameraEvents';

interface ViewfinderProps {
  cameraKey?: number;
}

export const Viewfinder = ({ cameraKey }: ViewfinderProps) => {
  const bodyStore = useBodyStore();
  const lensStore = useLensStore();
  const filmStore = useFilmStore();
  const setLatestCapturedUri = useSystemStore(state => state.setLatestCapturedUri);
  const cameraRef = useCameraCapture();
  const { exposureHandler, debugHandler, capabilitiesHandler } = useCameraEvents(bodyStore, lensStore, filmStore);

  const photoHandler = React.useCallback((event: { nativeEvent: { uri: string } }) => {
    setLatestCapturedUri(event.nativeEvent.uri);
  }, [setLatestCapturedUri]);

  const resolvedNoiseReduction = useDerivedValue(() => {
    return filmStore.noiseReductionAuto.value ? -1 : filmStore.noiseReductionMode.value;
  });

  const resolvedTorchStrength = useDerivedValue(() => {
    return Math.max(1, Math.round(bodyStore.torchStrength.value * (bodyStore.capabilities.maxTorchStrength ?? 1)));
  });

  return (
    <>
      <NativeRenderer
        ref={cameraRef}
        key={`camera-${cameraKey}`}
        style={StyleSheet.absoluteFill}
        saturation={filmStore.saturation as unknown as SharedValue<number | undefined>}
        contrast={filmStore.contrast as unknown as SharedValue<number | undefined>}
        chromaticAberration={filmStore.chromaticAberration as unknown as SharedValue<number | undefined>}
        aberrationDirection={filmStore.aberrationDirection as unknown as SharedValue<number | undefined>}
        grainIntensity={filmStore.grainIntensity as unknown as SharedValue<number | undefined>}
        grainChroma={filmStore.grainChroma as unknown as SharedValue<number | undefined>}
        grainSize={filmStore.grainSize as unknown as SharedValue<number | undefined>}
        grainEnabled={filmStore.grainEnabled as unknown as SharedValue<boolean | undefined>}
        bloomEnabled={filmStore.bloomEnabled as unknown as SharedValue<boolean | undefined>}
        bloomIntensity={filmStore.bloomIntensity as unknown as SharedValue<number | undefined>}
        iso={bodyStore.iso as unknown as SharedValue<number | undefined>}
        exposureTime={bodyStore.shutterSpeed as unknown as SharedValue<number | undefined>}
        ev={bodyStore.ev as unknown as SharedValue<number | undefined>}
        whiteBalance={filmStore.temperature as unknown as SharedValue<number | undefined>}
        tint={filmStore.tint as unknown as SharedValue<number | undefined>}
        isoAuto={bodyStore.isoAuto as unknown as SharedValue<boolean | undefined>}
        shutterSpeedAuto={bodyStore.shutterSpeedAuto as unknown as SharedValue<boolean | undefined>}
        whiteBalanceAuto={filmStore.temperatureAuto as unknown as SharedValue<boolean | undefined>}
        autoFocus={lensStore.focusAuto as unknown as SharedValue<boolean | undefined>}
        focusDistance={lensStore.focusDistance as unknown as SharedValue<number | undefined>}
        cameraId={lensStore.cameraAuto ? undefined : lensStore.cameraId}
        torchState={bodyStore.torchState as unknown as SharedValue<number | undefined>}
        torchStrength={resolvedTorchStrength as unknown as SharedValue<number | undefined>}
        noiseReduction={resolvedNoiseReduction as unknown as SharedValue<number | undefined>}
        sharpening={filmStore.sharpening as unknown as SharedValue<number | undefined>}
        cameraAspectRatio={bodyStore.aspectRatio as unknown as SharedValue<number | undefined>}
        resolutionSetting={bodyStore.resolutionSetting as unknown as SharedValue<number | undefined>}
        targetFps={bodyStore.fpsSetting as unknown as SharedValue<number | undefined>}
        onCapabilitiesUpdate={capabilitiesHandler}
        onDebugUpdate={debugHandler}
        onExposureUpdate={exposureHandler}
        onPhotoCaptured={photoHandler}
      />
      <FlashOverlay />
    </>
  );
};
