import { useEffect, useMemo } from 'react';
import { useControlPanelStore } from '@entities/system';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, withTiming, withSpring, SharedValue, useAnimatedReaction } from 'react-native-reanimated';
import { useInteractionContext } from '@shared/lib';
import { BackHandler, Platform } from 'react-native';

interface UseControlPanelGesturesProps {
  externalTranslateY?: SharedValue<number>;
  externalDrawerAnimation?: SharedValue<number>;
}

const MAX_UP = -250; // Maximum height (open)

export const useControlPanelGestures = ({
  externalTranslateY,
  externalDrawerAnimation,
}: UseControlPanelGesturesProps = {}) => {
  const activeSection = useControlPanelStore(state => state.activeSection);
  const { isInteractable } = useInteractionContext();

  const localTranslateY = useSharedValue(activeSection === 'none' ? 0 : -50);
  const translateY = externalTranslateY || localTranslateY;
  const startY = useSharedValue(0);
  const localDrawerAnimation = useSharedValue(activeSection === 'none' ? 0 : -250);
  const drawerAnimation = externalDrawerAnimation || localDrawerAnimation;

  const activeSectionSV = useSharedValue(activeSection);

  useEffect(() => {
    activeSectionSV.value = activeSection;
  }, [activeSection, activeSectionSV]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (activeSection !== 'none') {
        useControlPanelStore.getState().setActiveSection('none');
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [activeSection]);

  useAnimatedReaction(
    () => activeSectionSV.value,
    (current, previous) => {
      if (previous === null) return; // Ignore initial mount if not changing

      if (current === 'none' && previous !== 'none') {
        // Close the drawer
        translateY.value = withTiming(0, { duration: 300 }); 
        drawerAnimation.value = withTiming(0, { duration: 300 }); 
      } else if (current !== 'none' && previous === 'none') {
        // Open the drawer
        translateY.value = withTiming(-50, { duration: 300 }); 
        drawerAnimation.value = withTiming(-250, { duration: 300 });
      }
    }
  );

  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .enabled(activeSection !== 'none' && isInteractable)
      .activeOffsetY([-15, 15]) // Increased to prevent small movements (wiggles) during tap from hijacking the event
      .failOffsetX([-15, 15]) // Fails the gesture if moving horizontally, unlocking touch events
      .onStart(() => {
        startY.value = isNaN(translateY.value) ? -50 : translateY.value;
      })
      .onUpdate((e) => {
        if (isNaN(e.translationY) || isNaN(startY.value)) return;
        let newY = startY.value + e.translationY;
        // Clamp between open and closed (now restricted to -50px as base)
        if (newY < MAX_UP) newY = MAX_UP;
        if (newY > -50) newY = -50;

        translateY.value = newY;
      })
      .onEnd((e) => {
        const currentY = isNaN(translateY.value) ? -50 : translateY.value;
        const vY = isNaN(e.velocityY) ? 0 : e.velocityY;
        const estimatedY = currentY + vY * 0.1;
        const snapPoints = [-50, -115, -150, MAX_UP];

        const targetY = snapPoints.reduce((prev, curr) =>
          Math.abs(curr - estimatedY) < Math.abs(prev - estimatedY) ? curr : prev
        );

        translateY.value = withSpring(targetY, {
          damping: 20,
          stiffness: 200,
          mass: 1,
        });
      });
  }, [startY, translateY, activeSection, isInteractable]);

  return {
    translateY,
    drawerAnimation,
    panGesture,
    activeSection,
  };
};
