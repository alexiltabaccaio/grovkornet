import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useUIStore } from '../model/useUIStore';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_HEIGHT = SCREEN_HEIGHT * 0.3;

/**
 * GestureController handles global vertical swipe gestures to update the active camera parameter.
 * It is now generic and follows the Open-Closed Principle by consuming a GestureConfig 
 * provided by the active ParameterControl.
 */
export const GestureController = () => {
  const gestureConfig = useUIStore((s) => s.gestureConfig);
  const startVal = useSharedValue(0);

  const gesture = Gesture.Pan()
    .activeOffsetY([-10, 10]) // Only activate on vertical swipe to not conflict with horizontal ScrollViews
    .failOffsetX([-10, 10]) // Fail if there is horizontal movement, allowing scroll
    .onStart(() => {
      if (!gestureConfig) {
        startVal.value = -1;
        return;
      }
      startVal.value = gestureConfig.value.value;
    })
    .onUpdate((e) => {
      if (!gestureConfig || startVal.value === -1) return;

      const { value, minValue, maxValue, invertDrag } = gestureConfig;
      const range = maxValue - minValue;
      
      // Vertical translation is inverted in UI coordinates (up is negative)
      // We want UP to increase the value, so we negate translationY.
      const direction = invertDrag ? -1 : 1;
      const delta = -(e.translationY / SLIDER_HEIGHT) * range * direction;
      
      const newValue = Math.min(Math.max(startVal.value + delta, minValue), maxValue);
      
      updateSharedValue(value, newValue);
    });

  // If no parameter is active or gesture-enabled, don't render the gesture area
  if (!gestureConfig) {
    return null;
  }

  return (
    <GestureDetector gesture={gesture}>
      <AnimatedViewWithStyles />
    </GestureDetector>
  );
};

// Extracted View to keep the main component clean
const AnimatedViewWithStyles = () => (
  <View style={styles.container} pointerEvents="box-none" />
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 10,
  },
});
