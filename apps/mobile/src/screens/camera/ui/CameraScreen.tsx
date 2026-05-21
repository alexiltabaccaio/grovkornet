import React, { useEffect, useState } from 'react';
import { StyleSheet, View, AppState, AppStateStatus, PermissionsAndroid, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, interpolate } from 'react-native-reanimated';

import { useTranslation } from 'react-i18next';

import { useShallow } from 'zustand/react/shallow';
import { useUIStore, GestureController, Footer, DebugOverlay, ConnectedFilmCamera, ShutterButton, CaptureThumbnail, StatusBarHeader } from '@features/camera-controls';
import { VerifiedGallery } from '@features/gallery';
import { logger } from '@shared/lib/logger';


export const CameraScreen = () => {
  return (
    <CameraScreenContent />
  );
};

const CameraScreenContent = () => {
  const { t } = useTranslation();
  const { isDebugEnabled, triggerCapture, latestCapturedUri } = useUIStore(useShallow(state => ({
    isDebugEnabled: state.isDebugEnabled,
    triggerCapture: state.triggerCapture,
    latestCapturedUri: state.latestCapturedUri,
  })));

  const footerTranslateY = useSharedValue(0);
  const drawerAnimation = useSharedValue(250);

  const [cameraKey, setCameraKey] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

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
    const totalOffset = drawerAnimation.value + footerTranslateY.value;
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

  return (
    <View style={styles.container}>
      <GestureController>
        <ConnectedFilmCamera cameraKey={cameraKey} />
      </GestureController>

      <StatusBarHeader />

      {isDebugEnabled && <DebugOverlay />}
      
      <Animated.View style={[styles.bottomControlsContainer, animatedBottomControlsStyle]} pointerEvents="box-none">
        <View style={styles.sideControl} pointerEvents="box-none">
          <CaptureThumbnail onPress={() => setIsGalleryOpen(true)} />
        </View>
        <ShutterButton onPress={triggerCapture} translateY={footerTranslateY} />
        <View style={styles.sideControl} pointerEvents="box-none" />
      </Animated.View>

      <Footer translateY={footerTranslateY} drawerAnimation={drawerAnimation} />

      {isGalleryOpen && <VerifiedGallery onClose={() => setIsGalleryOpen(false)} initialUri={latestCapturedUri} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
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
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});
