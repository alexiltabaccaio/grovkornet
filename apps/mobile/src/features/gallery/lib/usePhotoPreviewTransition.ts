import { useEffect, useRef, useState, useCallback } from 'react';
import { useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
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
  const initialIndexRef = useRef<number | null>(null);
  if (initialIndexRef.current === null) {
    initialIndexRef.current = photos.length > 0 && selectedPhoto
      ? Math.max(0, photos.findIndex(p => p.uri === selectedPhoto.uri))
      : 0;
  }
  const initialIndex = initialIndexRef.current;

  const currentIndex = useSharedValue(initialIndex);
  const isTransitioning = useSharedValue(false);
  const animatingToIndexRef = useRef<number | null>(null);
  const expectedEchoesRef = useRef<string[]>([]);

  const [renderIndices, setRenderIndices] = useState<number[]>([
    initialIndex - 1,
    initialIndex,
    initialIndex + 1,
  ]);

  const [slotOverrides, setSlotOverrides] = useState<Record<number, GalleryItem>>({});

  const translateX = useSharedValue(-initialIndex * slotWidth);
  const dragOffset = useSharedValue(0);

  const finalizeTransition = useCallback((newIndex: number, isManualSwipe: boolean) => {
    currentIndex.value = newIndex;
    animatingToIndexRef.current = null;
    setRenderIndices([newIndex - 1, newIndex, newIndex + 1]);
  }, [currentIndex]);

  const prepareTransition = useCallback((targetIndex: number, isManualSwipe?: boolean) => {
    if (isManualSwipe) {
      animatingToIndexRef.current = targetIndex;
    }
    setRenderIndices((prev) => {
      const newIndices = new Set([...prev, targetIndex - 1, targetIndex, targetIndex + 1]);
      return Array.from(newIndices);
    });
    
    if (isManualSwipe && onPhotoVisible && photos[targetIndex] && targetIndex !== currentIndex.value) {
      const uri = photos[targetIndex].uri;
      expectedEchoesRef.current.push(uri);
      if (expectedEchoesRef.current.length > 10) {
        expectedEchoesRef.current.shift();
      }
      onPhotoVisible(photos[targetIndex]);
    }
  }, [onPhotoVisible, photos, currentIndex]);

  const finalizeTeleport = useCallback((targetIndex: number) => {
    currentIndex.value = targetIndex;
    animatingToIndexRef.current = null;
    setSlotOverrides({});
    setRenderIndices([targetIndex - 1, targetIndex, targetIndex + 1]);
  }, [currentIndex]);

  useEffect(() => {
    if (!selectedPhoto || photos.length === 0) return;

    const uri = selectedPhoto.uri;
    const expectedIndex = expectedEchoesRef.current.indexOf(uri);
    if (expectedIndex !== -1) {
      // Ignore this update as it is an echo of our manual swipes
      expectedEchoesRef.current.splice(0, expectedIndex + 1);
      return;
    }

    const idx = photos.findIndex(p => p.uri === uri);
    if (idx === -1 || idx === currentIndex.value || idx === animatingToIndexRef.current) return;

    const diff = idx - currentIndex.value;
    animatingToIndexRef.current = idx;

    if (Math.abs(diff) === 1) {
      const targetVal = -idx * slotWidth;
      isTransitioning.value = true;
      translateX.value = withTiming(targetVal, { duration: 150 }, (finished) => {
        if (finished) {
          isTransitioning.value = false;
          runOnJS(finalizeTransition)(idx, false);
        }
      });
    } else {
      const mockAdjacentIndex = diff > 0 ? currentIndex.value + 1 : currentIndex.value - 1;
      
      /* eslint-disable react-hooks/set-state-in-effect */
      setSlotOverrides({ [mockAdjacentIndex]: photos[idx] });
      setRenderIndices(Array.from(new Set([
        currentIndex.value - 1, 
        currentIndex.value, 
        currentIndex.value + 1, 
        mockAdjacentIndex,
        idx - 1,
        idx,
        idx + 1
      ])));
      /* eslint-enable react-hooks/set-state-in-effect */

      const targetVal = -mockAdjacentIndex * slotWidth;
      isTransitioning.value = true;
      translateX.value = withTiming(targetVal, { duration: 150 }, (finished) => {
        if (finished) {
          translateX.value = -idx * slotWidth;
          runOnJS(finalizeTeleport)(idx);
          isTransitioning.value = false;
        }
      });
    }
  }, [selectedPhoto, photos, slotWidth, currentIndex, translateX, finalizeTransition, finalizeTeleport]);

  return {
    currentIndex,
    renderIndices,
    slotOverrides,
    translateX,
    dragOffset,
    prepareTransition,
    finalizeTransition,
    isTransitioning,
  };
};
