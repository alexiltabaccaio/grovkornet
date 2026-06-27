import { Gesture } from 'react-native-gesture-handler';
import { cancelAnimation, withTiming, withDecay, runOnJS, SharedValue, useSharedValue, withSpring } from 'react-native-reanimated';

const SWIPE_VELOCITY_THRESHOLD = 300;
const DECAY_DURATION_MS = 500;
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 150,
  mass: 0.6,
  overshootClamping: true,
};

const calculatePanBounds = (
  width: number,
  height: number,
  zoomScale: number,
  rotationY: number
) => {
  'worklet';
  const rad = (rotationY * Math.PI) / 180;
  const sinSq = Math.sin(rad) * Math.sin(rad);
  const cosSq = Math.cos(rad) * Math.cos(rad);
  const currentWidth = width * cosSq + height * sinSq;
  const currentHeight = height * cosSq + width * sinSq;

  const maxTx = (currentWidth * (zoomScale - 1)) / 2;
  const minTx = -maxTx;
  const maxTy = (currentHeight * (zoomScale - 1)) / 2;
  const minTy = -maxTy;

  return { minTx, maxTx, minTy, maxTy };
};

export interface UsePanGestureProps {
  dimensions: {
    width: number;
    height: number;
    photosLength: number;
    slotWidth: number;
  };
  zoomState: {
    zoomScale: SharedValue<number>;
    zoomTranslateX: SharedValue<number>;
    zoomTranslateY: SharedValue<number>;
    savedZoomTranslateX: SharedValue<number>;
    savedZoomTranslateY: SharedValue<number>;
    isZoomed: SharedValue<boolean>;
  };
  swipeState: {
    translateX: SharedValue<number>;
    dragOffset: SharedValue<number>;
    panStartTranslationX: SharedValue<number>;
    panMode: SharedValue<'swipe' | 'pan'>;
    isTransitioning: SharedValue<boolean>;
  };
  teleportState: {
    isTeleporting: SharedValue<boolean>;
    teleportMockIndex: SharedValue<number>;
    teleportRealIndex: SharedValue<number>;
  };
  decayState: {
    isDecaying: SharedValue<number>;
    recentlyStoppedDecay: SharedValue<number>;
  };
  callbacks: {
    prepareTransition: (newIndex: number, isManualSwipe?: boolean) => void;
    finalizeTransition: (newIndex: number, isManualSwipe: boolean) => void;
    finalizeTeleport: (targetIndex: number) => void;
  };
  rotationY?: SharedValue<number>;
}

export const usePanGesture = ({
  dimensions: { width, height, photosLength, slotWidth },
  zoomState: { zoomScale, zoomTranslateX, zoomTranslateY, savedZoomTranslateX, savedZoomTranslateY, isZoomed },
  swipeState: { translateX, dragOffset, panStartTranslationX, panMode, isTransitioning },
  teleportState: { isTeleporting, teleportMockIndex, teleportRealIndex },
  decayState: { isDecaying, recentlyStoppedDecay },
  callbacks: { prepareTransition, finalizeTransition, finalizeTeleport },
  rotationY,
}: UsePanGestureProps) => {
  const hasWarnedPanNaN = useSharedValue(false);

  return Gesture.Pan()
    .maxPointers(1)
    .onBegin(() => {
      'worklet';
      if (isZoomed.value) {
        if (isDecaying.value === 1) {
          recentlyStoppedDecay.value = 1;
          recentlyStoppedDecay.value = withTiming(0, { duration: DECAY_DURATION_MS });
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
        if (isTeleporting.value) {
          const shift = (teleportMockIndex.value - teleportRealIndex.value) * slotWidth;
          translateX.value = translateX.value + shift;
          isTeleporting.value = false;
          runOnJS(finalizeTeleport)(teleportRealIndex.value);
        }
        panMode.value = 'swipe';
        dragOffset.value = translateX.value;
        panStartTranslationX.value = event?.translationX ?? 0;
      }
    })
    .onUpdate((event) => {
      'worklet';
      const tx = event?.translationX ?? 0;
      const ty = event?.translationY ?? 0;
      
      if (isNaN(tx) || isNaN(ty)) {
        if (__DEV__ && !hasWarnedPanNaN.value) {
          hasWarnedPanNaN.value = true;
          console.warn(`[Gesture Warning]: translationX or translationY is NaN in usePanGesture`);
        }
        return;
      }

      if (panMode.value === 'pan') {
        const angle = rotationY ? rotationY.value : 0;
        const bounds = calculatePanBounds(width, height, zoomScale.value, angle);

        zoomTranslateX.value = Math.max(bounds.minTx, Math.min(bounds.maxTx, savedZoomTranslateX.value + tx));
        zoomTranslateY.value = Math.max(bounds.minTy, Math.min(bounds.maxTy, savedZoomTranslateY.value + ty));
      } else {
        const activeTranslationX = tx - panStartTranslationX.value;
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
        const bounds = calculatePanBounds(width, height, zoomScale.value, angle);

        isDecaying.value = 1;
        zoomTranslateX.value = withDecay({
          velocity: event?.velocityX ?? 0,
          clamp: [bounds.minTx, bounds.maxTx],
        }, (finished) => {
          if (finished) isDecaying.value = 0;
        });
        zoomTranslateY.value = withDecay({
          velocity: event?.velocityY ?? 0,
          clamp: [bounds.minTy, bounds.maxTy],
        }, (finished) => {
          if (finished) isDecaying.value = 0;
        });
      } else {
        const dragThreshold = width / 3;
        
        const startVirtualIndex = Math.round(-dragOffset.value / slotWidth);
        const startIdx = Math.max(0, Math.min(photosLength - 1, startVirtualIndex));
        
        const currentBaseX = -startIdx * slotWidth;
        const shiftX = translateX.value - currentBaseX;
        const velocity = event?.velocityX ?? 0;

        let targetIndex = startIdx;

        if (shiftX > dragThreshold || velocity > SWIPE_VELOCITY_THRESHOLD) {
          if (startIdx > 0) targetIndex = startIdx - 1;
        } else if (shiftX < -dragThreshold || velocity < -SWIPE_VELOCITY_THRESHOLD) {
          if (startIdx < photosLength - 1) targetIndex = startIdx + 1;
        }

        const targetTranslateX = -targetIndex * slotWidth;

        runOnJS(prepareTransition)(targetIndex, true);

        if (Math.abs(translateX.value - targetTranslateX) > 0.1) {
          isTransitioning.value = true;
          translateX.value = withSpring(
            targetTranslateX,
            { 
              velocity: event?.velocityX ?? 0,
              ...SPRING_CONFIG
            },
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
