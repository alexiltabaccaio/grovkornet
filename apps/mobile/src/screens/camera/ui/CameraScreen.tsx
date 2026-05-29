import React, { useEffect, useState, Profiler } from 'react';
import { StyleSheet, View, AppState, AppStateStatus, PermissionsAndroid, Platform, StatusBar, InteractionManager } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, withTiming, runOnJS } from 'react-native-reanimated';


import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '@entities/system';
import { ControlPanel } from '@widgets/control-panel';
import { Viewfinder } from '@widgets/viewfinder';
import { Header } from '@widgets/header';
import { ShutterButton } from '@features/body-controls';
import { GestureController } from '@features/lens-controls';
import { DebugOverlay, AddPresetModal } from '@features/system-settings';
import { CaptureThumbnail, useImageVerification } from '@features/gallery';
import { GalleryViewer } from '@widgets/gallery-viewer';
import { logger } from '@shared/lib/logger';
import * as MediaLibrary from 'expo-media-library';


export const CameraScreen = () => {
  return (
    <CameraScreenContent />
  );
};

// CameraScreen.whyDidYouRender = true;

const CameraScreenContent = () => {
  const { isDebugEnabled, triggerCapture, latestCapturedUri, latestPreviewUri } = useSystemStore(useShallow(state => ({
    isDebugEnabled: state.isDebugEnabled,
    triggerCapture: state.triggerCapture,
    latestCapturedUri: state.latestCapturedUri,
    latestPreviewUri: state.latestPreviewUri,
  })));

  const footerTranslateY = useSharedValue(0);
  const drawerAnimation = useSharedValue(250);

  const [cameraKey, setCameraKey] = useState(0);
  const [shouldRenderGallery, setShouldRenderGallery] = useState(false);
  const galleryTransition = useSharedValue(0);

  const { verifyPhotosBatch } = useImageVerification();

  useEffect(() => {
    let active = true;
    let timer: NodeJS.Timeout;

    InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(async () => {
        try {
          const currentPerm = await MediaLibrary.getPermissionsAsync();
          if (!active || !currentPerm.granted) return;

          logger.debug('CameraScreen', 'Startup pre-fetch: permissions granted. Fetching recent photos...');

          const allAlbums = await MediaLibrary.getAlbumsAsync();
          if (!active) return;

          const grovkornetAlbums = allAlbums.filter(
            (a) => a.title.toLowerCase() === 'grovkornet'
          );

          let assets: MediaLibrary.Asset[] = [];
          if (grovkornetAlbums.length > 0) {
            const fetchPromises = grovkornetAlbums.map((album) =>
              MediaLibrary.getAssetsAsync({
                album: album.id,
                first: 15,
                sortBy: [[MediaLibrary.SortBy.creationTime, false]],
                mediaType: MediaLibrary.MediaType.photo,
              })
            );
            const results = await Promise.all(fetchPromises);
            assets = results.flatMap((r) => r.assets).slice(0, 15);
          } else {
            const recent = await MediaLibrary.getAssetsAsync({
              first: 100,
              sortBy: [[MediaLibrary.SortBy.creationTime, false]],
              mediaType: MediaLibrary.MediaType.photo,
            });
            assets = recent.assets
              .filter(
                (a) =>
                  a.uri.includes('Grovkornet') ||
                  a.filename.includes('Grovkornet') ||
                  a.filename.startsWith('Grovkornet_') ||
                  a.filename.startsWith('GVK_')
              )
              .slice(0, 15);
          }

          if (!active || assets.length === 0) return;

          const uris = assets.map((a) => a.uri).filter(Boolean);
          logger.debug('CameraScreen', `Startup pre-fetch: starting validation for ${uris.length} photos`);
          void verifyPhotosBatch(uris);
        } catch (error) {
          logger.error('CameraScreen', 'Startup pre-fetch verification failed', error);
        }
      }, 3000);
    });

    return () => {
      active = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [verifyPhotosBatch]);

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
          {/* 60ms threshold is set to monitor realistic frame drops, avoiding dev mode / bundler overhead noise */}
          <Profiler id="Viewfinder" onRender={(id, phase, duration) => { if (__DEV__ && duration > 60) logger.warn('UI', `Viewfinder render took ${duration.toFixed(2)}ms`); }}>
            <Viewfinder cameraKey={cameraKey} translateY={footerTranslateY} drawerAnimation={drawerAnimation} />
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

      {/* 60ms threshold filters out initial mount/unmount and dev overhead but flags real rendering bottlenecks */}
      <Profiler id="ControlPanel" onRender={(id, phase, duration) => { if (__DEV__ && duration > 60) logger.warn('UI', `ControlPanel render took ${duration.toFixed(2)}ms`); }}>
        <ControlPanel translateY={footerTranslateY} drawerAnimation={drawerAnimation} galleryTransition={galleryTransition} />
      </Profiler>

      {shouldRenderGallery && (
        <GalleryViewer 
          onClose={closeGallery} 
          initialUri={latestPreviewUri ?? latestCapturedUri} 
          galleryTransition={galleryTransition} 
          header={<Header />}
        />
      )}
      
      <AddPresetModal />
    </View>
  );
};

// CameraScreenContent.whyDidYouRender = true;

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
