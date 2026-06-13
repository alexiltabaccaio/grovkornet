import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated';
import { useCameraStore } from '@entities/camera';

export const FlashOverlay = () => {
  const isCapturing = useCameraStore(state => state.isCapturing);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isCapturing) {
      cancelAnimation(opacity);
      opacity.value = 0; // Reset
      opacity.value = withSequence(
        withTiming(1, { duration: 30 }),
        withTiming(0, { duration: 300 })
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
    ...StyleSheet.absoluteFill,
    backgroundColor: 'white',
    zIndex: 999,
  },
});
