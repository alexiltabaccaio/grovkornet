import { useEffect, useRef } from 'react';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { pauseStream, resumeStream } from '@grovkornet/engine';
import { useBodyStore } from '@entities/body';

const nudgeZoom = () => {
  const { zoom, setZoom } = useBodyStore.getState();
  setZoom(zoom.value + 0.000001);
};

export const useGalleryStreamSync = (
  isOpen: boolean,
  galleryTransition: { value: number },
  cameraKey: number
) => {
  const prevIsOpenRef = useRef(isOpen);

  // Sync native stream state (e.g. on camera remount when returning from background)
  useEffect(() => {
    if (isOpen) {
      // If the gallery is already open and stable (e.g. after remounting from background),
      // pause immediately to save resources.
      if (galleryTransition.value === 1) {
        void pauseStream();
      }
    } else {
      // Restore stream when the gallery closes.
      void resumeStream();
      if (prevIsOpenRef.current) {
        nudgeZoom();
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [cameraKey, isOpen, galleryTransition]);

  // Use reanimated reaction to pause stream when overlay animation finishes,
  // and resume immediately when it starts closing.
  useAnimatedReaction(
    () => galleryTransition.value,
    (currentValue, previousValue) => {
      // We want to trigger when the transition finishes opening (value reaches 1)
      if (currentValue === 1 && previousValue !== 1) {
        runOnJS(pauseStream)();
      }
      // When it starts closing (value falls below 1 from 1)
      if (currentValue < 1 && previousValue === 1) {
        runOnJS(resumeStream)();
        runOnJS(nudgeZoom)();
      }
    },
    [galleryTransition]
  );
};
