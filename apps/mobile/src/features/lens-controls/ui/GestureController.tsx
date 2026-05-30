import React, { ReactNode, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { useSystemStore } from '@entities/system';
import { useShallow } from 'zustand/react/shallow';

/**
 * GestureController handles global vertical swipe gestures to update the active camera parameter.
 * It is now generic and follows the Open-Closed Principle by consuming a GestureConfig 
 * provided by the active ParameterControl.
 */
interface GestureControllerProps {
  children?: ReactNode;
}

export const GestureController = ({ children }: GestureControllerProps) => {
  const { activeSection, setActiveSection } = useSystemStore(useShallow((s) => ({
    activeSection: s.activeSection,
    setActiveSection: s.setActiveSection,
  })));

  const translateY = useSharedValue(0);

  const composedGesture = useMemo(() => {
    const tap = Gesture.Tap()
      .runOnJS(true)
      .onEnd(() => {
        if (activeSection !== 'none') {
          setActiveSection('none');
        }
      });

    const pan = Gesture.Pan()
      .maxPointers(1)
      .onChange((event) => {
        if (activeSection !== 'none' && event.translationY < 0) {
          translateY.value = event.translationY;
        }
      })
      .onEnd((event) => {
        if (activeSection !== 'none') {
          if (event.translationY < -100 || event.velocityY < -500) {
            runOnJS(setActiveSection)('none');
          }
          translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
        }
      });

    return Gesture.Simultaneous(tap, pan);
  }, [activeSection, setActiveSection, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]} pointerEvents="auto">
        {children}
      </Animated.View>
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
