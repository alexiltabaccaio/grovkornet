import { useCallback } from 'react';
import { useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { useGalleryStore } from '@entities/gallery';
import { useControlPanelStore } from '@entities/system';
import { useShallow } from 'zustand/shallow';

export const useGalleryOverlay = () => {
  const { isOpen, setIsOpen } = useGalleryStore(useShallow(state => ({
    isOpen: state.isOpen,
    setIsOpen: state.setIsOpen,
  })));

  const galleryTransition = useSharedValue(0);

  const openGallery = useCallback(() => {
    useControlPanelStore.getState().setActiveSection('none');
    setIsOpen(true);
    galleryTransition.value = withTiming(1, { duration: 300 });
  }, [galleryTransition, setIsOpen]);

  const closeGallery = useCallback(() => {
    if (galleryTransition.value <= 0) {
      setIsOpen(false);
      return;
    }
    galleryTransition.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(setIsOpen)(false);
      }
    });
  }, [galleryTransition, setIsOpen]);

  return {
    shouldRenderGallery: isOpen,
    galleryTransition,
    openGallery,
    closeGallery,
  };
};
