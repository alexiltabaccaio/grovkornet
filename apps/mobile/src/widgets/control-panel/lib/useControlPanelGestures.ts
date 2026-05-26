import { useEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '@entities/system';
import { Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, withTiming, withSpring } from 'react-native-reanimated';

interface UseControlPanelGesturesProps {
  externalTranslateY?: Animated.SharedValue<number>;
  externalDrawerAnimation?: Animated.SharedValue<number>;
}

const MAX_UP = -250; // Maximum height (open)

export const useControlPanelGestures = ({
  externalTranslateY,
  externalDrawerAnimation,
}: UseControlPanelGesturesProps = {}) => {
  const { activeSection } = useSystemStore(useShallow(state => ({
    activeSection: state.activeSection,
  })));

  const localTranslateY = useSharedValue(0);
  const translateY = externalTranslateY || localTranslateY;
  const startY = useSharedValue(0);
  const localDrawerAnimation = useSharedValue(250);
  const drawerAnimation = externalDrawerAnimation || localDrawerAnimation;

  const wasClosed = useRef(activeSection === 'none');

  useEffect(() => {
    if (activeSection === 'none') {
      // Close the drawer
      translateY.value = withTiming(0, { duration: 300 }); // reset the pan gesture with animation
      drawerAnimation.value = withTiming(250, { duration: 300 }); // push it down to hide
      wasClosed.current = true;
    } else {
      // Open the drawer
      if (wasClosed.current) {
        translateY.value = withTiming(-50, { duration: 300 }); // Set target base height to -50px with smooth animation
        drawerAnimation.value = withTiming(0, { duration: 300 });
        wasClosed.current = false;
      }
    }
  }, [activeSection, translateY, drawerAnimation]);

  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetY([-15, 15]) // Increased to prevent small movements (wiggles) during tap from hijacking the event
      .failOffsetX([-15, 15]) // Fails the gesture if moving horizontally, unlocking touch events
      .onStart(() => {
        startY.value = translateY.value;
      })
      .onUpdate((e) => {
        let newY = startY.value + e.translationY;
        // Clamp between open and closed (now restricted to -50px as base)
        if (newY < MAX_UP) newY = MAX_UP;
        if (newY > -50) newY = -50;

        translateY.value = newY;
      })
      .onEnd((e) => {
        const estimatedY = translateY.value + e.velocityY * 0.1;
        const snapPoints = [-50, -110, MAX_UP];

        const targetY = snapPoints.reduce((prev, curr) =>
          Math.abs(curr - estimatedY) < Math.abs(prev - estimatedY) ? curr : prev
        );

        translateY.value = withSpring(targetY, {
          damping: 20,
          stiffness: 200,
          mass: 1,
        });
      });
  }, [startY, translateY]);

  return {
    translateY,
    drawerAnimation,
    panGesture,
    activeSection,
  };
};
