import React, { useMemo } from 'react';
import { StyleSheet, View, Platform, StatusBar, Modal } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { useCameraPermissions } from '../lib/useCameraPermissions';
import { useCameraAppState } from '../lib/useCameraAppState';
import { useCameraUIAnimations } from '../lib/useCameraUIAnimations';
import { useCameraDeepSleep } from '../lib/useCameraDeepSleep';
import { useGalleryOverlay } from '../lib/useGalleryOverlay';
import { useGalleryStreamSync } from '../lib/useGalleryStreamSync';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import { useShallow } from 'zustand/shallow';
import { useSystemStore } from '@entities/system';
import { useGalleryStore } from '@entities/gallery';
import { useCameraStore } from '@entities/camera';
import { InteractionContext } from '@shared/lib';

import { ControlPanel } from '@widgets/control-panel';
import { Viewfinder, DeviceHealthWarningBanner } from '@widgets/viewfinder';
import { Header } from '@widgets/header';
import { ShutterButton, CameraFlipButton } from '@features/body-controls';
import { GestureController } from '@features/lens-controls';
import { DebugOverlay, AddPresetModal, DeletePresetModal, QuickPresetSelector } from '@features/system-settings';
import { CaptureThumbnail, useGalleryPrefetch } from '@features/gallery';
import { GalleryViewer } from '@widgets/gallery-viewer';


export const CameraScreen = () => {
  const insets = useSafeAreaInsets();
  
  const { isFpsOverlayEnabled } = useSystemStore(useShallow(state => ({
    isFpsOverlayEnabled: state.isFpsOverlayEnabled,
  })));


  const { triggerCapture } = useCameraStore(useShallow(state => ({
    triggerCapture: state.triggerCapture,
  })));

  const { latestCapturedUri, latestPreviewUri, isOpen } = useGalleryStore(useShallow(state => ({
    latestCapturedUri: state.latestCapturedUri,
    latestPreviewUri: state.latestPreviewUri,
    isOpen: state.isOpen,
  })));

  // Start background verification and caching of recently captured photos
  useGalleryPrefetch();

  const { hasPermission } = useCameraPermissions();
  const { cameraKey } = useCameraAppState();
  const { drawerAnimation, footerTranslateY, viewfinderTranslateY } = useCameraUIAnimations();
  const { shouldRenderGallery, galleryTransition, openGallery, closeGallery } = useGalleryOverlay();

  useGalleryStreamSync(isOpen, galleryTransition, cameraKey);

  const { isCameraDeepSleep } = useCameraDeepSleep(isOpen);


  const animatedBottomControlsStyle = useAnimatedStyle(() => {
    // drawerAnimation goes from 0 (closed) to -250 (open)
    // footerTranslateY goes from 0 (open) to -250 (pulled up)
    // Total goes from 0 (closed) to -250 (open) to -500 (pulled up)
    // We want to fade out the controls as the drawer opens (totalOffset goes from 250 -> 150)
    // galleryTransition.value * 100 reduces totalOffset to 150, which triggers the fade out
    const totalOffset = drawerAnimation.value + 250 + footerTranslateY.value - (galleryTransition.value * 100);
    const opacity = interpolate(
      totalOffset,
      [150, 250],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      totalOffset,
      [150, 250],
      [30, 0],
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

  const viewfinderContainerStyle = useMemo(() => ({
    flex: 1, 
    width: '100%' as const, 
    marginTop: statusBarHeight, 
    // Subtracted 4 pixels to create an intentional overlap under the footer.
    // This hides the SurfaceView hole gap during Android layout recalculations on resume,
    // preventing the Android OS wallpaper from showing through as a "thin line".
    marginBottom: (80 + (insets.bottom ?? 0)) - 4 
  }), [statusBarHeight, insets.bottom]);

  const bottomControlsStyle = useMemo(() => [
    styles.bottomControlsContainer,
    { bottom: 96 + (insets.bottom ?? 0) }
  ], [insets.bottom]);

  const bannerContainerStyle = useMemo(() => ({
    position: 'absolute' as const, 
    top: statusBarHeight, 
    left: 0, 
    right: 0, 
    zIndex: 90,
    elevation: 90
  }), [statusBarHeight]);

  const headerElement = useMemo(() => <Header />, []);

  const interactionContextValue = useMemo(() => ({ isInteractable: !isOpen }), [isOpen]);
  
  const viewfinderElement = useMemo(() => (
    <View style={viewfinderContainerStyle}>
      {!isCameraDeepSleep && <Viewfinder cameraKey={cameraKey} />}
    </View>
  ), [viewfinderContainerStyle, isCameraDeepSleep, cameraKey]);

  if (!hasPermission) {
    return (
      <View style={styles.center} />
    );
  }

  return (
    <View style={styles.container}>
      <InteractionContext.Provider value={interactionContextValue}>
        <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]} pointerEvents="box-none">
          <React.Fragment key={`viewfinder-${cameraKey}`}>
            <GestureController 
              footerTranslateY={footerTranslateY} 
              drawerAnimation={drawerAnimation}
              viewfinderTranslateY={viewfinderTranslateY}
            >
              {viewfinderElement}
            </GestureController>
          </React.Fragment>
        </View>
        <Header />

        {isFpsOverlayEnabled && <DebugOverlay />}
        
        <View style={[StyleSheet.absoluteFill, { zIndex: 10 }]} pointerEvents="box-none">
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

            <ControlPanel translateY={footerTranslateY} drawerAnimation={drawerAnimation} galleryTransition={galleryTransition} />
        </View>

        <AddPresetModal />
        <DeletePresetModal />

        <View 
          style={bannerContainerStyle}
          pointerEvents="box-none"
        >
          <DeviceHealthWarningBanner />
        </View>
      </InteractionContext.Provider>

      {shouldRenderGallery && (
        <Modal
          visible={true}
          transparent={true}
          animationType="none"
          statusBarTranslucent={true}
          onRequestClose={closeGallery}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <GalleryViewer 
              onClose={closeGallery} 
              initialUri={latestPreviewUri ?? latestCapturedUri} 
              galleryTransition={galleryTransition} 
              header={headerElement}
            />
          </GestureHandlerRootView>
        </Modal>
      )}
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
    elevation: 50,
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
