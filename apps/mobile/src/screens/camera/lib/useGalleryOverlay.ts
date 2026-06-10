import { useCallback, useEffect, useRef, useState } from 'react';
import { useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { useSystemStore } from '@entities/system';
import { useShallow } from 'zustand/shallow';

export const useGalleryOverlay = () => {
  const { latestCapturedUri, latestPreviewUri } = useSystemStore(useShallow(state => ({
    latestCapturedUri: state.latestCapturedUri,
    latestPreviewUri: state.latestPreviewUri,
  })));

  const [shouldRenderGallery, setShouldRenderGallery] = useState(false);
  const galleryTransition = useSharedValue(0);

  const openGallery = useCallback(() => {
    setShouldRenderGallery(true);
    galleryTransition.value = withTiming(1, { duration: 300 });
  }, [galleryTransition]);

  const closeGallery = useCallback(() => {
    if (galleryTransition.value <= 0) {
      setShouldRenderGallery(false);
      return;
    }
    galleryTransition.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(setShouldRenderGallery)(false);
      }
    });
  }, [galleryTransition]);

  // Track previous URIs to prevent the jiggle effect from killing the opening animation
  const prevUris = useRef({ captured: latestCapturedUri, preview: latestPreviewUri });

  // Fix Reanimated JS proxy desync when processing finishes and triggers a re-render
  useEffect(() => {
    const capturedChanged = prevUris.current.captured !== latestCapturedUri;
    const previewChanged = prevUris.current.preview !== latestPreviewUri;
    prevUris.current = { captured: latestCapturedUri, preview: latestPreviewUri };

    if ((capturedChanged || previewChanged) && shouldRenderGallery) {
      // Modify the value on the JS thread to ensure Reanimated's JS proxy
      // correctly re-binds and notifies all child components (like GalleryViewer)
      // after the re-render caused by latestCapturedUri updating.
      galleryTransition.value = 0.99;
      requestAnimationFrame(() => {
        galleryTransition.value = 1;
      });
    }
  }, [latestCapturedUri, latestPreviewUri, shouldRenderGallery, galleryTransition]);

  return {
    shouldRenderGallery,
    galleryTransition,
    openGallery,
    closeGallery,
  };
};
