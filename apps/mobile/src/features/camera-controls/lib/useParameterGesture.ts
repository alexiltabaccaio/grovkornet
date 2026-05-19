import { useEffect } from 'react';
import { SharedValue, useSharedValue, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { useWindowDimensions } from 'react-native';

import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';

interface UseParameterGestureParams {
  isActive: boolean;
  value?: SharedValue<number>;
  minValue?: number;
  maxValue?: number;
  invertDrag?: boolean;
  onChange?: (val: number) => void;
  onUpdateWorklet?: (val: number) => void;
  onPress: () => void;
  isAuto?: SharedValue<boolean>;
  disabled?: SharedValue<boolean>;
  variant?: 'square' | 'text' | 'slider';
}

export const useParameterGesture = ({
  isActive,
  value,
  minValue = 0,
  maxValue = 1,
  invertDrag = false,
  onChange,
  onUpdateWorklet,
  onPress,
  isAuto,
  disabled,
  variant,
}: UseParameterGestureParams) => {
  const startVal = useSharedValue(minValue);
  const isDebugEnabled = useUIStore((s) => s.isDebugEnabled);
  const setGestureConfig = useUIStore((s) => s.setGestureConfig);
  const { width: SCREEN_WIDTH } = useWindowDimensions();

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

  const isSlider = variant === 'slider';
  let pan = Gesture.Pan();
  
  if (isSlider) {
    pan = pan.activeOffsetX([-2, 2]).failOffsetY([-10, 10]);
  } else {
    pan = pan.activeOffsetY([-2, 2]).failOffsetX([-10, 10]);
  }

  pan = pan
    .onStart((e) => {
      'worklet';
      if (disabled && disabled.value) return;
      if (!value) return;
      
      if (isSlider) {
        const paddingHorizontal = 24;
        const thumbSize = 12;
        const travel = (SCREEN_WIDTH - paddingHorizontal * 2) - thumbSize;
        
        // Calcola il valore in base alla posizione esatta del tocco (salto assoluto)
        const percentage = Math.max(0, Math.min(1, (e.x - paddingHorizontal) / travel));
        const newValue = minValue + percentage * (maxValue - minValue);
        
        updateSharedValue(value, newValue);
        startVal.value = newValue;
      } else {
        startVal.value = value.value;
      }
      runOnJS(onPress)();
    })
    .onUpdate((e) => {
      'worklet';
      if (disabled && disabled.value) return;
      if (!value) return;
      
      const range = maxValue - minValue;
      const direction = invertDrag ? -1 : 1;
      
      let delta = 0;
      if (isSlider) {
        const travel = (SCREEN_WIDTH - 48) - 12; // 48 is padding, 12 is thumb size
        delta = (e.translationX / travel) * range * direction;
      } else {
        const THUMB_SENSITIVITY = 150;
        delta = -(e.translationY / THUMB_SENSITIVITY) * range * direction;
      }
        
      const newValue = Math.min(Math.max(startVal.value + delta, minValue), maxValue);
      
      if (newValue !== value.value) {
        if (onUpdateWorklet) {
          onUpdateWorklet(newValue);
        } else {
          updateSharedValue(value, newValue);
          
          if (isAuto && isAuto.value) {
            updateSharedValue(isAuto, false);
          }
        }
      }
    })
    .onEnd(() => {
      'worklet';
      if (disabled && disabled.value) return;
      if (value && onChange) {
        runOnJS(onChange)(value.value);
      }
    });

  const tap = Gesture.Tap()
    .onEnd(() => {
      'worklet';
      if (disabled && disabled.value) return;
      runOnJS(onPress)();
    });

  const combinedGesture = Gesture.Race(tap, pan);

  return {
    combinedGesture,
    isDebugEnabled,
  };
};
