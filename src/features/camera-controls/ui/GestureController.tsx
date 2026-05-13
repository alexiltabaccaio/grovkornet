import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { SharedValue, runOnJS, useSharedValue } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { TabType, ParameterType, ModuleType } from '@shared/types/camera';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_HEIGHT = SCREEN_HEIGHT * 0.3;

interface GestureControllerProps {
  grainIntensity: SharedValue<number>;
  saturation: SharedValue<number>;
  contrast: SharedValue<number>;
  chromaticAberration: SharedValue<number>;
  onGrainIntensityChange: (val: number) => void;
  onSaturationChange: (val: number) => void;
  onContrastChange: (val: number) => void;
  onChromaticAberrationChange: (val: number) => void;
  activeTab: TabType;
  activeModule: ModuleType;
  activeParameter: ParameterType;
}

export const GestureController = ({
  grainIntensity,
  saturation,
  contrast,
  chromaticAberration,
  onGrainIntensityChange,
  onSaturationChange,
  onContrastChange,
  onChromaticAberrationChange,
  activeModule,
  activeParameter,
}: GestureControllerProps) => {



  const startVal = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onStart(() => {
      if (activeModule === 'grain' && activeParameter === 'grain') {
        startVal.value = grainIntensity.value;
      } else if (activeModule === 'color_grading' && activeParameter === 'saturation') {
        startVal.value = saturation.value / 2.0;
      } else if (activeModule === 'color_grading' && activeParameter === 'contrast') {
        startVal.value = contrast.value / 2.0;
      } else if (activeModule === 'lens_effects' && activeParameter === 'chromatic_aberration') {
        startVal.value = chromaticAberration.value / 2.0;
      } else {
        startVal.value = -1; // Indicate nothing is selected
      }
    })
    .onUpdate((e) => {
      if (startVal.value === -1) return; // Do nothing if no parameter selected

      const delta = -(e.translationY / SLIDER_HEIGHT);
      const normalizedValue = Math.min(Math.max(startVal.value + delta, 0), 1);
      
      if (activeModule === 'grain' && activeParameter === 'grain') {
        grainIntensity.value = normalizedValue;
        runOnJS(onGrainIntensityChange)(normalizedValue);
      } else if (activeModule === 'color_grading') {
        const scaledValue = normalizedValue * 2.0;
        if (activeParameter === 'saturation') {
          saturation.value = scaledValue;
          runOnJS(onSaturationChange)(scaledValue);
        } else if (activeParameter === 'contrast') {
          contrast.value = scaledValue;
          runOnJS(onContrastChange)(scaledValue);
        }
      } else if (activeModule === 'lens_effects' && activeParameter === 'chromatic_aberration') {
        const scaledValue = normalizedValue * 2.0;
        chromaticAberration.value = scaledValue;
        runOnJS(onChromaticAberrationChange)(scaledValue);
      }
    });

  if (activeModule !== 'grain' && activeModule !== 'color_grading' && activeModule !== 'lens_effects') {
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
