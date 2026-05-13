import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { SharedValue, runOnJS, useSharedValue } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { useCameraEffectsContext } from '../model/CameraEffectsContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_HEIGHT = SCREEN_HEIGHT * 0.3;

export const GestureController = () => {
  const {
    grainIntensity,
    saturation,
    contrast,
    chromaticAberration,
    setGrainIntensity,
    setSaturation,
    setContrast,
    setChromaticAberration,
    activeModule,
    activeParameter,
  } = useCameraEffectsContext();



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
        runOnJS(setGrainIntensity)(normalizedValue);
      } else if (activeModule === 'color_grading') {
        const scaledValue = normalizedValue * 2.0;
        if (activeParameter === 'saturation') {
          saturation.value = scaledValue;
          runOnJS(setSaturation)(scaledValue);
        } else if (activeParameter === 'contrast') {
          contrast.value = scaledValue;
          runOnJS(setContrast)(scaledValue);
        }
      } else if (activeModule === 'lens_effects' && activeParameter === 'chromatic_aberration') {
        const scaledValue = normalizedValue * 2.0;
        chromaticAberration.value = scaledValue;
        runOnJS(setChromaticAberration)(scaledValue);
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
