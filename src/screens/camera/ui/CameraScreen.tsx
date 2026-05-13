import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, AppState, AppStateStatus } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useCameraFormat } from 'react-native-vision-camera';
import { useTranslation } from 'react-i18next';

import { CameraEffectsProvider, useCameraEffectsContext, GestureController, Footer, DebugOverlay } from '@features/camera-controls';


export const CameraScreen = () => {
  return (
    <CameraEffectsProvider>
      <CameraScreenContent />
    </CameraEffectsProvider>
  );
};

const CameraScreenContent = () => {
  const { t } = useTranslation();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  
  // Per dispositivi di varie fasce:
  // 1. Evitiamo il 4K che ucciderebbe le prestazioni con lo Skia Frame Processor (impostiamo 1080p o 720p).
  // 2. Chiediamo 60 FPS se disponibili, ma la libreria farà un fallback automatico a 30 FPS se il telefono non li supporta.
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1920, height: 1080 } },
    { fps: 60 }
  ]);
  
  // Se il device supporta i 60fps li usiamo, altrimenti usiamo il suo massimo (es. 30), senza superare i 60 per non consumare troppa batteria.
  const targetFps = format?.maxFps ? Math.min(format.maxFps, 60) : 30;
  
  const { frameProcessor, isDebugEnabled } = useCameraEffectsContext();

  const [isActive, setIsActive] = useState(AppState.currentState === 'active');
  const [cameraKey, setCameraKey] = useState(0);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const nextIsActive = nextAppState === 'active';
      setIsActive(nextIsActive);
      if (nextIsActive) {
        setCameraKey(prev => prev + 1);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>{t('camera.requesting_permissions')}</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>{t('camera.not_found')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        key={`camera-${cameraKey}`}
        style={StyleSheet.absoluteFill}
        device={device}
        format={format}
        fps={targetFps}
        isActive={isActive}
        pixelFormat="rgb"
        frameProcessor={frameProcessor}
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
