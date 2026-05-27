import React, { useEffect, useState, Profiler } from 'react';
import { StyleSheet, View, AppState, AppStateStatus, PermissionsAndroid, Platform, StatusBar } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, withTiming, runOnJS } from 'react-native-reanimated';


import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '@entities/system';
import { ControlPanel } from '@widgets/control-panel';
import { Viewfinder } from '@widgets/viewfinder';
import { Header } from '@widgets/header';
import { ShutterButton } from '@features/body-controls';
import { GestureController } from '@features/lens-controls';
import { DebugOverlay, AddPresetModal } from '@features/system-settings';
import { CaptureThumbnail } from '@features/gallery';
import { GalleryViewer } from '@widgets/gallery-viewer';
import { logger } from '@shared/lib/logger';


export const CameraScreen = () => {
  return (
    <CameraScreenContent />
  );
};

CameraScreen.whyDidYouRender = true;

const CameraScreenContent = () => {
  const { isDebugEnabled, triggerCapture, latestCapturedUri } = useSystemStore(useShallow(state => ({
    isDebugEnabled: state.isDebugEnabled,
    triggerCapture: state.triggerCapture,
    latestCapturedUri: state.latestCapturedUri,
  })));

  const footerTranslateY = useSharedValue(0);
  const drawerAnimation = useSharedValue(250);

  const [cameraKey, setCameraKey] = useState(0);
  const [shouldRenderGallery, setShouldRenderGallery] = useState(false);
  const galleryTransition = useSharedValue(0);

  const openGallery = () => {
    setShouldRenderGallery(true);
    galleryTransition.value = withTiming(1, { duration: 300 });
  };

  const closeGallery = () => {
    galleryTransition.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(setShouldRenderGallery)(false);
      }
    });
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const nextIsActive = nextAppState === 'active';
      if (nextIsActive) {
        setCameraKey(prev => prev + 1);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setHasPermission(true);
      }
    };
    requestPermission().catch(error => {
      logger.error('CameraScreen', 'Camera permission error', error);
    });
  }, []);

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
      'clamp'
    );
    const translateY = interpolate(
      totalOffset,
      [250, 150],
      [0, 30],
      'clamp'
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  if (!hasPermission) {
    return (
      <View style={styles.center} />
    );
  }

  const statusBarHeight = Platform.OS === 'android' 
    ? (StatusBar.currentHeight ?? 24) 
    : 47;

  return (
    <View style={styles.container}>
      <GestureController>
        <View style={{ flex: 1, width: '100%', marginTop: statusBarHeight, marginBottom: 80 }}>
          <Profiler id="Viewfinder" onRender={(id, phase, duration) => { if (__DEV__ && duration > 10) logger.warn('UI', `Viewfinder render took ${duration.toFixed(2)}ms`); }}>
            <Viewfinder cameraKey={cameraKey} />
          </Profiler>
        </View>
      </GestureController>

      <Header />

      {isDebugEnabled && <DebugOverlay />}
      
      <Animated.View style={[styles.bottomControlsContainer, animatedBottomControlsStyle]} pointerEvents="box-none">
        <View style={styles.sideControl} pointerEvents="box-none">
          <CaptureThumbnail onPress={openGallery} />
        </View>
        <ShutterButton onPress={triggerCapture} translateY={footerTranslateY} />
        <View style={styles.sideControl} pointerEvents="box-none" />
      </Animated.View>

      <Profiler id="ControlPanel" onRender={(id, phase, duration) => { if (__DEV__ && duration > 10) logger.warn('UI', `ControlPanel render took ${duration.toFixed(2)}ms`); }}>
        <ControlPanel translateY={footerTranslateY} drawerAnimation={drawerAnimation} galleryTransition={galleryTransition} />
      </Profiler>

      {shouldRenderGallery && <GalleryViewer onClose={closeGallery} initialUri={latestCapturedUri} galleryTransition={galleryTransition} />}
      
      <AddPresetModal />
    </View>
  );
};

CameraScreenContent.whyDidYouRender = true;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
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
