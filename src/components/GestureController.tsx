import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, { SharedValue, runOnJS, useSharedValue } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { TabType, ParameterType, ModuleType } from '../types/camera';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_HEIGHT = SCREEN_HEIGHT * 0.3;

interface GestureControllerProps {
  grainIntensity: SharedValue<number>;
  saturation: SharedValue<number>;
  contrast: SharedValue<number>;
  onGrainIntensityChange: (val: number) => void;
  onSaturationChange: (val: number) => void;
  onContrastChange: (val: number) => void;
  activeTab: TabType;
  activeModule: ModuleType;
  activeParameter: ParameterType;
}

export const GestureController = ({
  grainIntensity,
  saturation,
  contrast,
  onGrainIntensityChange,
  onSaturationChange,
  onContrastChange,
  activeTab,
  activeModule,
  activeParameter,
}: GestureControllerProps) => {



  const startVal = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onStart(() => {
      if (activeModule === 'grain') {
        startVal.value = grainIntensity.value;
      } else if (activeModule === 'color_grading') {
        const rawVal = activeParameter === 'saturation' ? saturation.value : contrast.value;
        startVal.value = rawVal / 2.0;
      }
    })
    .onUpdate((e) => {
      const delta = -(e.translationY / SLIDER_HEIGHT);
      const normalizedValue = Math.min(Math.max(startVal.value + delta, 0), 1);
      if (activeModule === 'grain') {
        grainIntensity.value = normalizedValue;
        runOnJS(onGrainIntensityChange)(normalizedValue);
      } else if (activeModule === 'color_grading') {
        const scaledValue = normalizedValue * 2.0;
        if (activeParameter === 'saturation') {
          saturation.value = scaledValue;
          runOnJS(onSaturationChange)(scaledValue);
        } else {
          contrast.value = scaledValue;
          runOnJS(onContrastChange)(scaledValue);
        }
      }
    });

  if (activeModule !== 'grain' && activeModule !== 'color_grading') {
    return null;
  }

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.container} />
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 10,
  },
});
