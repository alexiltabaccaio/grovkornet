import React, { ReactNode, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, withTiming, Easing } from 'react-native-reanimated';
import { useSystemStore } from '@entities/system';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore } from '@entities/body';

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
  const startY = useSharedValue(0);
  const hasMoved = useSharedValue(false);

  const lastTapTime = React.useRef<number>(0);
  const tapTimeout = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (activeSection === 'none') {
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    }
  }, [activeSection, translateY]);

  const composedGesture = useMemo(() => {
    const { zoom } = useBodyStore.getState();

    const tap = Gesture.Tap()
      .runOnJS(true)
      .onBegin(() => {
        hasMoved.value = false;
      })
      .onEnd(() => {
        if (hasMoved.value) {
          return;
        }
        const now = Date.now();
        const zoomVal = zoom.value;
        const isAtOneX = Math.abs(zoomVal - 1.0) < 0.01;

        if (isAtOneX) {
          if (activeSection !== 'none') {
            setActiveSection('none');
          }
          return;
        }

        // If not at 1x, check for double tap
        if (now - lastTapTime.current < 200) {
          if (tapTimeout.current) {
            clearTimeout(tapTimeout.current);
            tapTimeout.current = null;
          }
          zoom.value = withTiming(1.0, { duration: 250, easing: Easing.out(Easing.quad) });
          lastTapTime.current = 0; // Reset
        } else {
          lastTapTime.current = now;
          if (tapTimeout.current) {
            clearTimeout(tapTimeout.current);
          }
          tapTimeout.current = setTimeout(() => {
            if (activeSection !== 'none') {
              setActiveSection('none');
            }
            tapTimeout.current = null;
          }, 200);
        }
      });

    const pan = Gesture.Pan()
      .maxPointers(1)
      .onStart(() => {
        startY.value = translateY.value;
        hasMoved.value = false;
      })
      .onChange((event) => {
        if (activeSection !== 'none') {
          let newY = startY.value + event.translationY;
          if (newY > 0) newY = 0;
          translateY.value = newY;
        }
        if (Math.abs(event.translationY) > 5) {
          hasMoved.value = true;
        }
      })
      .onEnd(() => {
        // The viewfinder remains in its dragged position.
        // No closing of active section, no snap-back here.
      });

    return Gesture.Simultaneous(tap, pan);
  }, [activeSection, setActiveSection, translateY, startY, hasMoved]);

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
