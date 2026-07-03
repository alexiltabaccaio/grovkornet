import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState } from 'react-native';
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
  const isTeleporting = useSharedValue(false);
  const teleportMockIndex = useSharedValue(-1);
  const teleportRealIndex = useSharedValue(-1);
  const [pendingTeleport, setPendingTeleport] = useState<{ mockIdx: number, idx: number, timestamp: number } | null>(null);

  const [renderIndices, setRenderIndices] = useState<number[]>([
    initialIndex - 1,
    initialIndex,
    initialIndex + 1,
  ]);

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
    isTeleporting.value = false;
    setPendingTeleport(null);
    setRenderIndices([targetIndex - 1, targetIndex, targetIndex + 1]);
  }, [currentIndex, isTeleporting]);

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
    if (idx === -1 || idx === (animatingToIndexRef.current ?? currentIndex.value)) return;

    if (resetZoomSignal) {
      resetZoomSignal.value += 1;
    }

    if (isTransitioning.value && isTeleporting.value) {
      cancelAnimation(translateX);
      if (animatingToIndexRef.current !== null) {
        translateX.value = -animatingToIndexRef.current * slotWidth;
        currentIndex.value = animatingToIndexRef.current;
      }
      isTeleporting.value = false;
      setTimeout(() => {
        setPendingTeleport(null);
      }, 0);
    }

    const baseIndex = animatingToIndexRef.current !== null
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

      isTeleporting.value = true;
      teleportMockIndex.value = mockAdjacentIndex;
      teleportRealIndex.value = idx;

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

      setPendingTeleport({ mockIdx: mockAdjacentIndex, idx, timestamp: Date.now() });
    }
  }, [
    selectedPhoto,
    photos,
    slotWidth,
    currentIndex,
    translateX,
    finalizeTransition,
    finalizeTeleport,
    isTransitioning,
    isTeleporting,
    resetZoomSignal,
    teleportMockIndex,
    teleportRealIndex
  ]);

  useEffect(() => {
    if (!pendingTeleport) return;
    const { mockIdx, idx } = pendingTeleport;

    const rafId = requestAnimationFrame(() => {
      if (!isTeleporting.value || teleportRealIndex.value !== idx) return;

      const targetVal = -mockIdx * slotWidth;
      isTransitioning.value = true;

      translateX.value = withSpring(targetVal, { damping: 20, stiffness: 150, mass: 0.6, overshootClamping: true }, (finished) => {
        if (finished) {
          teleportMockIndex.value = -2; // Lock screen state to prevent Reanimated tearing

          isTeleporting.value = false;
          translateX.value = -idx * slotWidth;

          teleportMockIndex.value = -1; // Unlock state

          runOnJS(finalizeTeleport)(idx);
          isTransitioning.value = false;
        }
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [
    pendingTeleport,
    isTeleporting,
    teleportRealIndex,
    teleportMockIndex,
    slotWidth,
    translateX,
    finalizeTeleport,
    isTransitioning
  ]);

  useEffect(() => {
    let rafId1: number;
    let rafId2: number;
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // Lock the screen state to prevent Reanimated tearing / flashing wrong indices
        // on resume by locking rendering to just the current active slot.
        teleportMockIndex.value = -2;
        teleportRealIndex.value = currentIndex.value;

        rafId1 = requestAnimationFrame(() => {
          rafId2 = requestAnimationFrame(() => {
            teleportMockIndex.value = -1;
          });
        });
      }
    });

    return () => {
      subscription.remove();
      if (rafId1) cancelAnimationFrame(rafId1);
      if (rafId2) cancelAnimationFrame(rafId2);
    };
  }, [currentIndex, teleportMockIndex, teleportRealIndex]);

  return {
    currentIndex,
    renderIndices,
    translateX,
    dragOffset,
    prepareTransition,
    finalizeTransition,
    isTransitioning,
    isTeleporting,
    teleportMockIndex,
    teleportRealIndex,
    finalizeTeleport,
  };
};
