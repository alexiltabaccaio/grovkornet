import { Gesture } from 'react-native-gesture-handler';
import { cancelAnimation, withTiming, SharedValue, useSharedValue } from 'react-native-reanimated';

interface UsePinchGestureProps {
  width: number;
  height: number;
  rotationY?: SharedValue<number>;
  zoomScale: SharedValue<number>;
  zoomTranslateX: SharedValue<number>;
  zoomTranslateY: SharedValue<number>;
  savedZoomScale: SharedValue<number>;
  savedZoomTranslateX: SharedValue<number>;
  savedZoomTranslateY: SharedValue<number>;
  isZoomed: SharedValue<boolean>;
  isDecaying: SharedValue<number>;
}

export const usePinchGesture = ({
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
}: UsePinchGestureProps) => {
  const hasWarnedPinchNaN = useSharedValue(false);

  return Gesture.Pinch()
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
      const scale = event.scale ?? 1;
      if (isNaN(scale) || isNaN(savedZoomScale.value)) {
        if (__DEV__ && !hasWarnedPinchNaN.value) {
          hasWarnedPinchNaN.value = true;
          console.warn(`[Gesture Warning]: scale or savedZoomScale is NaN in usePinchGesture`);
        }
        return;
      }

      let nextScale = savedZoomScale.value * scale;
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
};
