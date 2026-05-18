import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
} from 'react-native-reanimated';
import { useUIStore } from '@features/camera-controls/model/useUIStore';

export const FlashOverlay = () => {
  const isCapturing = useUIStore(state => state.isCapturing);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isCapturing) {
      opacity.value = withSequence(
        withTiming(1, { duration: 50 }),
        withTiming(0, { duration: 150 })
      );
    }
  }, [isCapturing, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      pointerEvents="none" 
      style={[styles.overlay, animatedStyle]} 
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    zIndex: 999,
  },
});
