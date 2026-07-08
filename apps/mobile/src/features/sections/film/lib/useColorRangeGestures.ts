import { useSharedValue, runOnJS, SharedValue } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import * as Haptics from '@shared/lib/haptics';
import { unwrap, angleToX, xToAngle } from './colorMath';
import { useInteractionContext } from '@shared/lib';

interface UseColorRangeGesturesProps {
  trackWidth: SharedValue<number>;
  leftShared: SharedValue<number>;
  rightShared: SharedValue<number>;
  limitLeftShared: SharedValue<number>;
  limitRightShared: SharedValue<number>;
  updateLeftBound: (v: number) => void;
  updateRightBound: (v: number) => void;
  leftDefault: number;
  rightDefault: number;
}

export const useColorRangeGestures = ({
  trackWidth,
  leftShared,
  rightShared,
  limitLeftShared,
  limitRightShared,
  updateLeftBound,
  updateRightBound,
  leftDefault,
  rightDefault,
}: UseColorRangeGesturesProps) => {
  const { isInteractable } = useInteractionContext();
  const dragRefAngle = useSharedValue(0);
  const startXLeft = useSharedValue(0);
  const startXRight = useSharedValue(0);
  const activeThumb = useSharedValue(0); // 0 = left, 1 = right
  const hasWarnedColorNaN = useSharedValue(false);

  const getMinAngle = () => {
    'worklet';
    return dragRefAngle.value;
  };

  const getMaxAngle = () => {
    'worklet';
    return unwrap(limitRightShared.value, dragRefAngle.value);
  };

  const angleToXLocal = (angle: number): number => {
    'worklet';
    return angleToX(angle, getMinAngle(), getMaxAngle(), trackWidth.value);
  };

  const xToAngleLocal = (x: number): number => {
    'worklet';
    return xToAngle(x, getMinAngle(), getMaxAngle(), trackWidth.value);
  };

  const panGesture = Gesture.Pan()
    .enabled(isInteractable)
    .onStart((event) => {
      'worklet';
      dragRefAngle.value = limitLeftShared.value;
      const leftUnwrapped = unwrap(leftShared.value, dragRefAngle.value);
      const rightUnwrapped = unwrap(rightShared.value, dragRefAngle.value);
      
      const leftX = angleToXLocal(leftUnwrapped);
      const rightX = angleToXLocal(rightUnwrapped);
      
      const distLeft = Math.abs(event.x - leftX);
      const distRight = Math.abs(event.x - rightX);
      
      if (distLeft <= distRight) {
        activeThumb.value = 0;
        startXLeft.value = leftX;
      } else {
        activeThumb.value = 1;
        startXRight.value = rightX;
      }
    })
    .onUpdate((event) => {
      'worklet';
      if (activeThumb.value === 0) {
        const newX = startXLeft.value + event.translationX;
        const newAngleUnwrapped = xToAngleLocal(newX);
        
        if (isNaN(newAngleUnwrapped)) {
          if (__DEV__ && !hasWarnedColorNaN.value) {
            hasWarnedColorNaN.value = true;
            console.warn(`[Gesture Warning]: newAngleUnwrapped is NaN in useColorRangeGestures`);
          }
          return;
        }

        const minVal = dragRefAngle.value;
        const maxVal = unwrap(rightShared.value, dragRefAngle.value);
        
        const clampedAngleUnwrapped = Math.min(Math.max(newAngleUnwrapped, minVal), maxVal);
        
        let finalAngle = clampedAngleUnwrapped % 360;
        if (finalAngle < 0) finalAngle += 360;
        
        if (__DEV__ && !('__workletHash' in updateLeftBound)) {
          console.error("[Gesture Error]: updateLeftBound must be a worklet to prevent UI thread crashes.");
        } else {
          updateLeftBound(finalAngle);
        }
      } else {
        const newX = startXRight.value + event.translationX;
        const newAngleUnwrapped = xToAngleLocal(newX);
        
        if (isNaN(newAngleUnwrapped)) {
          if (__DEV__ && !hasWarnedColorNaN.value) {
            hasWarnedColorNaN.value = true;
            console.warn(`[Gesture Warning]: newAngleUnwrapped is NaN in useColorRangeGestures`);
          }
          return;
        }

        const minVal = unwrap(leftShared.value, dragRefAngle.value);
        const maxVal = unwrap(limitRightShared.value, dragRefAngle.value);
        
        const clampedAngleUnwrapped = Math.min(Math.max(newAngleUnwrapped, minVal), maxVal);
        
        let finalAngle = clampedAngleUnwrapped % 360;
        if (finalAngle < 0) finalAngle += 360;

        if (__DEV__ && !('__workletHash' in updateRightBound)) {
          console.error("[Gesture Error]: updateRightBound must be a worklet to prevent UI thread crashes.");
        } else {
          updateRightBound(finalAngle);
        }
      }
    });

  const doubleTap = Gesture.Tap()
    .enabled(isInteractable)
    .numberOfTaps(2)
    .maxDistance(20)
    .onEnd(() => {
      'worklet';
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      updateLeftBound(leftDefault);
      updateRightBound(rightDefault);
    });

  return Gesture.Simultaneous(panGesture, doubleTap);
};
