import { Gesture } from 'react-native-gesture-handler';
import { cancelAnimation, withTiming, withDecay, runOnJS, SharedValue } from 'react-native-reanimated';

interface UsePanGestureProps {
  width: number;
  height: number;
  photosLength: number;
  slotWidth: number;
  translateX: SharedValue<number>;
  dragOffset: SharedValue<number>;
  rotationY?: SharedValue<number>;
  zoomScale: SharedValue<number>;
  zoomTranslateX: SharedValue<number>;
  zoomTranslateY: SharedValue<number>;
  savedZoomTranslateX: SharedValue<number>;
  savedZoomTranslateY: SharedValue<number>;
  isZoomed: SharedValue<boolean>;
  panStartTranslationX: SharedValue<number>;
  panMode: SharedValue<'swipe' | 'pan'>;
  isDecaying: SharedValue<number>;
  recentlyStoppedDecay: SharedValue<number>;
  prepareTransition: (newIndex: number, isManualSwipe?: boolean) => void;
  finalizeTransition: (newIndex: number, isManualSwipe: boolean) => void;
  isTransitioning: SharedValue<boolean>;
}

export const usePanGesture = ({
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
}: UsePanGestureProps) => {
  return Gesture.Pan()
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
      }
    })
    .onStart((event) => {
      'worklet';
      if (isZoomed.value) {
        panMode.value = 'pan';
        savedZoomTranslateX.value = zoomTranslateX.value;
        savedZoomTranslateY.value = zoomTranslateY.value;
      } else {
        cancelAnimation(translateX);
        panMode.value = 'swipe';
        dragOffset.value = translateX.value;
        panStartTranslationX.value = event?.translationX ?? 0;
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
        const activeTranslationX = event.translationX - panStartTranslationX.value;
        const proposedVal = dragOffset.value + activeTranslationX;
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
        
        const startVirtualIndex = Math.round(-dragOffset.value / slotWidth);
        const startIdx = Math.max(0, Math.min(photosLength - 1, startVirtualIndex));
        
        const currentBaseX = -startIdx * slotWidth;
        const shiftX = translateX.value - currentBaseX;
        const velocity = event.velocityX;

        let targetIndex = startIdx;

        if (shiftX > dragThreshold || velocity > velocityThreshold) {
          if (startIdx > 0) targetIndex = startIdx - 1;
        } else if (shiftX < -dragThreshold || velocity < -velocityThreshold) {
          if (startIdx < photosLength - 1) targetIndex = startIdx + 1;
        }

        const targetTranslateX = -targetIndex * slotWidth;

        runOnJS(prepareTransition)(targetIndex, true);

        if (Math.abs(translateX.value - targetTranslateX) > 0.1) {
          isTransitioning.value = true;
          translateX.value = withTiming(
            targetTranslateX,
            { duration: 150 },
            (finished) => {
              if (finished) {
                isTransitioning.value = false;
                runOnJS(finalizeTransition)(targetIndex, true);
              }
            }
          );
        } else {
          isTransitioning.value = false;
          runOnJS(finalizeTransition)(targetIndex, true);
        }
      }
    });
};
