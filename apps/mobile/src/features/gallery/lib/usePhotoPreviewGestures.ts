import { useSharedValue, SharedValue, useAnimatedReaction } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { GalleryItem } from './types';
import { usePanGesture } from './usePanGesture';
import { usePinchGesture } from './usePinchGesture';
import { useDoubleTapGesture } from './useDoubleTapGesture';

interface UsePhotoPreviewGesturesProps {
  width: number;
  height: number;
  photosLength: number;
  slotWidth: number;
  translateX: SharedValue<number>;
  dragOffset: SharedValue<number>;
  currentIndex: SharedValue<number>;
  rotationY?: SharedValue<number>;
  selectedPhoto: GalleryItem | null;
  prepareTransition: (newIndex: number, isManualSwipe?: boolean) => void;
  finalizeTransition: (newIndex: number, isManualSwipe: boolean) => void;
  isTransitioning: SharedValue<boolean>;
  isTeleporting: SharedValue<boolean>;
  teleportMockIndex: SharedValue<number>;
  teleportRealIndex: SharedValue<number>;
  finalizeTeleport: (targetIndex: number) => void;
  zoomScaleRef?: SharedValue<number>;
  zoomTranslateXRef?: SharedValue<number>;
  zoomTranslateYRef?: SharedValue<number>;
  resetZoomSignal?: SharedValue<number>;
}

export const usePhotoPreviewGestures = ({
  width,
  height,
  photosLength,
  slotWidth,
  translateX,
  dragOffset,
  currentIndex: _currentIndex,
  rotationY,
  selectedPhoto: _selectedPhoto,
  prepareTransition,
  finalizeTransition,
  isTransitioning,
  isTeleporting,
  teleportMockIndex,
  teleportRealIndex,
  finalizeTeleport,
  zoomScaleRef,
  zoomTranslateXRef,
  zoomTranslateYRef,
  resetZoomSignal,
}: UsePhotoPreviewGesturesProps) => {
  const localZoomScale = useSharedValue(1);
  const localZoomTranslateX = useSharedValue(0);
  const localZoomTranslateY = useSharedValue(0);

  const zoomScale = zoomScaleRef || localZoomScale;
  const zoomTranslateX = zoomTranslateXRef || localZoomTranslateX;
  const zoomTranslateY = zoomTranslateYRef || localZoomTranslateY;

  const savedZoomScale = useSharedValue(1);
  const savedZoomTranslateX = useSharedValue(0);
  const savedZoomTranslateY = useSharedValue(0);
  const isZoomed = useSharedValue(false);
  const panStartTranslationX = useSharedValue(0);
  const panMode = useSharedValue<'swipe' | 'pan'>('swipe');
  const isDecaying = useSharedValue(0);
  const recentlyStoppedDecay = useSharedValue(0);

  useAnimatedReaction(
    () => resetZoomSignal?.value,
    (nextVal, prevVal) => {
      if (nextVal !== prevVal && nextVal !== undefined) {
        zoomScale.value = 1;
        zoomTranslateX.value = 0;
        zoomTranslateY.value = 0;
        savedZoomScale.value = 1;
        savedZoomTranslateX.value = 0;
        savedZoomTranslateY.value = 0;
        isZoomed.value = false;
      }
    }
  );

  const panGesture = usePanGesture({
    dimensions: { width, height, photosLength, slotWidth },
    zoomState: { zoomScale, zoomTranslateX, zoomTranslateY, savedZoomTranslateX, savedZoomTranslateY, isZoomed },
    swipeState: { translateX, dragOffset, panStartTranslationX, panMode, isTransitioning },
    teleportState: { isTeleporting, teleportMockIndex, teleportRealIndex },
    decayState: { isDecaying, recentlyStoppedDecay },
    callbacks: { prepareTransition, finalizeTransition, finalizeTeleport },
    rotationY,
  });

  const pinchGesture = usePinchGesture({
    width,
    height,
    rotationY,
    zoomScale,
    zoomTranslateX,
    zoomTranslateY,
    savedZoomScale,
    savedZoomTranslateX,
    savedZoomTranslateY,
    isZoomed,
    isDecaying,
  });

  const doubleTapGesture = useDoubleTapGesture({
    width,
    height,
    rotationY,
    zoomScale,
    zoomTranslateX,
    zoomTranslateY,
    isZoomed,
    isTransitioning,
    recentlyStoppedDecay,
  });

  const composedGesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    doubleTapGesture
  );

  return {
    zoomScale,
    zoomTranslateX,
    zoomTranslateY,
    isZoomed,
    composedGesture,
  };
};
