import { useEffect } from 'react';
import {
  useSharedValue,
  cancelAnimation,
  withTiming,
  withDecay,
  withSpring,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { GalleryItem } from './types';

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
  finalizeTransition: (newIndex: number, isManualSwipe: boolean) => void;
}

export const usePhotoPreviewGestures = ({
  width,
  height,
  photosLength,
  slotWidth,
  translateX,
  dragOffset,
  currentIndex,
  rotationY,
  selectedPhoto,
  finalizeTransition,
}: UsePhotoPreviewGesturesProps) => {
  const zoomScale = useSharedValue(1);
  const zoomTranslateX = useSharedValue(0);
  const zoomTranslateY = useSharedValue(0);

  const savedZoomScale = useSharedValue(1);
  const savedZoomTranslateX = useSharedValue(0);
  const savedZoomTranslateY = useSharedValue(0);
  const isZoomed = useSharedValue(false);
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
  }, [selectedPhoto]);

  const panGesture = Gesture.Pan()
    .maxPointers(1)
    .onBegin(() => {
      'worklet';
      if (isZoomed.value) {
        if (isDecaying.value === 1) {
          recentlyStoppedDecay.value = 1;
          recentlyStoppedDecay.value = withTiming(0, { duration: 500 });
        }
        cancelAnimation(zoomTranslateX);
        cancelAnimation(zoomTranslateY);
        isDecaying.value = 0;
      } else {
        cancelAnimation(translateX);
      }
    })
    .onStart(() => {
      'worklet';
      if (isZoomed.value) {
        panMode.value = 'pan';
        savedZoomTranslateX.value = zoomTranslateX.value;
        savedZoomTranslateY.value = zoomTranslateY.value;
      } else {
        panMode.value = 'swipe';
        dragOffset.value = translateX.value;
      }
    })
    .onUpdate((event) => {
      'worklet';
      if (panMode.value === 'pan') {
        const angle = rotationY ? rotationY.value : 0;
        const rad = (angle * Math.PI) / 180;
        const sinSq = Math.sin(rad) * Math.sin(rad);
        const cosSq = Math.cos(rad) * Math.cos(rad);
        const currentWidth = width * cosSq + height * sinSq;
        const currentHeight = height * cosSq + width * sinSq;

        const maxTx = (currentWidth * (zoomScale.value - 1)) / 2;
        const minTx = -maxTx;
        const maxTy = (currentHeight * (zoomScale.value - 1)) / 2;
        const minTy = -maxTy;

        zoomTranslateX.value = Math.max(minTx, Math.min(maxTx, savedZoomTranslateX.value + event.translationX));
        zoomTranslateY.value = Math.max(minTy, Math.min(maxTy, savedZoomTranslateY.value + event.translationY));
      } else {
        const proposedVal = dragOffset.value + event.translationX;
        const maxTranslateX = 0;
        const minTranslateX = -(photosLength - 1) * slotWidth;
        translateX.value = Math.max(minTranslateX, Math.min(maxTranslateX, proposedVal));
      }
    })
    .onEnd((event) => {
      'worklet';
      if (panMode.value === 'pan') {
        const angle = rotationY ? rotationY.value : 0;
        const rad = (angle * Math.PI) / 180;
        const sinSq = Math.sin(rad) * Math.sin(rad);
        const cosSq = Math.cos(rad) * Math.cos(rad);
        const currentWidth = width * cosSq + height * sinSq;
        const currentHeight = height * cosSq + width * sinSq;

        const maxTx = (currentWidth * (zoomScale.value - 1)) / 2;
        const minTx = -maxTx;
        const maxTy = (currentHeight * (zoomScale.value - 1)) / 2;
        const minTy = -maxTy;

        isDecaying.value = 1;
        zoomTranslateX.value = withDecay({
          velocity: event.velocityX,
          clamp: [minTx, maxTx],
        }, (finished) => {
          if (finished) isDecaying.value = 0;
        });
        zoomTranslateY.value = withDecay({
          velocity: event.velocityY,
          clamp: [minTy, maxTy],
        }, (finished) => {
          if (finished) isDecaying.value = 0;
        });
      } else {
        const dragThreshold = width / 2;
        const velocityThreshold = 500;
        const idx = currentIndex.value;
        const currentBaseX = -idx * slotWidth;
        const shiftX = translateX.value - currentBaseX;
        const velocity = event.velocityX;

        let targetIndex = idx;

        if (shiftX > dragThreshold || velocity > velocityThreshold) {
          if (idx > 0) targetIndex = idx - 1;
        } else if (shiftX < -dragThreshold || velocity < -velocityThreshold) {
          if (idx < photosLength - 1) targetIndex = idx + 1;
        }

        const targetTranslateX = -targetIndex * slotWidth;

        if (targetIndex !== idx) {
          translateX.value = withSpring(
            targetTranslateX,
            {
              velocity: velocity,
              overshootClamping: true,
            },
            (finished) => {
              if (finished) runOnJS(finalizeTransition)(targetIndex, true);
            }
          );
        } else {
          translateX.value = withSpring(targetTranslateX, {
            velocity: velocity,
            overshootClamping: true,
          });
        }
      }
    });

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      'worklet';
      cancelAnimation(zoomScale);
      cancelAnimation(zoomTranslateX);
      cancelAnimation(zoomTranslateY);
      isDecaying.value = 0;
    })
    .onStart(() => {
      'worklet';
      savedZoomScale.value = zoomScale.value;
      savedZoomTranslateX.value = zoomTranslateX.value;
      savedZoomTranslateY.value = zoomTranslateY.value;
    })
    .onUpdate((event) => {
      'worklet';
      let nextScale = savedZoomScale.value * event.scale;
      if (nextScale < 1) {
        nextScale = 1;
      } else if (nextScale > 4) {
        nextScale = 4;
      }
      zoomScale.value = nextScale;

      if (nextScale > 1.05) {
        isZoomed.value = true;
      }

      if (nextScale === 1) {
        zoomTranslateX.value = 0;
        zoomTranslateY.value = 0;
      } else {
        const angle = rotationY ? rotationY.value : 0;
        const rad = (angle * Math.PI) / 180;
        const sinSq = Math.sin(rad) * Math.sin(rad);
        const cosSq = Math.cos(rad) * Math.cos(rad);
        const currentWidth = width * cosSq + height * sinSq;
        const currentHeight = height * cosSq + width * sinSq;

        const maxTx = (currentWidth * (nextScale - 1)) / 2;
        const minTx = -maxTx;
        const maxTy = (currentHeight * (nextScale - 1)) / 2;
        const minTy = -maxTy;

        zoomTranslateX.value = Math.max(minTx, Math.min(maxTx, savedZoomTranslateX.value));
        zoomTranslateY.value = Math.max(minTy, Math.min(maxTy, savedZoomTranslateY.value));
      }
    })
    .onEnd(() => {
      'worklet';
      if (zoomScale.value < 1.1) {
        isZoomed.value = false;
        zoomScale.value = withTiming(1);
        zoomTranslateX.value = withTiming(0);
        zoomTranslateY.value = withTiming(0);
      } else {
        isZoomed.value = true;
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(200)
    .maxDuration(250)
    .onEnd((event) => {
      'worklet';
      if (isZoomed.value) {
        if (recentlyStoppedDecay.value > 0) {
          recentlyStoppedDecay.value = 0;
          return;
        }
        isZoomed.value = false;
        zoomScale.value = withTiming(1);
        zoomTranslateX.value = withTiming(0);
        zoomTranslateY.value = withTiming(0);
      } else {
        isZoomed.value = true;
        zoomScale.value = withTiming(2.5);

        const angle = rotationY ? rotationY.value : 0;
        const rad = (angle * Math.PI) / 180;
        const sinSq = Math.sin(rad) * Math.sin(rad);
        const cosSq = Math.cos(rad) * Math.cos(rad);
        const currentWidth = width * cosSq + height * sinSq;
        const currentHeight = height * cosSq + width * sinSq;

        const centerX = width / 2;
        const centerY = height / 2;
        const targetX = (centerX - event.x) * 1.5;
        const targetY = (centerY - event.y) * 1.5;

        const maxTx = (currentWidth * 1.5) / 2;
        const minTx = -maxTx;
        const maxTy = (currentHeight * 1.5) / 2;
        const minTy = -maxTy;

        zoomTranslateX.value = withTiming(Math.max(minTx, Math.min(maxTx, targetX)));
        zoomTranslateY.value = withTiming(Math.max(minTy, Math.min(maxTy, targetY)));
      }
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
