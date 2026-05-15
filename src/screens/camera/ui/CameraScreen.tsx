import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, AppState, AppStateStatus, PermissionsAndroid, Platform } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { useTranslation } from 'react-i18next';

import { useShallow } from 'zustand/react/shallow';
import { useUIStore, GestureController, Footer, DebugOverlay, ConnectedFilmCamera, ShutterButton } from '@features/camera-controls';


export const CameraScreen = () => {
  return (
    <CameraScreenContent />
  );
};

const CameraScreenContent = () => {
  const { t } = useTranslation();
  const { isDebugEnabled, triggerCapture } = useUIStore(useShallow(state => ({
    isDebugEnabled: state.isDebugEnabled,
    triggerCapture: state.triggerCapture,
  })));

  const footerTranslateY = useSharedValue(0);

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
    requestPermission().catch(error => {
      console.error('Camera permission error:', error);
    });
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
      <ConnectedFilmCamera cameraKey={cameraKey} />

      <GestureController />

      {isDebugEnabled && <DebugOverlay />}
      
      <View style={styles.shutterContainer} pointerEvents="box-none">
        <ShutterButton onPress={triggerCapture} translateY={footerTranslateY} />
      </View>

      <Footer translateY={footerTranslateY} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  shutterContainer: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50, // Sotto il footer (100)
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
