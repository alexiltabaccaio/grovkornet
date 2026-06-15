import { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSharedValue, SharedValue, withTiming } from 'react-native-reanimated';
import { useControlPanelStore } from '@entities/system';

interface UseCameraAppStateProps {
  shouldRenderGallery: boolean;
  galleryTransition: SharedValue<number>;
}

export const useCameraAppState = ({
  shouldRenderGallery,
  galleryTransition,
}: UseCameraAppStateProps) => {
  const initialActiveSection = useControlPanelStore.getState().activeSection;
  const [cameraKey, setCameraKey] = useState(0);
  const drawerAnimation = useSharedValue(initialActiveSection === 'none' ? 0 : -250);
  const footerTranslateY = useSharedValue(initialActiveSection === 'none' ? 0 : -50);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const nextIsActive = nextAppState === 'active';
      if (nextIsActive) {
        setCameraKey((prev) => prev + 1);

        // When returning from background on Android, Reanimated can sometimes lose the
        // current UI-thread value of SharedValues if the Activity was recreated.
        // Since the native views and Reanimated's UI context take some time to rebuild 
        // after onHostResume, we must delay the sync slightly, otherwise the runOnUI 
        // instruction is executed before the context is ready and gets lost.
        setTimeout(() => {
          // Restore basic layout state that could be lost
          const isActiveSectionNone = useControlPanelStore.getState().activeSection === 'none';
          if (isActiveSectionNone) {
            drawerAnimation.value = -0.1;
            footerTranslateY.value = 0.1;
            requestAnimationFrame(() => {
              drawerAnimation.value = 0;
              footerTranslateY.value = 0;
            });
          } else {
            drawerAnimation.value = -249.9;
            const currentY = footerTranslateY.value;
            const targetY = isNaN(currentY) ? -50 : (currentY < 0 ? currentY : -50);
            
            // Force Reanimated to update the UI thread by using an animation
            drawerAnimation.value = withTiming(-250, { duration: 50 });
            footerTranslateY.value = withTiming(targetY, { duration: 50 });
          }

          if (shouldRenderGallery) {
            // Modify the value on the JS thread to ensure Reanimated's JS proxy
            // correctly re-binds and notifies all child components (like GalleryViewer).
            // runOnUI bypasses this, causing cross-component useAnimatedStyle to stay stuck.
            galleryTransition.value = 0.9999;
            requestAnimationFrame(() => {
              galleryTransition.value = 1;
            });
          }
        }, 150);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [shouldRenderGallery, galleryTransition, drawerAnimation, footerTranslateY]);

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

  return {
    cameraKey,
    drawerAnimation,
    footerTranslateY,
  };
};
