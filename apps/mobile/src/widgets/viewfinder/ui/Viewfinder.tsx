import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore, useBodyWorklets } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { useFilmStore } from '@entities/film';
import { useSystemStore } from '@entities/system';
import { NativeRenderer } from '@entities/lens';
import Animated, { useDerivedValue, SharedValue, useSharedValue, withSpring, withTiming, Easing, useAnimatedProps } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useVerificationStore } from '@entities/verification';
import { FlashOverlay } from '@features/body-controls';
import { useCameraCapture } from '../lib/useCameraCapture';
import { useCameraEvents } from '../lib/useCameraEvents';
import { DeviceHealthWarningBanner } from './DeviceHealthWarningBanner';

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
    noiseReductionMode,
    noiseReductionAuto,
    temperatureAuto,
    isSelfieCamera,
    // @@GEN_SELECTOR_END@@
  } = useFilmStore.getState();

  // 2. Stable actions
  const setLatestPreviewUri = useSystemStore.getState().setLatestPreviewUri;
  const setLatestCapturedUri = useSystemStore.getState().setLatestCapturedUri;

  // 3. Reactive primitives (subscribed to cause re-renders only when necessary)
  const isCameraSecure = useSystemStore(state => state.isCameraSecure);
  const thermalState = useSystemStore(state => state.thermalState);
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
      .maxDelay(200)
      .maxDuration(250)
      .maxDistance(20)
      .onEnd(() => {
        zoom.value = withTiming(1.0, { duration: 250, easing: Easing.out(Easing.quad) });
      });

    return Gesture.Simultaneous(pinch, doubleTap);
  }, [zoom, bodyWorklets, startZoom]);

  React.useEffect(() => {
    // When the NativeRenderer remounts (e.g. returning from background), the native view gets default parameters.
    // We push the current JS film state to the new Nitro module instance.
    const t = setTimeout(() => {
      import('@features/system-settings')
        .then(({ syncRuntimeToNative }) => syncRuntimeToNative())
        .catch(err => console.warn('Failed to sync native runtime', err));
    }, 150);
    return () => clearTimeout(t);
  }, [cameraKey, isCameraSecure]);

  const animatedProps = useAnimatedProps(() => {
    let effectiveFps = fpsSetting.value;
    if (thermalState === 'warning') {
      effectiveFps = Math.min(effectiveFps, 30);
    } else if (thermalState === 'critical') {
      effectiveFps = Math.min(effectiveFps, 15);
    }

    return {
      // @@GEN_ANIMATED_PROPS_START@@
      ev: ev.value,
      targetFps: fpsSetting.value,
      cameraAspectRatio: aspectRatio.value,
      noiseReduction: resolvedNoiseReduction.value,
      noiseReductionAuto: noiseReductionAuto.value,
      isoAuto: isoAuto.value,
      shutterSpeedAuto: shutterSpeedAuto.value,
      whiteBalanceAuto: temperatureAuto.value,
      autoFocus: focusAuto.value,
      iso: iso.value,
      exposureTime: shutterSpeed.value,
      focusDistance: focusDistance.value,
      torchState: torchState.value,
      torchStrength: resolvedTorchStrength.value,
      resolutionSetting: resolutionSetting.value,
      previewIn4k: resolvedPreviewIn4k.value,
      force4k60fpsCrop: resolvedForce4k60fpsCrop.value,
      isSelfieCamera: isSelfieCamera.value,
      zoom: zoom.value,
      // @@GEN_ANIMATED_PROPS_END@@
    };
  }, [thermalState]);

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <GestureDetector gesture={gestures}>
        <Animated.View style={StyleSheet.absoluteFill}>
          <NativeRenderer
            ref={cameraRef}
            key={`camera-${cameraKey}-${isCameraSecure}`}
            style={StyleSheet.absoluteFill}
            // @@GEN_PROPS_START@@
        animatedProps={animatedProps}
        cameraId={cameraAuto ? undefined : cameraId}
        secureViewEnabled={isCameraSecure}
        // @@GEN_PROPS_END@@
            onCapabilitiesUpdate={capabilitiesHandler}
            onDebugUpdate={debugHandler}
            onExposureUpdate={exposureHandler}
            onPhotoCaptured={photoHandler}
            onTorchStateChanged={torchStateHandler}
          />
        </Animated.View>
      </GestureDetector>
      <FlashOverlay />
      <DeviceHealthWarningBanner />
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

