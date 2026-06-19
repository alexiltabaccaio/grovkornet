import { useEffect } from 'react';
import { useSharedValue, SharedValue } from 'react-native-reanimated';
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
  zoomScaleRef?: SharedValue<number>;
  zoomTranslateXRef?: SharedValue<number>;
  zoomTranslateYRef?: SharedValue<number>;
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
  selectedPhoto,
  prepareTransition,
  finalizeTransition,
  isTransitioning,
  zoomScaleRef,
  zoomTranslateXRef,
  zoomTranslateYRef,
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

  useEffect(() => {
    zoomScale.value = 1;
    zoomTranslateX.value = 0;
    zoomTranslateY.value = 0;
    savedZoomScale.value = 1;
    savedZoomTranslateX.value = 0;
    savedZoomTranslateY.value = 0;
    isZoomed.value = false;
  }, [selectedPhoto, zoomScale, zoomTranslateX, zoomTranslateY, savedZoomScale, savedZoomTranslateX, savedZoomTranslateY, isZoomed]);

  const panGesture = usePanGesture({
    width,
    height,
    photosLength,
    slotWidth,
    translateX,
    dragOffset,
    rotationY,
    zoomScale,
    zoomTranslateX,
    zoomTranslateY,
    savedZoomTranslateX,
    savedZoomTranslateY,
    isZoomed,
    panStartTranslationX,
    panMode,
    isDecaying,
    recentlyStoppedDecay,
    prepareTransition,
    finalizeTransition,
    isTransitioning,
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
