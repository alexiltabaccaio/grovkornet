import React, { ReactNode } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useUIStore } from '../model/useUIStore';
import { useShallow } from 'zustand/react/shallow';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_HEIGHT = SCREEN_HEIGHT * 0.3;

/**
 * GestureController handles global vertical swipe gestures to update the active camera parameter.
 * It is now generic and follows the Open-Closed Principle by consuming a GestureConfig 
 * provided by the active ParameterControl.
 */
interface GestureControllerProps {
  children?: ReactNode;
}

export const GestureController = ({ children }: GestureControllerProps) => {
  const { gestureConfig, activeSection, setActiveSection } = useUIStore(useShallow((s) => ({
    gestureConfig: s.gestureConfig,
    activeSection: s.activeSection,
    setActiveSection: s.setActiveSection,
  })));
  const startVal = useSharedValue(0);

  const panGesture = Gesture.Pan()
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

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => {
      if (activeSection !== 'none') {
        setActiveSection('none');
      }
    });

  const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.container} pointerEvents="auto">
        {children}
      </View>
    </GestureDetector>
  );
};

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
