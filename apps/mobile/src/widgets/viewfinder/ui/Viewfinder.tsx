import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore, useBodyWorklets } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { useFilmStore } from '@entities/film';
import { useSystemStore } from '@entities/system';
import { NativeRenderer } from '@entities/lens';
import Animated, { useDerivedValue, SharedValue, useSharedValue, withSpring } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useVerificationStore } from '@entities/verification';
import { FlashOverlay } from '@features/body-controls';
import { useCameraCapture } from '../lib/useCameraCapture';
import { useCameraEvents } from '../lib/useCameraEvents';

interface ViewfinderProps {
  cameraKey?: number;
  translateY?: SharedValue<number>;
  drawerAnimation?: SharedValue<number>;
}

export const Viewfinder = React.memo(({ cameraKey, translateY, drawerAnimation }: ViewfinderProps) => {
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
    zoom,
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
    vignetteIntensity,
    chromaShift,
    temperature,
    tint,
    bloomIntensity,
    chromaticAberration,
    chromaShiftDirection,
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
    grainRoughness,
    grainEnabled,
    bloomEnabled,
    noiseReductionMode,
    noiseReductionAuto,
    temperatureAuto,
    isSelfieCamera,
    blackLevel,
    highlights,
    pivot,
    contrastAuto,
    blackLevelAuto,
    highlightsAuto,
    pivotAuto,
    pixelationFactor,
    tapeJitter,
    scanlines,
    chromaShiftInvert,
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
      // Mark as verified instantly!
      useVerificationStore.getState().setVerified(uri, true);
    }
  }, [setLatestPreviewUri, setLatestCapturedUri]);

  const layoutHeight = useSharedValue(1);
  const layoutWidth = useSharedValue(1);

  const panelY = useDerivedValue(() => {
    if (!translateY || !drawerAnimation) return 1.0;
    const t = translateY.value + drawerAnimation.value;
    const heightOfGlass = 144.0 - t;
    
    const viewWidth = layoutWidth.value || 1.0;
    const viewHeight = layoutHeight.value || 1.0;
    
    // Default screen Y coordinate for the top of the glass panel
    const screenY = viewHeight - heightOfGlass;

    // View aspect ratio
    const viewAspect = viewWidth / viewHeight;
    
    // Calculate target aspect from aspectRatio setting
    const setting = aspectRatio.value;
    let targetAspect = 4.0 / 3.0; // default to 4:3
    if (setting === 0) targetAspect = 4.0 / 3.0;
    else if (setting === 1) targetAspect = 16.0 / 9.0;
    else if (setting === 2) targetAspect = 1.0;
    else if (setting === 3) targetAspect = 3.0 / 2.0;
    else if (setting === 4) targetAspect = 65.0 / 24.0;
    
    const isPortrait = viewWidth < viewHeight;
    const finalTargetAspect = isPortrait ? (1.0 / targetAspect) : targetAspect;
    
    let scaleY = 1.0;
    if (viewAspect <= finalTargetAspect) {
        // Viewport is taller than target -> Letterbox on top/bottom
        scaleY = viewAspect / finalTargetAspect;
    }
    
    const vpHeight = viewHeight * scaleY;
    const vpY = (viewHeight - vpHeight) / 2.0;
    
    // Calculate the UV coordinate in the viewport
    const uvY = (screenY - vpY) / vpHeight;
    
    return uvY;
  });

  const handleLayout = React.useCallback((event: import('react-native').LayoutChangeEvent) => {
    layoutHeight.value = event.nativeEvent.layout.height;
    layoutWidth.value = event.nativeEvent.layout.width;
  }, [layoutHeight, layoutWidth]);

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

  const startZoom = useSharedValue(1.0);
  const bodyWorklets = useBodyWorklets();

  const gestures = React.useMemo(() => {
    const pinch = Gesture.Pinch()
      .onStart(() => {
        startZoom.value = zoom.value;
      })
      .onChange((event) => {
        bodyWorklets.updateZoom(startZoom.value * event.scale);
      });

    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        zoom.value = withSpring(1.0, { damping: 20, stiffness: 150 });
      });

    return Gesture.Simultaneous(pinch, doubleTap);
  }, [zoom, bodyWorklets, startZoom]);

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <GestureDetector gesture={gestures}>
        <Animated.View style={StyleSheet.absoluteFill}>
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
        vignetteIntensity={vignetteIntensity as unknown as SharedValue<number | undefined>}
        chromaShift={chromaShift as unknown as SharedValue<number | undefined>}
        ev={ev as unknown as SharedValue<number | undefined>}
        whiteBalance={temperature as unknown as SharedValue<number | undefined>}
        tint={tint as unknown as SharedValue<number | undefined>}
        bloomIntensity={bloomIntensity as unknown as SharedValue<number | undefined>}
        chromaticAberration={chromaticAberration as unknown as SharedValue<number | undefined>}
        chromaShiftDirection={chromaShiftDirection as unknown as SharedValue<number | undefined>}
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
        grainRoughness={grainRoughness as unknown as SharedValue<number | undefined>}
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
        isSelfieCamera={isSelfieCamera as unknown as SharedValue<boolean | undefined>}
        blackLevel={blackLevel as unknown as SharedValue<number | undefined>}
        highlights={highlights as unknown as SharedValue<number | undefined>}
        pivot={pivot as unknown as SharedValue<number | undefined>}
        contrastAuto={contrastAuto as unknown as SharedValue<boolean | undefined>}
        blackLevelAuto={blackLevelAuto as unknown as SharedValue<boolean | undefined>}
        highlightsAuto={highlightsAuto as unknown as SharedValue<boolean | undefined>}
        pivotAuto={pivotAuto as unknown as SharedValue<boolean | undefined>}
        zoom={zoom as unknown as SharedValue<number | undefined>}
        pixelationFactor={pixelationFactor as unknown as SharedValue<number | undefined>}
        tapeJitter={tapeJitter as unknown as SharedValue<number | undefined>}
        scanlines={scanlines as unknown as SharedValue<number | undefined>}
        chromaShiftInvert={chromaShiftInvert as unknown as SharedValue<boolean | undefined>}
        // @@GEN_PROPS_END@@
            panelY={panelY as unknown as SharedValue<number | undefined>}
            onCapabilitiesUpdate={capabilitiesHandler}
            onDebugUpdate={debugHandler}
            onExposureUpdate={exposureHandler}
            onPhotoCaptured={photoHandler}
            onTorchStateChanged={torchStateHandler}
          />
        </Animated.View>
      </GestureDetector>
      <FlashOverlay />
    </View>
  );
});

Viewfinder.displayName = 'Viewfinder';
// (Viewfinder as React.NamedExoticComponent<ViewfinderProps> & { whyDidYouRender?: boolean }).whyDidYouRender = true;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});

