import { useCallback, useEffect, useRef } from 'react';
import { useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { useGalleryStore } from '@entities/gallery';
import { useShallow } from 'zustand/shallow';

export const useGalleryOverlay = () => {
  const { latestCapturedUri, latestPreviewUri, isOpen, setIsOpen } = useGalleryStore(useShallow(state => ({
    latestCapturedUri: state.latestCapturedUri,
    latestPreviewUri: state.latestPreviewUri,
    isOpen: state.isOpen,
    setIsOpen: state.setIsOpen,
  })));

  const galleryTransition = useSharedValue(0);

  const openGallery = useCallback(() => {
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

  // Track previous URIs to prevent the jiggle effect from killing the opening animation
  const prevUris = useRef({ captured: latestCapturedUri, preview: latestPreviewUri });

  // Fix Reanimated JS proxy desync when processing finishes and triggers a re-render
  useEffect(() => {
    const capturedChanged = prevUris.current.captured !== latestCapturedUri;
    const previewChanged = prevUris.current.preview !== latestPreviewUri;
    prevUris.current = { captured: latestCapturedUri, preview: latestPreviewUri };

    if ((capturedChanged || previewChanged) && isOpen) {
      // Modify the value on the JS thread to ensure Reanimated's JS proxy
      // correctly re-binds and notifies all child components (like GalleryViewer)
      // after the re-render caused by latestCapturedUri updating.
      galleryTransition.value = 0.99;
      requestAnimationFrame(() => {
        galleryTransition.value = 1;
      });
    }
  }, [latestCapturedUri, latestPreviewUri, isOpen, galleryTransition]);

  return {
    shouldRenderGallery: isOpen,
    galleryTransition,
    openGallery,
    closeGallery,
  };
};
