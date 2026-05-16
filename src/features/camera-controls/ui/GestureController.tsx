import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { useShallow } from 'zustand/react/shallow';
import { useHardwareStore } from '../model/useHardwareStore';
import { useStylesStore } from '../model/useStylesStore';
import { useUIStore } from '../model/useUIStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_HEIGHT = SCREEN_HEIGHT * 0.3;

import { useCameraWorklets } from '../lib/useCameraWorklets';

export const GestureController = () => {
  const { activeParameter, activeSubParameter } = useUIStore(useShallow(state => ({
    activeParameter: state.activeParameter,
    activeSubParameter: state.activeSubParameter,
  })));


  const {
    grainIntensity,
    grainChroma,
    grainSize,
    saturation,
    contrast,
    chromaticAberration,
    grainEnabled,
    noiseReductionMode,
    sharpening,
  } = useStylesStore(useShallow(state => ({
    grainIntensity: state.grainIntensity,
    grainChroma: state.grainChroma,
    grainSize: state.grainSize,
    saturation: state.saturation,
    contrast: state.contrast,
    chromaticAberration: state.chromaticAberration,
    grainEnabled: state.grainEnabled,
    noiseReductionMode: state.noiseReductionMode,
    sharpening: state.sharpening,
  })));

  const {
    iso,
    ev,
    shutterSpeed,
    temperature,
    isoAuto,
    evAuto,
    shutterSpeedAuto,
    temperatureAuto,
    focusDistance,
    focusAuto,
  } = useHardwareStore(useShallow(state => ({
    iso: state.iso,
    ev: state.ev,
    shutterSpeed: state.shutterSpeed,
    temperature: state.temperature,
    isoAuto: state.isoAuto,
    evAuto: state.evAuto,
    shutterSpeedAuto: state.shutterSpeedAuto,
    temperatureAuto: state.temperatureAuto,
    focusDistance: state.focusDistance,
    focusAuto: state.focusAuto,
  })));

  const {
    updateGrain,
    updateGrainChroma,
    updateGrainSize,
    updateSaturation,
    updateContrast,
    updateChromaticAberration,
    updateIso,
    updateEv,
    updateShutterSpeed,
    updateTemperature,
    updateFocusDistance,
    updateSharpening,
  } = useCameraWorklets(
    grainIntensity,
    grainChroma,
    grainSize,
    grainEnabled,
    saturation,
    contrast,
    chromaticAberration,
    iso,
    ev,
    shutterSpeed,
    temperature,
    isoAuto,
    evAuto,
    shutterSpeedAuto,
    temperatureAuto,
    focusDistance,
    focusAuto,
    sharpening,
  );

  const startVal = useSharedValue(0);

  const gesture = Gesture.Pan()
    .activeOffsetY([-10, 10]) // Only activate on vertical swipe to not conflict with horizontal ScrollViews
    .onStart(() => {
      const activeParam = activeSubParameter !== 'none' ? activeSubParameter : activeParameter;
      switch (activeParam as string) {
        case 'grain':
          startVal.value = grainIntensity.value;
          break;
        case 'grain_chroma':
          startVal.value = grainChroma.value;
          break;
        case 'grain_size':
          startVal.value = (grainSize.value - 1.0) / (4.0 - 1.0);
          break;
        case 'saturation':
          startVal.value = saturation.value / 2.0;
          break;
        case 'contrast':
          startVal.value = contrast.value / 2.0;
          break;
        case 'chromatic_aberration':
          startVal.value = chromaticAberration.value / 2.0;
          break;
        case 'iso':
          startVal.value = (iso.value - 50) / (3200 - 50);
          break;
        case 'ev':
          startVal.value = (ev.value - (-2.0)) / (2.0 - (-2.0));
          break;
        case 'shutter_speed':
          startVal.value = (shutterSpeed.value - 1) / (1000 - 1);
          break;
        case 'temperature':
          startVal.value = (temperature.value - 2000) / (10000 - 2000);
          break;
        case 'white_balance':
          startVal.value = (temperature.value - 2000) / (10000 - 2000);
          break;
        case 'focus':
          startVal.value = focusDistance.value / 10.0;
          break;
        case 'noise_reduction':
          startVal.value = noiseReductionMode.value / 2.0;
          break;
        case 'sharpening':
          startVal.value = sharpening.value;
          break;
        default:
          startVal.value = -1;
      }
    })

    .onUpdate((e) => {
      if (startVal.value === -1) return;

      const activeParam = activeSubParameter !== 'none' ? activeSubParameter : activeParameter;
      let delta = -(e.translationY / SLIDER_HEIGHT);
      if (activeParam === 'focus') {
        delta = -delta;
      }
      
      const normalizedValue = Math.min(Math.max(startVal.value + delta, 0), 1);
      
      switch (activeParam as string) {
        case 'grain':
          updateGrain(normalizedValue);
          break;
        case 'grain_chroma':
          updateGrainChroma(Math.round(normalizedValue));
          break;
        case 'grain_size':
          updateGrainSize(1.0 + normalizedValue * (4.0 - 1.0));
          break;
        case 'saturation':
          updateSaturation(normalizedValue * 2.0);
          break;
        case 'contrast':
          updateContrast(normalizedValue * 2.0);
          break;
        case 'chromatic_aberration':
          updateChromaticAberration(normalizedValue * 2.0);
          break;
        case 'iso':
          updateIso(50 + normalizedValue * (3200 - 50));
          break;
        case 'ev':
          updateEv(-2.0 + normalizedValue * (2.0 - (-2.0)));
          break;
        case 'shutter_speed':
          updateShutterSpeed(1 + normalizedValue * (1000 - 1));
          break;
        case 'temperature':
          updateTemperature(2000 + normalizedValue * (10000 - 2000));
          break;
        case 'white_balance':
          updateTemperature(2000 + normalizedValue * (10000 - 2000));
          break;
        case 'focus':
          updateFocusDistance(normalizedValue * 10.0);
          break;
        case 'noise_reduction':
          useStylesStore.getState().setNoiseReductionMode(Math.round(normalizedValue * 2.0));
          break;
        case 'sharpening':
          updateSharpening(normalizedValue);
          break;
      }
    });


  const swipeableParams = [
    'grain', 'grain_chroma', 'grain_size', 'saturation', 'contrast',
    'chromatic_aberration', 'iso', 'ev', 'shutter_speed', 'temperature',
    'white_balance', 'focus', 'noise_reduction', 'sharpening'
  ];

  const currentParam = activeSubParameter !== 'none' ? activeSubParameter : activeParameter;

  if (!currentParam || !swipeableParams.includes(currentParam)) {
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
