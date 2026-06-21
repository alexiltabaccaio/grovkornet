import React, { ReactNode, useMemo } from 'react';
import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, useAnimatedReaction, SharedValue } from 'react-native-reanimated';
import { useControlPanelStore } from '@entities/system';
import { useShallow } from 'zustand/shallow';
import { useBodyStore } from '@entities/body';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInteractionContext } from '@shared/lib';

interface GestureControllerProps {
  children?: ReactNode;
  footerTranslateY?: SharedValue<number>;
  drawerAnimation?: SharedValue<number>;
  viewfinderTranslateY?: SharedValue<number>;
}

export const GestureController = React.memo(({ children, footerTranslateY, drawerAnimation, viewfinderTranslateY }: GestureControllerProps) => {
  const { activeSection, setActiveSection } = useControlPanelStore(useShallow((s) => ({
    activeSection: s.activeSection,
    setActiveSection: s.setActiveSection,
  })));

  const { isInteractable } = useInteractionContext();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const statusBarHeight = Platform.OS === 'android' 
    ? (StatusBar.currentHeight ?? 24) 
    : 47;

  const viewportWidth = screenWidth;
  const viewportHeight = screenHeight - statusBarHeight - 80 - insets.bottom;

  const localTranslateY = useSharedValue(0);
  const translateY = viewfinderTranslateY ?? localTranslateY;
  const startY = useSharedValue(0);
  const hasMoved = useSharedValue(false);
  const hasWarnedPanNaN = useSharedValue(false);

  const isClosing = useSharedValue(false);
  const isPanning = useSharedValue(false);

  const activeSectionSV = useSharedValue(activeSection);

  React.useEffect(() => {
    activeSectionSV.value = activeSection;
  }, [activeSection, activeSectionSV]);

  const lastTapTime = React.useRef<number>(0);
  const tapTimeout = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }
    };
  }, []);

  // The `activeSectionSV` tracks the Zustand state.
  // The logic for animating to 0 when closed is handled directly in the useAnimatedReaction below.

  const { aspectRatio } = useBodyStore.getState();

  useAnimatedReaction(
    () => {
      return aspectRatio.value;
    },
    (currentValue, previousValue) => {
      if (previousValue !== undefined && previousValue !== null && currentValue !== previousValue) {
        translateY.value = withTiming(0, { duration: 300 });
      }
    }
  );

  const getDynamicLimit = React.useCallback(() => {
    'worklet';
    const ft = footerTranslateY ? footerTranslateY.value : 0;
    const da = drawerAnimation ? drawerAnimation.value + 250 : 0;
    if (!footerTranslateY) return 0;

    const aspectValue = aspectRatio.value;
    let targetAspect = 4.0 / 3.0;
    if (aspectValue === 0) targetAspect = 4.0 / 3.0;
    else if (aspectValue === 1) targetAspect = 16.0 / 9.0;
    else if (aspectValue === 2) targetAspect = 1.0;
    else if (aspectValue === 3) targetAspect = 3.0 / 2.0;
    else if (aspectValue === 4) targetAspect = 65.0 / 24.0;

    if (viewportHeight <= 0 || viewportWidth <= 0) {
      const limit = ft + da - 144;
      return limit > 0 ? 0 : limit;
    }

    const viewAspect = viewportWidth / viewportHeight;
    const finalTargetAspect = 1.0 / targetAspect;

    let lBottom = 0;
    if (viewAspect <= finalTargetAspect) {
      const previewHeight = viewportWidth * targetAspect;
      lBottom = (viewportHeight - previewHeight) / 2;
    }

    const limit = ft + da - 144 + lBottom;
    return limit > 0 ? 0 : limit;
  }, [footerTranslateY, drawerAnimation, aspectRatio, viewportHeight, viewportWidth]);

  useAnimatedReaction(
    () => {
      // Direct access to ensure Reanimated auto-subscribes to changes
      const _ftVal = footerTranslateY ? footerTranslateY.value : 0;
      const _daVal = drawerAnimation ? drawerAnimation.value + 250 : 0;
      const _aspectVal = aspectRatio.value;
      
      return getDynamicLimit();
    },
    (currentLimit) => {
      if (!isClosing.value && !isPanning.value && footerTranslateY && translateY.value < currentLimit) {
        translateY.value = currentLimit;
      }
    }
  );

  useAnimatedReaction(
    () => activeSectionSV.value,
    (current, previous) => {
      if (previous === null) return;
      
      if (current === 'none' && previous !== 'none') {
        isClosing.value = true;
        translateY.value = withTiming(0, { duration: 300 }, () => {
          isClosing.value = false;
        });
      } else if (current !== 'none' && previous === 'none') {
        isClosing.value = false;
      }
      
      // Fallback: If we somehow end up in 'none' state but translateY isn't 0, force it.
      if (current === 'none' && !isClosing.value && translateY.value !== 0) {
        translateY.value = 0;
      }
    }
  );

  useAnimatedReaction(
    () => Math.round(translateY.value),
    (current, prev) => {
      if (prev !== null && Math.abs(current - prev) > 10) {
        // eslint-disable-next-line no-console
        console.log(`[GestureController] translateY jumped from ${prev} to ${current}. ActiveSection: ${activeSectionSV.value}, isClosing: ${isClosing.value}`);
      }
    }
  );

  const composedGesture = useMemo(() => {
    const { zoom } = useBodyStore.getState();

    const tap = Gesture.Tap()
      .enabled(isInteractable)
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
          if (activeSectionSV.value !== 'none') {
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
            if (activeSectionSV.value !== 'none') {
              setActiveSection('none');
            }
            tapTimeout.current = null;
          }, 200);
        }
      });

    const pan = Gesture.Pan()
      .enabled(isInteractable)
      .maxPointers(1)
      .onStart(() => {
        isPanning.value = true;
        startY.value = translateY.value;
        hasMoved.value = false;
      })
      .onChange((event) => {
        const cy = event.changeY ?? 0;
        if (isNaN(cy)) {
          if (__DEV__ && !hasWarnedPanNaN.value) {
            hasWarnedPanNaN.value = true;
            console.warn(`[Gesture Warning]: changeY is NaN in GestureController`);
          }
          return;
        }
        if (activeSectionSV.value !== 'none') {
          let newY = translateY.value + cy;
          if (newY > 0) newY = 0;
          
          if (footerTranslateY) {
            const limit = getDynamicLimit();
            if (newY < limit) newY = limit;
          }
          translateY.value = newY;
        }
        if (Math.abs(event.translationY) > 5) {
          hasMoved.value = true;
        }
      })
      .onEnd(() => {
        // The viewfinder remains in its dragged position.
        // No closing of active section, no snap-back here.
      })
      .onFinalize(() => {
        isPanning.value = false;
      });

    return Gesture.Simultaneous(tap, pan);
  }, [setActiveSection, translateY, startY, hasMoved, footerTranslateY, isInteractable, activeSectionSV, getDynamicLimit, hasWarnedPanNaN, isPanning]);

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
});

GestureController.displayName = 'GestureController';

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
