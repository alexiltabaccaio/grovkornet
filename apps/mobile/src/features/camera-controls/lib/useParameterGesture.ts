import { useEffect, useMemo } from 'react';
import { SharedValue, useSharedValue, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useUIStore } from '../model/useUIStore';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';

interface UseParameterGestureParams {
  isActive: boolean;
  value?: SharedValue<number>;
  minValue?: number;
  maxValue?: number;
  invertDrag?: boolean;
  onChange?: (val: number) => void;
  onPress: () => void;
  onLongPress?: () => void;
  isAuto?: SharedValue<boolean>;
}

export const useParameterGesture = ({
  isActive,
  value,
  minValue = 0,
  maxValue = 1,
  invertDrag = false,
  onChange,
  onPress,
  onLongPress,
  isAuto,
}: UseParameterGestureParams) => {
  const startVal = useSharedValue(minValue);
  const isDebugEnabled = useUIStore((s) => s.isDebugEnabled);
  const setGestureConfig = useUIStore((s) => s.setGestureConfig);

  useEffect(() => {
    if (isActive && value) {
      setGestureConfig({
        value,
        minValue,
        maxValue,
        invertDrag,
        onChange,
      });
    }
  }, [isActive, value, minValue, maxValue, invertDrag, setGestureConfig, onChange]);

  const combinedGesture = useMemo(() => {
    const longPress = Gesture.LongPress()
      .onStart(() => {
        if (onLongPress) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
          runOnJS(onLongPress)();
        }
      });

    const pan = Gesture.Pan()
      .hitSlop(20)
      .activeOffsetY([-2, 2])
      .failOffsetX([-10, 10])
      .onStart(() => {
        if (!value) return;
        startVal.value = value.value;
        runOnJS(onPress)();
      })
      .onUpdate((e) => {
        if (!value) return;
        const THUMB_SENSITIVITY = 150;
        const range = maxValue - minValue;
        const direction = invertDrag ? -1 : 1;
        const delta = -(e.translationY / THUMB_SENSITIVITY) * range * direction;
        const newValue = Math.min(Math.max(startVal.value + delta, minValue), maxValue);
        
        updateSharedValue(value, newValue);
        
        if (onChange) {
          runOnJS(onChange)(newValue);
        }
        
        if (isAuto && isAuto.value) {
          updateSharedValue(isAuto, false);
        }
      });

    const tap = Gesture.Tap()
      .onEnd(() => {
        runOnJS(onPress)();
      });

    return Gesture.Race(longPress, tap, pan);
  }, [onLongPress, onPress, value, startVal, minValue, maxValue, invertDrag, onChange, isAuto]);

  return {
    combinedGesture,
    isDebugEnabled,
  };
};
