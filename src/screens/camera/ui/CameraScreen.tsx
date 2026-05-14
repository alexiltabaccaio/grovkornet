import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, AppState, AppStateStatus, PermissionsAndroid, Platform } from 'react-native';

import { useTranslation } from 'react-i18next';

import { useShallow } from 'zustand/react/shallow';
import { useCameraEffectsStore, GestureController, Footer, DebugOverlay } from '@features/camera-controls';
import { NativeFilmCamera } from '@entities/camera/ui/NativeFilmCamera';


export const CameraScreen = () => {
  return (
    <CameraScreenContent />
  );
};

const CameraScreenContent = () => {
  const { t } = useTranslation();
  const { isDebugEnabled, saturation, contrast, chromaticAberration, grainIntensity, grainEnabled, iso, ev, shutterSpeed, whiteBalance, autoExposure, setDebugInfo } = useCameraEffectsStore(useShallow(state => ({
    isDebugEnabled: state.isDebugEnabled,
    saturation: state.saturation,
    contrast: state.contrast,
    chromaticAberration: state.chromaticAberration,
    grainIntensity: state.grainIntensity,
    grainEnabled: state.grainEnabled,
    iso: state.iso,
    ev: state.ev,
    shutterSpeed: state.shutterSpeed,
    whiteBalance: state.whiteBalance,
    autoExposure: state.autoExposure,
    setDebugInfo: state.setDebugInfo,
  })));

  const [cameraKey, setCameraKey] = useState(0);

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
    requestPermission();
  }, []);

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>{t('camera.requesting_permissions')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NativeFilmCamera
        key={`camera-${cameraKey}`}
        style={StyleSheet.absoluteFill}
        saturation={saturation}
        contrast={contrast}
        chromaticAberration={chromaticAberration}
        grainIntensity={grainIntensity}
        grainEnabled={grainEnabled}
        iso={iso}
        exposureTime={shutterSpeed}
        ev={ev}
        whiteBalance={whiteBalance}
        autoExposure={autoExposure}
        onDebugUpdate={(event: { nativeEvent: { fps: number; resolution: string } }) => {
          if (event.nativeEvent) {
            setDebugInfo(event.nativeEvent.fps, event.nativeEvent.resolution);
          }
        }}
      />

      <GestureController />

      {isDebugEnabled && <DebugOverlay />}

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
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
