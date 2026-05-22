import React from 'react';
import { StyleSheet } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { useFilmStore } from '@entities/film';
import { useSystemStore } from '@entities/system';
import { NativeRenderer } from '@entities/lens';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { FlashOverlay } from '@features/body-controls';
import { useCameraCapture } from '../lib/useCameraCapture';
import { useCameraEvents } from '../lib/useCameraEvents';

interface ViewfinderProps {
  cameraKey?: number;
}

export const Viewfinder = ({ cameraKey }: ViewfinderProps) => {
  const {
    iso,
    shutterSpeed,
    ev,
    isoAuto,
    shutterSpeedAuto,
    torchState,
    torchStrength,
    aspectRatio,
    resolutionSetting,
    fpsSetting,
    previewIn4k,
    capabilities,
  } = useBodyStore(useShallow(state => ({
    iso: state.iso,
    shutterSpeed: state.shutterSpeed,
    ev: state.ev,
    isoAuto: state.isoAuto,
    shutterSpeedAuto: state.shutterSpeedAuto,
    torchState: state.torchState,
    torchStrength: state.torchStrength,
    aspectRatio: state.aspectRatio,
    resolutionSetting: state.resolutionSetting,
    fpsSetting: state.fpsSetting,
    previewIn4k: state.previewIn4k,
    capabilities: state.capabilities,
  })));

  const {
    focusAuto,
    focusDistance,
    cameraAuto,
    cameraId,
  } = useLensStore(useShallow(state => ({
    focusAuto: state.focusAuto,
    focusDistance: state.focusDistance,
    cameraAuto: state.cameraAuto,
    cameraId: state.cameraId,
  })));

  const {
    noiseReductionAuto,
    noiseReductionMode,
    saturation,
    contrast,
    chromaticAberration,
    aberrationDirection,
    grainIntensity,
    grainChroma,
    grainSize,
    grainSpeed,
    grainEnabled,
    bloomEnabled,
    bloomIntensity,
    temperature,
    tint,
    temperatureAuto,
    sharpening,
  } = useFilmStore(useShallow(state => ({
    noiseReductionAuto: state.noiseReductionAuto,
    noiseReductionMode: state.noiseReductionMode,
    saturation: state.saturation,
    contrast: state.contrast,
    chromaticAberration: state.chromaticAberration,
    aberrationDirection: state.aberrationDirection,
    grainIntensity: state.grainIntensity,
    grainChroma: state.grainChroma,
    grainSize: state.grainSize,
    grainSpeed: state.grainSpeed,
    grainEnabled: state.grainEnabled,
    bloomEnabled: state.bloomEnabled,
    bloomIntensity: state.bloomIntensity,
    temperature: state.temperature,
    tint: state.tint,
    temperatureAuto: state.temperatureAuto,
    sharpening: state.sharpening,
  })));

  const setLatestCapturedUri = useSystemStore(state => state.setLatestCapturedUri);
  const cameraRef = useCameraCapture();
  const { exposureHandler, debugHandler, capabilitiesHandler, torchStateHandler } = useCameraEvents();

  const photoHandler = React.useCallback((event: { nativeEvent: { uri: string } }) => {
    setLatestCapturedUri(event.nativeEvent.uri);
  }, [setLatestCapturedUri]);

  const resolvedNoiseReduction = useDerivedValue(() => {
    return noiseReductionAuto.value ? -1 : noiseReductionMode.value;
  });

  const resolvedTorchStrength = useDerivedValue(() => {
    return Math.max(1, Math.round(torchStrength.value * (capabilities.maxTorchStrength ?? 1)));
  });

  const resolvedPreviewIn4k = useDerivedValue(() => {
    return previewIn4k.value === 1;
  });

  return (
    <>
      <NativeRenderer
        ref={cameraRef}
        key={`camera-${cameraKey}`}
        style={StyleSheet.absoluteFill}
        saturation={saturation as unknown as SharedValue<number | undefined>}
        contrast={contrast as unknown as SharedValue<number | undefined>}
        chromaticAberration={chromaticAberration as unknown as SharedValue<number | undefined>}
        aberrationDirection={aberrationDirection as unknown as SharedValue<number | undefined>}
        grainIntensity={grainIntensity as unknown as SharedValue<number | undefined>}
        grainChroma={grainChroma as unknown as SharedValue<number | undefined>}
        grainSize={grainSize as unknown as SharedValue<number | undefined>}
        grainSpeed={grainSpeed as unknown as SharedValue<number | undefined>}
        grainEnabled={grainEnabled as unknown as SharedValue<boolean | undefined>}
        bloomEnabled={bloomEnabled as unknown as SharedValue<boolean | undefined>}
        bloomIntensity={bloomIntensity as unknown as SharedValue<number | undefined>}
        iso={iso as unknown as SharedValue<number | undefined>}
        exposureTime={shutterSpeed as unknown as SharedValue<number | undefined>}
        ev={ev as unknown as SharedValue<number | undefined>}
        whiteBalance={temperature as unknown as SharedValue<number | undefined>}
        tint={tint as unknown as SharedValue<number | undefined>}
        isoAuto={isoAuto as unknown as SharedValue<boolean | undefined>}
        shutterSpeedAuto={shutterSpeedAuto as unknown as SharedValue<boolean | undefined>}
        whiteBalanceAuto={temperatureAuto as unknown as SharedValue<boolean | undefined>}
        autoFocus={focusAuto as unknown as SharedValue<boolean | undefined>}
        focusDistance={focusDistance as unknown as SharedValue<number | undefined>}
        cameraId={cameraAuto ? undefined : cameraId}
        torchState={torchState as unknown as SharedValue<number | undefined>}
        torchStrength={resolvedTorchStrength as unknown as SharedValue<number | undefined>}
        noiseReduction={resolvedNoiseReduction as unknown as SharedValue<number | undefined>}
        sharpening={sharpening as unknown as SharedValue<number | undefined>}
        cameraAspectRatio={aspectRatio as unknown as SharedValue<number | undefined>}
        resolutionSetting={resolutionSetting as unknown as SharedValue<number | undefined>}
        previewIn4k={resolvedPreviewIn4k as unknown as SharedValue<boolean | undefined>}
        targetFps={fpsSetting as unknown as SharedValue<number | undefined>}
        onCapabilitiesUpdate={capabilitiesHandler}
        onDebugUpdate={debugHandler}
        onExposureUpdate={exposureHandler}
        onPhotoCaptured={photoHandler}
        onTorchStateChanged={torchStateHandler}
      />
      <FlashOverlay />
    </>
  );
};
