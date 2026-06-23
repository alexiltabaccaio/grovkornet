import { useEffect, useRef, useState, useCallback } from 'react';
import { useSharedValue, runOnJS, withSpring, cancelAnimation, SharedValue } from 'react-native-reanimated';
import { GalleryItem } from './types';

interface UsePhotoPreviewTransitionProps {
  selectedPhoto: GalleryItem | null;
  photos: GalleryItem[];
  onPhotoVisible?: (photo: GalleryItem) => void;
  slotWidth: number;
  resetZoomSignal?: SharedValue<number>;
}

export const usePhotoPreviewTransition = ({
  selectedPhoto,
  photos,
  onPhotoVisible,
  slotWidth,
  resetZoomSignal,
}: UsePhotoPreviewTransitionProps) => {
  const [initialIndex] = useState(() => {
    return photos.length > 0 && selectedPhoto
      ? Math.max(0, photos.findIndex(p => p.uri === selectedPhoto.uri))
      : 0;
  });

  const currentIndex = useSharedValue(initialIndex);
  const isTransitioning = useSharedValue(false);
  const animatingToIndexRef = useRef<number | null>(null);
  const expectedEchoesRef = useRef<string[]>([]);
  const isTeleportingRef = useRef(false);

  const [renderIndices, setRenderIndices] = useState<number[]>([
    initialIndex - 1,
    initialIndex,
    initialIndex + 1,
  ]);

  const [slotOverrides, setSlotOverrides] = useState<Record<number, GalleryItem>>({});

  const translateX = useSharedValue(-initialIndex * slotWidth);
  const dragOffset = useSharedValue(0);

  const finalizeTransition = useCallback((newIndex: number, _isManualSwipe: boolean) => {
    currentIndex.value = newIndex;
    animatingToIndexRef.current = null;
    setRenderIndices([newIndex - 1, newIndex, newIndex + 1]);
  }, [currentIndex]);

  const prepareTransition = useCallback((targetIndex: number, isManualSwipe?: boolean) => {
    const currentTarget = animatingToIndexRef.current !== null ? animatingToIndexRef.current : currentIndex.value;

    if (isManualSwipe) {
      animatingToIndexRef.current = targetIndex;
    }
    setRenderIndices((prev) => {
      const newIndices = new Set([...prev, targetIndex - 1, targetIndex, targetIndex + 1]);
      return Array.from(newIndices);
    });
    
    if (isManualSwipe && onPhotoVisible && photos[targetIndex] && targetIndex !== currentTarget) {
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
    isTeleportingRef.current = false;
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

    if (resetZoomSignal) {
      resetZoomSignal.value += 1;
    }

    const idx = photos.findIndex(p => p.uri === uri);
    if (idx === -1 || idx === (animatingToIndexRef.current ?? currentIndex.value)) return;

    const isTeleporting = isTeleportingRef.current;

    if (isTransitioning.value && isTeleporting) {
      cancelAnimation(translateX);
      if (animatingToIndexRef.current !== null) {
        translateX.value = -animatingToIndexRef.current * slotWidth;
        currentIndex.value = animatingToIndexRef.current;
      }
      isTeleportingRef.current = false;
      setSlotOverrides({});
    }

    const baseIndex = (isTransitioning.value && animatingToIndexRef.current !== null && !isTeleporting)
      ? animatingToIndexRef.current
      : currentIndex.value;

    const diff = idx - baseIndex;
    animatingToIndexRef.current = idx;

    if (Math.abs(diff) === 1) {
      const targetVal = -idx * slotWidth;
      isTransitioning.value = true;
      
      setRenderIndices(prev => Array.from(new Set([...prev, idx - 1, idx, idx + 1])));

      translateX.value = withSpring(targetVal, { damping: 20, stiffness: 150, mass: 0.6, overshootClamping: true }, (finished) => {
        if (finished) {
          isTransitioning.value = false;
          runOnJS(finalizeTransition)(idx, false);
        }
      });
    } else {
      const mockAdjacentIndex = diff > 0 ? baseIndex + 1 : baseIndex - 1;
      
       
      isTeleportingRef.current = true;
      setSlotOverrides({ [mockAdjacentIndex]: photos[idx] });
      setRenderIndices(prev => Array.from(new Set([
        ...prev,
        baseIndex - 1, 
        baseIndex, 
        baseIndex + 1, 
        mockAdjacentIndex,
        idx - 1,
        idx,
        idx + 1
      ])));
       

      const targetVal = -mockAdjacentIndex * slotWidth;
      isTransitioning.value = true;
      
      translateX.value = withSpring(targetVal, { damping: 20, stiffness: 150, mass: 0.6, overshootClamping: true }, (finished) => {
        if (finished) {
          translateX.value = -idx * slotWidth;
          runOnJS(finalizeTeleport)(idx);
          isTransitioning.value = false;
        }
      });
    }
  }, [selectedPhoto, photos, slotWidth, currentIndex, translateX, finalizeTransition, finalizeTeleport, isTransitioning]);

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
