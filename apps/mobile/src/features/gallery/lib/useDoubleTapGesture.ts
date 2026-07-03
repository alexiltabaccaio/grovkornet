import { Gesture } from 'react-native-gesture-handler';
import { withTiming, SharedValue, useSharedValue } from 'react-native-reanimated';

interface UseDoubleTapGestureProps {
  width: number;
  height: number;
  rotationY?: SharedValue<number>;
  zoomScale: SharedValue<number>;
  zoomTranslateX: SharedValue<number>;
  zoomTranslateY: SharedValue<number>;
  isZoomed: SharedValue<boolean>;
  isTransitioning: SharedValue<boolean>;
  recentlyStoppedDecay: SharedValue<number>;
}

export const useDoubleTapGesture = ({
  width,
  height,
  rotationY,
  zoomScale,
  zoomTranslateX,
  zoomTranslateY,
  isZoomed,
  isTransitioning: _isTransitioning,
  recentlyStoppedDecay,
}: UseDoubleTapGestureProps) => {
  const hasWarnedDoubleTapNaN = useSharedValue(false);

  return Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(200)
    .maxDuration(250)
    .maxDistance(20)
    .onEnd((event) => {
      'worklet';
      const ex = event.x ?? 0;
      const ey = event.y ?? 0;
      if (isNaN(ex) || isNaN(ey)) {
        if (__DEV__ && !hasWarnedDoubleTapNaN.value) {
          hasWarnedDoubleTapNaN.value = true;
          console.warn(`[Gesture Warning]: event.x or event.y is NaN in useDoubleTapGesture`);
        }
        return;
      }
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
};
