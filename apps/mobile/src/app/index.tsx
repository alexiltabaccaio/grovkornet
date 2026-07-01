// ⚠️ AI WARNING: Before modifying the app root, query the dependency graph: node packages/shared/scripts/graphrag/query.js <query>
import { useCameraStore } from '@entities/camera';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CameraScreen } from '@screens/camera';
import { usePresetStore } from '@entities/preset';
import { Image } from 'expo-image';
import { initThumbnailGenerator } from '@features/presets';

// Initialize i18n
import './providers';
import './store-assertions';

import i18n from 'i18next';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { usePreferencesStore } from '@entities/preferences';
import { initPreferenceSync } from '@features/sections/system';
import { applyPreset } from '@features/presets';
import { initNativeSync } from './lib/nativeSync';
import { setHapticsEnabledChecker } from '@shared/lib/haptics';
import { NativeCameraEventEmitter } from '@grovkornet/engine';
import { logger } from '@shared/lib/logger';

import * as SystemUI from 'expo-system-ui';

LogBox.ignoreAllLogs(true);

// Set root background color at runtime to ensure the area under the nav bar is colored correctly
SystemUI.setBackgroundColorAsync('#0e0e0e').catch(() => {
  // Ignore error if the current activity is not available during bundle evaluation
});

export function App() {
  useEffect(() => {
    // Connect shared haptics service to preferences store (resolving FSD layer violation)
    setHapticsEnabledChecker(() => {
      const { hapticsEnabled } = usePreferencesStore.getState();
      return hapticsEnabled !== false;
    });

    /* eslint-disable @typescript-eslint/no-require-imports */
    // Prefetch static assets for settings/information panel
    const staticAssets = [
      require('../../assets/flags/en.png'),
      require('../../assets/flags/it.png'),
      require('../../assets/monoscope.jpg'),
    ];
    /* eslint-enable @typescript-eslint/no-require-imports */

    // Load static assets
    void Promise.all(staticAssets.map(asset => Image.loadAsync(asset as number)));

    // Prefetch user preset thumbnails
    const presetStore = usePresetStore.getState();
    const { userPresets, customizedThumbnailUri } = presetStore;
    const presetUris = userPresets
      .map((p) => p.thumbnailUri)
      .filter((uri): uri is string => typeof uri === 'string');
      
    if (customizedThumbnailUri) {
      presetUris.push(customizedThumbnailUri);
    }

    if (presetUris.length > 0) {
      void Image.prefetch(presetUris);
    }

    // Restore global preferences
    const prefs = usePreferencesStore.getState();
    const bodyStore = useBodyStore.getState();
    const lensStore = useLensStore.getState();
    
    if (prefs.resolutionSetting !== null) {
      bodyStore.resolutionSetting.value = prefs.resolutionSetting;
    }
    if (prefs.fpsSetting !== null) {
      bodyStore.fpsSetting.value = prefs.fpsSetting;
    }
    if (prefs.aspectRatio !== null) {
      bodyStore.aspectRatio.value = prefs.aspectRatio;
    }
    if (prefs.force60fpsCrop !== null) {
      bodyStore.force60fpsCrop.value = prefs.force60fpsCrop;
    }
    if (prefs.previewQuality !== null) {
      bodyStore.previewQuality.value = prefs.previewQuality;
    }
    if (prefs.language !== null) {
      void i18n.changeLanguage(prefs.language).catch(() => {});
    }
    if (prefs.cameraId !== null) {
      lensStore.cameraId = prefs.cameraId;
    }
    if (prefs.cameraAuto !== null) {
      lensStore.cameraAuto = prefs.cameraAuto;
    }
    if (prefs.focusDistance !== null) {
      lensStore.focusDistance.value = prefs.focusDistance;
    }
    if (prefs.focusAuto !== null) {
      lensStore.focusAuto.value = prefs.focusAuto;
    }

    // Initialize the preset thumbnail generator in the background
    const unsubscribeThumb = initThumbnailGenerator();

    // Initialize Sync Managers for Native Camera JSI and User Preferences
    initNativeSync();
    initPreferenceSync();

    // Subscribe to device health updates
    let sub: ReturnType<typeof NativeCameraEventEmitter.addListener> | null = null;
    try {
      sub = NativeCameraEventEmitter.addListener('onDeviceHealthUpdate', (event: { thermalState: 'normal' | 'warning' | 'critical'; isLowRam: boolean }) => {
        logger.info('DeviceHealth', `Received thermalState: ${event.thermalState}, isLowRam: ${event.isLowRam}`);
        useCameraStore.getState().setThermalState(event.thermalState);
        useCameraStore.getState().setIsLowRam(event.isLowRam);
      });
    } catch (error) {
      console.error('Failed to subscribe to onDeviceHealthUpdate event', error);
    }

    // Apply the favorite preset or fallback to default on startup, 
    // ignoring the last active preset (which might have been 'customized')
    
    const favorite = userPresets.find((p) => p.isFavorite);
    if (favorite) {
      applyPreset(favorite.id);
    } else {
      applyPreset('default');
    }

    return () => {
      unsubscribeThumb();
      if (sub) {
        sub.remove();
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar style="light" />
          <CameraScreen />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
  },
});

