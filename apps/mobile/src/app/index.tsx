import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CameraScreen } from '@screens/camera';
import { useSystemStore } from '@entities/system';

// Initialize i18n
import './providers/i18n';

LogBox.ignoreAllLogs(true);

// Monkey patch View for X-Ray debugger
const OriginalViewRender = (View as any).render;
if (OriginalViewRender) {
  (View as any).render = function (props: any, ref: any) {
    const { pointerEvents, style, ...rest } = props;
    // @ts-ignore
    const isXRayEnabled = global.__xray_enabled;
    let borderColor = 'transparent';
    let borderWidth = 0;

    if (isXRayEnabled) {
      borderWidth = 1;
      if (pointerEvents === 'none') borderColor = 'red';
      else if (pointerEvents === 'box-none') borderColor = 'blue';
      else if (pointerEvents === 'auto') borderColor = 'green';
      else if (pointerEvents === 'box-only') borderColor = 'yellow';
      else borderColor = 'rgba(255, 255, 255, 0.2)'; // Default
    }

    return OriginalViewRender.call(this, {
      ...rest,
      pointerEvents,
      style: [style, isXRayEnabled && { borderWidth, borderColor }]
    }, ref);
  };
}

export function App() {
  const isXRayEnabled = useSystemStore(state => state.isXRayEnabled);
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }} key={isXRayEnabled ? 'xray-on' : 'xray-off'}>
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
    backgroundColor: '#000',
  },
});
