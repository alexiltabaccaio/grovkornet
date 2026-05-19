import React from 'react';
import { StyleSheet, View, Text, Platform, StatusBar } from 'react-native';
import { useUIStore } from '@features/camera-controls/model/useUIStore';

// standard heights if native values are not available
const DEFAULT_ANDROID_HEIGHT = 24;
const DEFAULT_IOS_HEIGHT = 47;

export const StatusBarHeader = () => {
  const isDebugEnabled = useUIStore(state => state.isDebugEnabled);
  
  // Try to use the native StatusBar height on Android, fallback to standard values
  const statusBarHeight = Platform.OS === 'android' 
    ? (StatusBar.currentHeight ?? DEFAULT_ANDROID_HEIGHT) 
    : DEFAULT_IOS_HEIGHT;

  return (
    <View 
      style={[
        styles.statusBarHeader, 
        { height: statusBarHeight },
        isDebugEnabled && styles.statusBarHeaderDebug
      ]}
      pointerEvents="none"
    >
      {isDebugEnabled && (
        <Text style={styles.debugText}>
          STATUS BAR HEADER ({statusBarHeight}px)
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  statusBarHeader: {
    width: '100%',
    backgroundColor: '#000',
    zIndex: 900,
  },
  statusBarHeaderDebug: {
    backgroundColor: 'rgba(255, 149, 0, 0.35)', // orange semi-transparent
    borderBottomWidth: 1,
    borderBottomColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});
