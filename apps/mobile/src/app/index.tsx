import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CameraScreen } from '@screens/camera';
import { usePresetStore } from '@entities/preset';
import { Image } from 'expo-image';
import { initThumbnailGenerator } from '@features/preset-thumbnails';

// Initialize i18n
import './providers/i18n';
import './store-assertions';

import i18n from 'i18next';
import { useBodyStore, setBodyParameterChangeListener } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { setFilmParameterChangeListener } from '@entities/film';
import { usePreferencesStore } from '@entities/preferences';
import { applyPreset, markAsCustomized } from '@features/system-settings';

import * as SystemUI from 'expo-system-ui';

LogBox.ignoreAllLogs(true);

// Set root background color at runtime to ensure the area under the nav bar is colored correctly
void SystemUI.setBackgroundColorAsync('#0e0e0e');

export function App() {
  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-require-imports */
    // Prefetch static assets for settings/informazioni panel
    const staticAssets = [
      require('../../assets/flags/en.png'),
      require('../../assets/flags/it.png'),
      require('../../assets/monoscope.jpg'),
    ] as unknown as string[];
    /* eslint-enable @typescript-eslint/no-require-imports */

    void Image.prefetch(staticAssets);

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
    if (prefs.force4k60fpsCrop !== null) {
      bodyStore.force4k60fpsCrop.value = prefs.force4k60fpsCrop;
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

    // Inizializza il generatore di thumbnail per i preset in background
    const unsubscribeThumb = initThumbnailGenerator();

    // Register listeners to mark preset as customized on manual changes
    if (typeof setFilmParameterChangeListener === 'function') {
      setFilmParameterChangeListener(() => {
        markAsCustomized();
      });
    }
    if (typeof setBodyParameterChangeListener === 'function') {
      setBodyParameterChangeListener(() => {
        markAsCustomized();
      });
    }

    // Apply the favorite preset or fallback to default on startup, 
    // ignoring the last active preset (which might have been 'customized')
    const presetStore = usePresetStore.getState();
    const { userPresets } = presetStore;
    
    const favorite = userPresets.find((p) => p.isFavorite);
    if (favorite) {
      applyPreset(favorite.id);
    } else {
      applyPreset('default');
    }

    return () => {
      unsubscribeThumb();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar style="light" />
        <CameraScreen />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
  },
});

