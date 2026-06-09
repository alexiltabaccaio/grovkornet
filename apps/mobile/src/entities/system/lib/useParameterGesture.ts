import { SharedValue, useSharedValue, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';

import { useSystemStore } from '../model/useSystemStore';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';
import { 
  globalMeasuredTrackWidth, 
  globalSubTrackWidth, 
  globalSubFullTrackWidth 
} from '@shared/ui/parameter-thumb';
import * as Haptics from '@shared/lib/haptics';


interface UseParameterGestureParams {
  isActive: boolean;
  value?: SharedValue<number>;
  minValue?: number;
  maxValue?: number;
  invertDrag?: boolean;
  onChange?: (val: number) => void;
  onUpdateWorklet?: (val: number) => void;
  onPress: () => void;
  onReset?: () => void;
  onResetGroup?: () => void;
  isAuto?: SharedValue<boolean>;
  disabled?: SharedValue<boolean>;
  variant?: 'text' | 'slider';
  hideAutoPlaceholder?: boolean;
  sliderTrackWidth?: SharedValue<number>;
  isMainSlider?: boolean;
}

export const useParameterGesture = ({
  isActive: _isActive,
  value,
  minValue = 0,
  maxValue = 1,
  invertDrag = false,
  onChange,
  onUpdateWorklet,
  onPress,
  onReset,
  onResetGroup,
  isAuto,
  disabled,
  variant,
  hideAutoPlaceholder,
  sliderTrackWidth,
  isMainSlider,
}: UseParameterGestureParams) => {
  const startVal = useSharedValue(minValue);
  const lastX = useSharedValue(0);
  const accumulatedValue = useSharedValue(minValue);
  const fallbackTrackWidth = useSharedValue(
    isMainSlider 
      ? globalMeasuredTrackWidth 
      : (hideAutoPlaceholder ? globalSubTrackWidth : globalSubFullTrackWidth)
  );
  const effectiveTrackWidth = sliderTrackWidth || fallbackTrackWidth;
  const isLayoutOverlayEnabled = useSystemStore((s) => s.isLayoutOverlayEnabled);
  const atBoundary = useSharedValue(false);

  const isSlider = variant === 'slider';
  
  const tap = Gesture.Tap()
    .maxDistance(20)
    .onEnd(() => {
      'worklet';
      if (disabled && disabled.value) return;
      runOnJS(Haptics.selectionAsync)();
      runOnJS(onPress)();
    });

  if (isSlider) {
    tap.maxDuration(250);
  }

  let trackGesture: ReturnType<typeof Gesture.Tap> | ReturnType<typeof Gesture.Exclusive> | ReturnType<typeof Gesture.Race> = tap;
  let labelGesture: ReturnType<typeof Gesture.Tap> | ReturnType<typeof Gesture.Exclusive> = tap;

  if (onReset) {
    const trackDoubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .maxDistance(20)
      .onEnd(() => {
        'worklet';
        if (disabled && disabled.value) return;
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        runOnJS(onReset)();
      });
      
    trackGesture = Gesture.Exclusive(trackDoubleTap, tap);

    const labelDoubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .maxDistance(20)
      .onEnd(() => {
        'worklet';
        if (disabled && disabled.value) return;
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        if (onResetGroup) {
          runOnJS(onResetGroup)();
        } else {
          runOnJS(onReset)();
        }
      });
      
    labelGesture = Gesture.Exclusive(labelDoubleTap, tap);
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
        
        // If the current value exceeds the normal UI max, expand the bounds temporarily
        const effectiveMax = value ? Math.max(maxValue, value.value) : maxValue;
        
        // Calculate value based on exact touch position (absolute jump)
        const percentage = Math.max(0, Math.min(1, (e.x - trackStartX) / travel));
        const newValue = minValue + percentage * (effectiveMax - minValue);
        
        updateSharedValue(value, newValue);
        startVal.value = newValue;
        lastX.value = 0;
        accumulatedValue.value = newValue;
        
        if (newValue <= minValue || newValue >= maxValue) {
          atBoundary.value = true;
        } else {
          atBoundary.value = false;
        }

        runOnJS(Haptics.selectionAsync)();
        runOnJS(onPress)();
      })
      .onUpdate((e) => {
        'worklet';
        if (disabled && disabled.value) return;
        if (!value) return;
        
        const direction = invertDrag ? -1 : 1;
        const travel = effectiveTrackWidth.value - 12; // 12 is thumb size
        
        // Calculate horizontal drag delta since the last frame
        const dx = e.translationX - lastX.value;
        lastX.value = e.translationX;
        
        const effectiveMax = value ? Math.max(maxValue, startVal.value) : maxValue;
        const range = effectiveMax - minValue;
        const delta = (dx / travel) * range * direction;
          
        const newValue = Math.min(Math.max(accumulatedValue.value + delta, minValue), effectiveMax);
        accumulatedValue.value = newValue;
        
        const isCurrentlyAtBoundary = newValue <= minValue || newValue >= effectiveMax;
        if (isCurrentlyAtBoundary && !atBoundary.value) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
          atBoundary.value = true;
        } else if (!isCurrentlyAtBoundary) {
          atBoundary.value = false;
        }

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

  if (panGesture) {
    trackGesture = Gesture.Race(trackGesture, panGesture);
  }

  return {
    trackGesture,
    labelGesture,
    isLayoutOverlayEnabled,
    effectiveTrackWidth,
  };
};
