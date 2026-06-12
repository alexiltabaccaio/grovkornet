import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSharedValue, SharedValue, withTiming } from 'react-native-reanimated';
import { useSystemStore } from '@entities/system';

interface UseCameraAppStateProps {
  shouldRenderGallery: boolean;
  galleryTransition: SharedValue<number>;
}

export const useCameraAppState = ({
  shouldRenderGallery,
  galleryTransition,
}: UseCameraAppStateProps) => {
  const initialActiveSection = useSystemStore.getState().activeSection;
  const [cameraKey, setCameraKey] = useState(0);
  const drawerAnimation = useSharedValue(initialActiveSection === 'none' ? 250 : 0);
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
          const isActiveSectionNone = useSystemStore.getState().activeSection === 'none';
          if (isActiveSectionNone) {
            drawerAnimation.value = 249.9;
            footerTranslateY.value = 0.1;
            requestAnimationFrame(() => {
              drawerAnimation.value = 250;
              footerTranslateY.value = 0;
            });
          } else {
            drawerAnimation.value = 0.1;
            const currentY = footerTranslateY.value;
            const targetY = isNaN(currentY) ? -50 : (currentY < 0 ? currentY : -50);
            
            // Force Reanimated to update the UI thread by using an animation
            drawerAnimation.value = withTiming(0, { duration: 50 });
            footerTranslateY.value = withTiming(targetY, { duration: 50 });
          }

          if (shouldRenderGallery) {
            // Modify the value on the JS thread to ensure Reanimated's JS proxy
            // correctly re-binds and notifies all child components (like GalleryViewer).
            // runOnUI bypasses this, causing cross-component useAnimatedStyle to stay stuck.
            galleryTransition.value = 0.99;
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

  return {
    cameraKey,
    drawerAnimation,
    footerTranslateY,
  };
};
