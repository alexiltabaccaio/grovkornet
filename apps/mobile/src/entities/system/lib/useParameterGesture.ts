import { SharedValue, useSharedValue, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { useWindowDimensions } from 'react-native';

import { useSystemStore } from '../model/useSystemStore';
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
  variant?: 'text' | 'slider';
  hideAutoPlaceholder?: boolean;
  sliderTrackWidth?: SharedValue<number>;
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
  hideAutoPlaceholder,
  sliderTrackWidth,
}: UseParameterGestureParams) => {
  const startVal = useSharedValue(minValue);
  const lastX = useSharedValue(0);
  const accumulatedValue = useSharedValue(minValue);
  const fallbackTrackWidth = useSharedValue(0);
  const effectiveTrackWidth = sliderTrackWidth || fallbackTrackWidth;
  const isDebugEnabled = useSystemStore((s) => s.isDebugEnabled);
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const isSlider = variant === 'slider';
  
  const tap = Gesture.Tap()
    .maxDistance(20)
    .onEnd(() => {
      'worklet';
      if (disabled && disabled.value) return;
      runOnJS(onPress)();
    });

  if (isSlider) {
    tap.maxDuration(250);
  }

  let panGesture;

  if (isSlider) {
    panGesture = Gesture.Pan()
      .activeOffsetX([-2, 2])
      .onStart((e) => {
        'worklet';
        if (disabled && disabled.value) return;
        if (!value) return;
        
        let trackStartX = 94; // 24 (padding) + 54 (auto/placeholder width) + 16 (margin right)
        
        if (hideAutoPlaceholder) {
          trackStartX = 8;
        }

        const thumbSize = 12;
        const travel = effectiveTrackWidth.value - thumbSize;
        
        // Calcola il valore in base alla posizione esatta del tocco (salto assoluto)
        const percentage = Math.max(0, Math.min(1, (e.x - trackStartX) / travel));
        const newValue = minValue + percentage * (maxValue - minValue);
        
        updateSharedValue(value, newValue);
        startVal.value = newValue;
        lastX.value = 0;
        accumulatedValue.value = newValue;
        runOnJS(onPress)();
      })
      .onUpdate((e) => {
        'worklet';
        if (disabled && disabled.value) return;
        if (!value) return;
        
        const direction = invertDrag ? -1 : 1;
        const travel = effectiveTrackWidth.value - 12; // 12 is thumb size
        
        // Calcola il delta del trascinamento orizzontale dall'ultimo frame
        const dx = e.translationX - lastX.value;
        lastX.value = e.translationX;
        
        // Determina il moltiplicatore di sensibilità in base alla distanza verticale
        const verticalOffset = Math.abs(e.translationY);
        let multiplier = 1.0;
        if (verticalOffset >= 120) {
          multiplier = 0.05; // Precisione estrema
        } else if (verticalOffset >= 80) {
          multiplier = 0.25; // Precisione fine
        } else if (verticalOffset >= 40) {
          multiplier = 0.5; // Precisione media
        }
        
        const range = maxValue - minValue;
        const delta = (dx / travel) * range * direction * multiplier;
          
        const newValue = Math.min(Math.max(accumulatedValue.value + delta, minValue), maxValue);
        accumulatedValue.value = newValue;
        
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
  }

  const combinedGesture = panGesture ? Gesture.Race(tap, panGesture) : tap;

  return {
    combinedGesture,
    isDebugEnabled,
    effectiveTrackWidth,
  };
};
