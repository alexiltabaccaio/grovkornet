import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  cancelAnimation,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { useCameraStore } from '@entities/camera';

const FlashOverlayComponent = () => {
  const isCapturing = useCameraStore(state => state.isCapturing);
  const opacity = useSharedValue(0);
  const isCapturingSV = useSharedValue(isCapturing);

  useEffect(() => {
    isCapturingSV.value = isCapturing;
  }, [isCapturing, isCapturingSV]);

  useAnimatedReaction(
    () => isCapturingSV.value,
    (current, previous) => {
      if (current && !previous) {
        cancelAnimation(opacity);
        opacity.value = 0; // Reset
        opacity.value = withSequence(
          withTiming(1, { duration: 30 }),
          withTiming(0, { duration: 300 })
        );
      }
    }
  );

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

export const FlashOverlay = React.memo(FlashOverlayComponent);
