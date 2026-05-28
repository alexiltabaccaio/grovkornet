import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { useFilmStore } from '@entities/film';
import { useSystemStore } from '@entities/system';
import { NativeRenderer } from '@entities/lens';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { FlashOverlay } from '@features/body-controls';
import { QuickPresetSelector } from '@features/system-settings';
import { useCameraCapture } from '../lib/useCameraCapture';
import { useCameraEvents } from '../lib/useCameraEvents';

interface ViewfinderProps {
  cameraKey?: number;
}

export const Viewfinder = React.memo(({ cameraKey }: ViewfinderProps) => {
  // 1. Stable reference SharedValues (statically extracted to avoid React subscription)
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
    force4k60fpsCrop,
  } = useBodyStore.getState();

  const {
    focusAuto,
    focusDistance,
  } = useLensStore.getState();

  const {
    // @@GEN_SELECTOR_START@@
    saturation,
    contrast,
    grainIntensity,
    grainChroma,
    grainSize,
    grainSpeed,
    temperature,
    tint,
    bloomIntensity,
    chromaticAberration,
    aberrationDirection,
    sharpening,
    satRed,
    satOrange,
    satYellow,
    satGreen,
    satCyan,
    satBlue,
    satPurple,
    satMagenta,
    aberrationInvert,
    boundMagentaRed,
    boundRedOrange,
    boundOrangeYellow,
    boundYellowGreen,
    boundGreenCyan,
    boundCyanBlue,
    boundBluePurple,
    boundPurpleMagenta,
    grainEnabled,
    bloomEnabled,
    noiseReductionMode,
    noiseReductionAuto,
    temperatureAuto,
    // @@GEN_SELECTOR_END@@
  } = useFilmStore.getState();

  // 2. Stable actions
  const setLatestPreviewUri = useSystemStore.getState().setLatestPreviewUri;
  const setLatestCapturedUri = useSystemStore.getState().setLatestCapturedUri;

  // 3. Reactive primitives (subscribed to cause re-renders only when necessary)
  const isCameraSecure = useSystemStore(state => state.isCameraSecure);
  const capabilities = useBodyStore(state => state.capabilities);
  const { cameraAuto, cameraId } = useLensStore(useShallow(state => ({
    cameraAuto: state.cameraAuto,
    cameraId: state.cameraId,
  })));

  const cameraRef = useCameraCapture();
  const { exposureHandler, debugHandler, capabilitiesHandler, torchStateHandler } = useCameraEvents();

  const photoHandler = React.useCallback((event: { nativeEvent: { uri: string } }) => {
    const uri = event.nativeEvent.uri;
    // The temporary preview URI lives in the app's cache (file:///data/...)
    // The final URI (MediaStore) starts with content:// or file:///storage/
    if (uri.startsWith('file:///data/')) {
      setLatestPreviewUri(uri);
    } else {
      setLatestCapturedUri(uri);
    }
  }, [setLatestPreviewUri, setLatestCapturedUri]);

  const resolvedNoiseReduction = useDerivedValue(() => {
    return noiseReductionAuto.value ? -1 : noiseReductionMode.value;
  });

  const resolvedTorchStrength = useDerivedValue(() => {
    return Math.max(1, Math.round(torchStrength.value * (capabilities.maxTorchStrength ?? 1)));
  }, [capabilities.maxTorchStrength]);

  const resolvedPreviewIn4k = useDerivedValue(() => {
    return previewIn4k.value === 1;
  });

  const resolvedForce4k60fpsCrop = useDerivedValue(() => {
    return force4k60fpsCrop.value === 1;
  });

  return (
    <>
      <NativeRenderer
        ref={cameraRef}
        key={`camera-${cameraKey}-${isCameraSecure}`}
        style={StyleSheet.absoluteFill}
        // @@GEN_PROPS_START@@
        saturation={saturation as unknown as SharedValue<number | undefined>}
        contrast={contrast as unknown as SharedValue<number | undefined>}
        grainIntensity={grainIntensity as unknown as SharedValue<number | undefined>}
        grainChroma={grainChroma as unknown as SharedValue<number | undefined>}
        grainSize={grainSize as unknown as SharedValue<number | undefined>}
        grainSpeed={grainSpeed as unknown as SharedValue<number | undefined>}
        ev={ev as unknown as SharedValue<number | undefined>}
        whiteBalance={temperature as unknown as SharedValue<number | undefined>}
        tint={tint as unknown as SharedValue<number | undefined>}
        bloomIntensity={bloomIntensity as unknown as SharedValue<number | undefined>}
        chromaticAberration={chromaticAberration as unknown as SharedValue<number | undefined>}
        aberrationDirection={aberrationDirection as unknown as SharedValue<number | undefined>}
        sharpening={sharpening as unknown as SharedValue<number | undefined>}
        satRed={satRed as unknown as SharedValue<number | undefined>}
        satOrange={satOrange as unknown as SharedValue<number | undefined>}
        satYellow={satYellow as unknown as SharedValue<number | undefined>}
        satGreen={satGreen as unknown as SharedValue<number | undefined>}
        satCyan={satCyan as unknown as SharedValue<number | undefined>}
        satBlue={satBlue as unknown as SharedValue<number | undefined>}
        satPurple={satPurple as unknown as SharedValue<number | undefined>}
        satMagenta={satMagenta as unknown as SharedValue<number | undefined>}
        targetFps={fpsSetting as unknown as SharedValue<number | undefined>}
        cameraAspectRatio={aspectRatio as unknown as SharedValue<number | undefined>}
        aberrationInvert={aberrationInvert as unknown as SharedValue<boolean | undefined>}
        boundMagentaRed={boundMagentaRed as unknown as SharedValue<number | undefined>}
        boundRedOrange={boundRedOrange as unknown as SharedValue<number | undefined>}
        boundOrangeYellow={boundOrangeYellow as unknown as SharedValue<number | undefined>}
        boundYellowGreen={boundYellowGreen as unknown as SharedValue<number | undefined>}
        boundGreenCyan={boundGreenCyan as unknown as SharedValue<number | undefined>}
        boundCyanBlue={boundCyanBlue as unknown as SharedValue<number | undefined>}
        boundBluePurple={boundBluePurple as unknown as SharedValue<number | undefined>}
        boundPurpleMagenta={boundPurpleMagenta as unknown as SharedValue<number | undefined>}
        grainEnabled={grainEnabled as unknown as SharedValue<boolean | undefined>}
        bloomEnabled={bloomEnabled as unknown as SharedValue<boolean | undefined>}
        noiseReduction={resolvedNoiseReduction as unknown as SharedValue<number | undefined>}
        noiseReductionAuto={noiseReductionAuto as unknown as SharedValue<boolean | undefined>}
        isoAuto={isoAuto as unknown as SharedValue<boolean | undefined>}
        shutterSpeedAuto={shutterSpeedAuto as unknown as SharedValue<boolean | undefined>}
        whiteBalanceAuto={temperatureAuto as unknown as SharedValue<boolean | undefined>}
        autoFocus={focusAuto as unknown as SharedValue<boolean | undefined>}
        iso={iso as unknown as SharedValue<number | undefined>}
        exposureTime={shutterSpeed as unknown as SharedValue<number | undefined>}
        focusDistance={focusDistance as unknown as SharedValue<number | undefined>}
        torchState={torchState as unknown as SharedValue<number | undefined>}
        torchStrength={resolvedTorchStrength as unknown as SharedValue<number | undefined>}
        cameraId={cameraAuto ? undefined : cameraId}
        resolutionSetting={resolutionSetting as unknown as SharedValue<number | undefined>}
        previewIn4k={resolvedPreviewIn4k as unknown as SharedValue<boolean | undefined>}
        force4k60fpsCrop={resolvedForce4k60fpsCrop as unknown as SharedValue<boolean | undefined>}
        secureViewEnabled={isCameraSecure}
        // @@GEN_PROPS_END@@
        onCapabilitiesUpdate={capabilitiesHandler}
        onDebugUpdate={debugHandler}
        onExposureUpdate={exposureHandler}
        onPhotoCaptured={photoHandler}
        onTorchStateChanged={torchStateHandler}
      />
      <FlashOverlay />
      <View style={styles.selectorContainer}>
        <QuickPresetSelector />
      </View>
    </>
  );
});

Viewfinder.displayName = 'Viewfinder';
(Viewfinder as React.NamedExoticComponent<ViewfinderProps> & { whyDidYouRender?: boolean }).whyDidYouRender = true;


const styles = StyleSheet.create({
  selectorContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
});

