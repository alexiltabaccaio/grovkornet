import React, { Profiler, useCallback, useMemo } from 'react';
import { StyleSheet, View, Platform, StatusBar } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { useCameraPermissions } from '../lib/useCameraPermissions';
import { useCameraAppState } from '../lib/useCameraAppState';
import { useGalleryOverlay } from '../lib/useGalleryOverlay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import { useShallow } from 'zustand/shallow';
import { useSystemStore } from '@entities/system';
import { ControlPanel } from '@widgets/control-panel';
import { Viewfinder, DeviceHealthWarningBanner } from '@widgets/viewfinder';
import { Header } from '@widgets/header';
import { ShutterButton, CameraFlipButton } from '@features/body-controls';
import { GestureController } from '@features/lens-controls';
import { DebugOverlay, AddPresetModal, DeletePresetModal, QuickPresetSelector } from '@features/system-settings';
import { CaptureThumbnail, useGalleryPrefetch } from '@features/gallery';
import { GalleryViewer } from '@widgets/gallery-viewer';
import { logger } from '@shared/lib/logger';



export const CameraScreen = () => {
  const insets = useSafeAreaInsets();
  const { isFpsOverlayEnabled, triggerCapture, latestCapturedUri, latestPreviewUri } = useSystemStore(useShallow(state => ({
    isFpsOverlayEnabled: state.isFpsOverlayEnabled,
    triggerCapture: state.triggerCapture,
    latestCapturedUri: state.latestCapturedUri,
    latestPreviewUri: state.latestPreviewUri,
  })));

  // Start background verification and caching of recently captured photos
  useGalleryPrefetch();

  const { hasPermission } = useCameraPermissions();
  const { shouldRenderGallery, galleryTransition, openGallery, closeGallery } = useGalleryOverlay();
  const { cameraKey, drawerAnimation, footerTranslateY } = useCameraAppState({
    shouldRenderGallery,
    galleryTransition,
  });

  const animatedBottomControlsStyle = useAnimatedStyle(() => {
    // drawerAnimation goes from 250 (closed) to 0 (open)
    // footerTranslateY goes from 0 (open) to -250 (pulled up)
    // Total goes from 250 (closed) to 0 (open) to -250 (pulled up)
    // We want to fade out the controls as the drawer opens (total goes 250 -> 150)
    // galleryTransition.value * 100 reduces totalOffset to 150, which triggers the fade out
    const totalOffset = drawerAnimation.value + footerTranslateY.value - (galleryTransition.value * 100);
    const opacity = interpolate(
      totalOffset,
      [250, 150],
      [1, 0],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      totalOffset,
      [250, 150],
      [0, 30],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });
  const statusBarHeight = Platform.OS === 'android' 
    ? (StatusBar.currentHeight ?? 24) 
    : 47;

  const onRenderViewfinder = useCallback((id: string, phase: string, duration: number) => {
    if (__DEV__ && duration > 60) logger.warn('UI', `Viewfinder render took ${duration.toFixed(2)}ms`);
  }, []);

  const onRenderControlPanel = useCallback((id: string, phase: string, duration: number) => {
    if (__DEV__ && duration > 60) logger.warn('UI', `ControlPanel render took ${duration.toFixed(2)}ms`);
  }, []);

  const viewfinderContainerStyle = useMemo(() => ({
    flex: 1, 
    width: '100%' as const, 
    marginTop: statusBarHeight, 
    marginBottom: 80 + insets.bottom 
  }), [statusBarHeight, insets.bottom]);

  const bottomControlsStyle = useMemo(() => [
    styles.bottomControlsContainer,
    { bottom: 96 + insets.bottom }
  ], [insets.bottom]);

  const bannerContainerStyle = useMemo(() => ({
    position: 'absolute' as const, 
    top: statusBarHeight, 
    left: 0, 
    right: 0, 
    zIndex: 90 
  }), [statusBarHeight]);

  const headerElement = useMemo(() => <Header />, []);

  if (!hasPermission) {
    return (
      <View style={styles.center} />
    );
  }

  return (
    <View style={styles.container}>
      <GestureController footerTranslateY={footerTranslateY} drawerAnimation={drawerAnimation}>
        <View style={viewfinderContainerStyle}>
          {/* 60ms threshold is set to monitor realistic frame drops, avoiding dev mode / bundler overhead noise */}
          <Profiler id="Viewfinder" onRender={onRenderViewfinder}>
            <Viewfinder cameraKey={cameraKey} />
          </Profiler>
        </View>
      </GestureController>
      <Header />

      {isFpsOverlayEnabled && <DebugOverlay />}
      
      <Animated.View 
        style={[
          bottomControlsStyle,
          animatedBottomControlsStyle
        ]} 
        pointerEvents="box-none"
      >
        <View style={styles.controlsRow} pointerEvents="box-none">
          <View style={styles.sideControl} pointerEvents="box-none">
            <CaptureThumbnail onPress={openGallery} />
          </View>
          <ShutterButton onPress={triggerCapture} translateY={footerTranslateY} />
          <View style={styles.sideControl} pointerEvents="box-none">
            <CameraFlipButton />
          </View>
        </View>
        <View style={styles.presetSelectorContainer} pointerEvents="box-none">
          <QuickPresetSelector />
        </View>
      </Animated.View>

      {/* 60ms threshold filters out initial mount/unmount and dev overhead but flags real rendering bottlenecks */}
      <Profiler id="ControlPanel" onRender={onRenderControlPanel}>
        <ControlPanel translateY={footerTranslateY} drawerAnimation={drawerAnimation} galleryTransition={galleryTransition} />
      </Profiler>

      {shouldRenderGallery && (
        <GalleryViewer 
          onClose={closeGallery} 
          initialUri={latestPreviewUri ?? latestCapturedUri} 
          galleryTransition={galleryTransition} 
          header={headerElement}
        />
      )}
      
      <AddPresetModal />
      <DeletePresetModal />

      <View 
        style={bannerContainerStyle}
        pointerEvents="box-none"
      >
        <DeviceHealthWarningBanner />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 96,
    left: 0,
    right: 0,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  presetSelectorContainer: {
    marginTop: 16,
  },
  sideControl: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0e0e0e',
  },
});
