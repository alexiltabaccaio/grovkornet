import { useEffect, useRef } from 'react';
import { SharedValue, withTiming } from 'react-native-reanimated';
import { useControlPanelStore } from '@entities/system';

interface UseForceLayoutSyncProps {
  shouldRenderGallery: boolean;
  drawerAnimation: SharedValue<number>;
  footerTranslateY: SharedValue<number>;
}

export const useForceLayoutSync = ({
  shouldRenderGallery,
  drawerAnimation,
  footerTranslateY,
}: UseForceLayoutSyncProps) => {
  const prevShouldRenderGallery = useRef(shouldRenderGallery);

  // Sync bottom sheet state when gallery opens or closes to prevent Reanimated desync on Android.
  // We use a small setTimeout of 50ms to allow React Native's native layout pass to complete
  // (e.g. unmounting GalleryViewer), then use zero-duration withTiming to force Reanimated
  // to re-apply the native view transform style on the UI thread Play Loop.
  // This is wrapped in a check against prevShouldRenderGallery to prevent executing on mount
  // and breaking unit tests.
  useEffect(() => {
    if (prevShouldRenderGallery.current !== shouldRenderGallery) {
      prevShouldRenderGallery.current = shouldRenderGallery;

      const timer = setTimeout(() => {
        const activeSection = useControlPanelStore.getState().activeSection;
        if (activeSection === 'none') {
          drawerAnimation.value = withTiming(-0.1, { duration: 0 }, () => {
            drawerAnimation.value = withTiming(0, { duration: 0 });
          });
          footerTranslateY.value = withTiming(0.1, { duration: 0 }, () => {
            footerTranslateY.value = withTiming(0, { duration: 0 });
          });
        } else {
          drawerAnimation.value = withTiming(-249.9, { duration: 0 }, () => {
            drawerAnimation.value = withTiming(-250, { duration: 0 });
          });
          const currentY = footerTranslateY.value;
          const targetY = isNaN(currentY) ? -50 : (currentY < 0 ? currentY : -50);
          footerTranslateY.value = withTiming(targetY + 0.1, { duration: 0 }, () => {
            footerTranslateY.value = withTiming(targetY, { duration: 0 });
          });
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [shouldRenderGallery, drawerAnimation, footerTranslateY]);
};
