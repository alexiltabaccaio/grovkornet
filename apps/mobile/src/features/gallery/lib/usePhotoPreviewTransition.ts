import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import * as Haptics from '@shared/lib/haptics';
import { GalleryItem } from './types';

interface UsePhotoPreviewTransitionProps {
  selectedPhoto: GalleryItem | null;
  photos: GalleryItem[];
  onPhotoVisible?: (photo: GalleryItem) => void;
  slotWidth: number;
}

export const usePhotoPreviewTransition = ({
  selectedPhoto,
  photos,
  onPhotoVisible,
  slotWidth,
}: UsePhotoPreviewTransitionProps) => {
  const initialIndex = photos.length > 0
    ? Math.max(0, photos.findIndex(p => p.uri === selectedPhoto?.uri))
    : 0;

  const currentIndex = useSharedValue(initialIndex);
  const pendingTeleportRef = useRef<number | null>(null);
  const animatingToIndexRef = useRef<number | null>(null);

  const [renderIndices, setRenderIndices] = useState<number[]>([
    initialIndex - 1,
    initialIndex,
    initialIndex + 1,
  ]);

  const [slotOverrides, setSlotOverrides] = useState<Record<number, GalleryItem>>({});

  const translateX = useSharedValue(-initialIndex * slotWidth);
  const dragOffset = useSharedValue(0);

  useLayoutEffect(() => {
    if (pendingTeleportRef.current !== null) {
      const targetIndex = pendingTeleportRef.current;
      pendingTeleportRef.current = null;
      translateX.value = -targetIndex * slotWidth;
    }
  });

  const finalizeTransition = (newIndex: number, isManualSwipe: boolean) => {
    currentIndex.value = newIndex;
    animatingToIndexRef.current = null;
    setRenderIndices([newIndex - 1, newIndex, newIndex + 1]);

    if (isManualSwipe && photos[newIndex]) {
      void Haptics.selectionAsync();
      if (onPhotoVisible) {
        onPhotoVisible(photos[newIndex]);
      }
    }
  };

  const finalizeTeleport = (targetIndex: number) => {
    currentIndex.value = targetIndex;
    animatingToIndexRef.current = null;
    pendingTeleportRef.current = targetIndex;
    setSlotOverrides({});
    setRenderIndices([targetIndex - 1, targetIndex, targetIndex + 1]);
  };

  useEffect(() => {
    if (!selectedPhoto || photos.length === 0) return;
    const idx = photos.findIndex(p => p.uri === selectedPhoto.uri);
    if (idx === -1 || idx === currentIndex.value || idx === animatingToIndexRef.current) return;

    const diff = idx - currentIndex.value;
    animatingToIndexRef.current = idx;

    if (Math.abs(diff) === 1) {
      const targetVal = -idx * slotWidth;
      translateX.value = withTiming(targetVal, { duration: 250 }, (finished) => {
        if (finished) runOnJS(finalizeTransition)(idx, false);
      });
    } else {
      const mockAdjacentIndex = diff > 0 ? currentIndex.value + 1 : currentIndex.value - 1;
      
      /* eslint-disable react-hooks/set-state-in-effect */
      setSlotOverrides({ [mockAdjacentIndex]: photos[idx] });
      setRenderIndices([currentIndex.value - 1, currentIndex.value, currentIndex.value + 1, mockAdjacentIndex]);
      /* eslint-enable react-hooks/set-state-in-effect */

      const targetVal = -mockAdjacentIndex * slotWidth;
      translateX.value = withTiming(targetVal, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(finalizeTeleport)(idx);
        }
      });
    }
  }, [selectedPhoto, photos, slotWidth]);

  return {
    currentIndex,
    renderIndices,
    slotOverrides,
    translateX,
    dragOffset,
    finalizeTransition,
  };
};
