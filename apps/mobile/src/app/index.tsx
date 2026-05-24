import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CameraScreen } from '@screens/camera';

// Initialize i18n
import './providers/i18n';

import * as SystemUI from 'expo-system-ui';

LogBox.ignoreAllLogs(true);

// Set root background color at runtime to ensure the area under the nav bar is colored correctly
void SystemUI.setBackgroundColorAsync('#0e0e0e');

export function App() {
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

