import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, interpolate, Extrapolation, withTiming, withRepeat, withSequence, cancelAnimation, useAnimatedReaction, SharedValue } from 'react-native-reanimated';
import { useControlPanelStore } from '@entities/system';
import { useGalleryStore } from '@entities/gallery';

export const useCameraUIAnimations = (galleryTransition: SharedValue<number>, cameraKey: number | string) => {
  const activeSection = useControlPanelStore(state => state.activeSection);
  
  const drawerAnimation = useSharedValue(activeSection === 'none' ? 0 : -250);
  const footerTranslateY = useSharedValue(activeSection === 'none' ? 0 : -50);
  const viewfinderTranslateY = useSharedValue(0);
  
  // layoutSyncOffset provides a continuous micro-animation when the sheet is open
  // to force Android HWUI to retain reanimated transform/opacity properties across layout passes.
  const layoutSyncOffset = useSharedValue(0);

  // Safety net: whenever activeSection becomes 'none' (e.g. opening gallery),
  // we guarantee the drawer animates to 0. This prevents the drawer from getting stuck open
  // if the heavy Modal mount blocks the JS thread and interrupts the gesture reactions.
  useEffect(() => {
    if (activeSection === 'none') {
      drawerAnimation.value = withTiming(0, { duration: 300 });
      footerTranslateY.value = withTiming(0, { duration: 300 });
    }
  }, [activeSection, drawerAnimation, footerTranslateY, viewfinderTranslateY]);

  // Reset SharedValues on cameraKey change (background resume) to prevent stale state bugs.
  useEffect(() => {
    const currentActiveSection = useControlPanelStore.getState().activeSection;
    if (currentActiveSection === 'none') {
      drawerAnimation.value = 0;
      footerTranslateY.value = 0;
      viewfinderTranslateY.value = 0;
    }
    const isGalleryOpen = useGalleryStore.getState().isOpen;
    if (isGalleryOpen) {
      galleryTransition.value = 0.999;
      galleryTransition.value = withTiming(1, { duration: 50 });
    } else {
      galleryTransition.value = 0;
    }
  }, [cameraKey, drawerAnimation, footerTranslateY, viewfinderTranslateY, galleryTransition]);

  // When the bottom sheet is open, we run a continuous microscopic animation (0.001px) on the UI thread.
  // This ultra-lightweight wiggle forces Reanimated to continuously push fresh transform updates
  // to the native HWUI layer. This successfully bypasses the Android bug where SurfaceView relayouts 
  // (caused by changing camera parameters) drop the volatile transform/opacity overrides on absolute sibling views.
  useAnimatedReaction(
    () => ({
      drawer: drawerAnimation.value,
      gallery: galleryTransition.value,
    }),
    (current, previous) => {
      const isDrawerOpen = current.drawer < -100;
      const isGalleryActive = current.gallery > 0;

      if (isDrawerOpen || isGalleryActive) {
        layoutSyncOffset.value = withRepeat(
          withSequence(
            withTiming(0.001, { duration: 100 }),
            withTiming(0, { duration: 100 })
          ),
          -1 // Infinite repeat while open or transitioning
        );
      } else if (previous && previous.gallery > 0 && current.gallery === 0) {
        // Run a post-closing wiggle for 500ms to allow SurfaceView layout stabilization.
        layoutSyncOffset.value = withSequence(
          withTiming(0.001, { duration: 100 }),
          withTiming(0, { duration: 100 }),
          withTiming(0.001, { duration: 100 }),
          withTiming(0, { duration: 100 }),
          withTiming(0, { duration: 100 }, (finished) => {
            if (finished) {
              layoutSyncOffset.value = 0;
            }
          })
        );
      } else {
        cancelAnimation(layoutSyncOffset);
        layoutSyncOffset.value = 0;
      }
    }
  );

  const animatedBottomControlsStyle = useAnimatedStyle(() => {
    // drawerAnimation goes from 0 (closed) to -250 (open)
    // footerTranslateY goes from 0 (open) to -250 (pulled up)
    // Total goes from 0 (closed) to -250 (open) to -500 (pulled up)
    // We want to fade out the controls as the drawer opens (totalOffset goes from 250 -> 150)
    // galleryTransition.value * 100 reduces totalOffset to 150, which triggers the fade out
    // layoutSyncOffset.value guarantees a UI thread update every frame when open.
    const totalOffset = drawerAnimation.value + 250 + footerTranslateY.value - (galleryTransition.value * 100) + layoutSyncOffset.value;
    const opacity = interpolate(
      totalOffset,
      [150, 250],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      totalOffset,
      [150, 250],
      [30, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return {
    drawerAnimation,
    footerTranslateY,
    viewfinderTranslateY,
    layoutSyncOffset,
    animatedBottomControlsStyle,
  };
};
