import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore, useBodyWorklets } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { useFilmStore } from '@entities/film';
import { useSystemStore } from '@entities/system';
import { NativeRenderer } from '@entities/lens';
import Animated, { useDerivedValue, SharedValue, useSharedValue, withSpring, useAnimatedProps } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useVerificationStore } from '@entities/verification';
import { FlashOverlay } from '@features/body-controls';
import { useCameraCapture } from '../lib/useCameraCapture';
import { useCameraEvents } from '../lib/useCameraEvents';
import { DeviceHealthWarningBanner } from './DeviceHealthWarningBanner';

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
    previewQuality,
    force60fpsCrop,
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

  const resolvedNoiseReduction = useDerivedValue(() => {
    return noiseReductionAuto.value ? -1 : noiseReductionMode.value;
  });

  const resolvedTorchStrength = useDerivedValue(() => {
    return Math.max(1, Math.round(torchStrength.value * (capabilities.maxTorchStrength ?? 1)));
  }, [capabilities.maxTorchStrength]);



  const resolvedForce60fpsCrop = useDerivedValue(() => {
    return force60fpsCrop.value === 1;
  });

  const startZoom = useSharedValue(1.0);
  const bodyWorklets = useBodyWorklets();

  const gestures = React.useMemo(() => {
    return Gesture.Pinch()
      .onStart(() => {
        startZoom.value = zoom.value;
      })
      .onChange((event) => {
        bodyWorklets.updateZoom(startZoom.value * event.scale);
      });
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

  const effectiveFps = useDerivedValue(() => {
    let fps = fpsSetting.value;
    
    // If we are at high resolution (4K or 1440p) and the 60 FPS crop is disabled,
    // limit the target FPS to 30 (hardware limit) to allow the full uncropped frame.
    const isHighRes = resolutionSetting.value <= 1;
    const isCropDisabled = force60fpsCrop.value === 0;
    if (isHighRes && isCropDisabled) {
      fps = Math.min(fps, 30);
    }

    if (thermalState === 'warning') {
      fps = Math.min(fps, 30);
    } else if (thermalState === 'critical') {
      fps = Math.min(fps, 15);
    }
    return fps;
  }, [thermalState]);

  const animatedProps = useAnimatedProps(() => {
    return {
      // @@GEN_ANIMATED_PROPS_START@@
      ev: ev.value,
      targetFps: effectiveFps.value,
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
      previewQuality: previewQuality.value,
      force60fpsCrop: resolvedForce60fpsCrop.value,
      isSelfieCamera: isSelfieCamera.value,
      zoom: zoom.value,
      // @@GEN_ANIMATED_PROPS_END@@
    };
  }, [thermalState]);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gestures}>
        <Animated.View style={StyleSheet.absoluteFill}>
          <NativeRenderer
            ref={cameraRef}
            key={`camera-${cameraKey}-${isCameraSecure}`}
            style={StyleSheet.absoluteFill}
            // @@GEN_PROPS_START@@
        animatedProps={animatedProps}
        cameraId={cameraAuto ? null : cameraId}
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

