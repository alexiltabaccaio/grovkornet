import React from 'react';
import { StyleSheet, View, Platform, StatusBar } from 'react-native';
import { useSystemStore } from '@entities/system';

// standard heights if native values are not available
const DEFAULT_ANDROID_HEIGHT = 24;
const DEFAULT_IOS_HEIGHT = 47;

const HeaderComponent = () => {
  const isLayoutOverlayEnabled = useSystemStore(state => state.isLayoutOverlayEnabled);
  
  // Try to use the native StatusBar height on Android, fallback to standard values
  const statusBarHeight = Platform.OS === 'android' 
    ? (StatusBar.currentHeight ?? DEFAULT_ANDROID_HEIGHT) 
    : DEFAULT_IOS_HEIGHT;

  return (
    <View 
      style={[
        styles.statusBarHeader, 
        { height: statusBarHeight },
        isLayoutOverlayEnabled && styles.statusBarHeaderDebug
      ]}
      pointerEvents="none"
    />
  );
};

const styles = StyleSheet.create({
  statusBarHeader: {
    width: '100%',
    backgroundColor: '#0e0e0e',
    zIndex: 900,
  },
  statusBarHeaderDebug: {
    backgroundColor: 'rgba(255, 149, 0, 0.35)', // orange semi-transparent
    borderBottomWidth: 1,
    borderBottomColor: '#FF5722',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


export const Header = React.memo(HeaderComponent);
