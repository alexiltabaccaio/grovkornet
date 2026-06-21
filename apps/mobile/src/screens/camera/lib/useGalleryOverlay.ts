import { useCallback, useEffect } from 'react';
import { useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { useGalleryStore } from '@entities/gallery';
import { useControlPanelStore } from '@entities/system';
import { useShallow } from 'zustand/shallow';
import { pauseStream, resumeStream } from '@grovkornet/engine';

export const useGalleryOverlay = (cameraKey?: number) => {
  const { isOpen, setIsOpen } = useGalleryStore(useShallow(state => ({
    isOpen: state.isOpen,
    setIsOpen: state.setIsOpen,
  })));

  const galleryTransition = useSharedValue(0);

  const handleOpenEnd = useCallback(() => {
    void pauseStream();
  }, []);

  const openGallery = useCallback(() => {
    useControlPanelStore.getState().setActiveSection('none');
    setIsOpen(true);
    // Wait for the transition to finish before pausing to prevent freezing the UI animation
    galleryTransition.value = withTiming(1, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(handleOpenEnd)();
      }
    });
  }, [galleryTransition, setIsOpen, handleOpenEnd]);

  const closeGallery = useCallback(() => {
    if (galleryTransition.value <= 0) {
      setIsOpen(false);
      return;
    }
    // Start the resume immediately! Thanks to the Zero-Bridge Frame Dropper, there is no hardware delay or freeze.
    void resumeStream();
    galleryTransition.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(setIsOpen)(false);
      }
    });
  }, [galleryTransition, setIsOpen]);

  // Sync native stream state (e.g. on camera remount when returning from background)
  useEffect(() => {
    if (isOpen) {
      // If the gallery is already open and stable (e.g. after remounting from background),
      // pause immediately to save resources.
      // If it is opening right now (transition.value < 1), let the animation callback
      // pause it at the end of the transition.
      if (galleryTransition.value === 1) {
        void pauseStream();
      }
    } else {
      // Restore stream when the gallery closes.
      void resumeStream();
    }
  }, [cameraKey, isOpen, galleryTransition]);

  // Safety net: if the overlay is closed via store or hardware back button bypassing closeGallery
  useEffect(() => {
    if (!isOpen) {
      if (galleryTransition.value > 0) {
        galleryTransition.value = withTiming(0, { duration: 300 });
      }
    }
  }, [isOpen, galleryTransition]);

  return {
    shouldRenderGallery: isOpen,
    galleryTransition,
    openGallery,
    closeGallery,
  };
};
