import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { useShallow } from 'zustand/react/shallow';
import { useCameraEffectsStore } from '../model/useCameraEffectsStore';
import { useUIStore } from '../model/useUIStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_HEIGHT = SCREEN_HEIGHT * 0.3;

import { useCameraWorklets } from '../lib/useCameraWorklets';

export const GestureController = () => {
  const { activePrimaryParameter } = useUIStore(useShallow(state => ({
    activePrimaryParameter: state.activePrimaryParameter,
  })));

  const {
    grainIntensity,
    grainChroma,
    grainSize,
    saturation,
    contrast,
    chromaticAberration,
    grainEnabled,
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
  } = useCameraEffectsStore(useShallow(state => ({
    grainIntensity: state.grainIntensity,
    grainChroma: state.grainChroma,
    grainSize: state.grainSize,
    saturation: state.saturation,
    contrast: state.contrast,
    chromaticAberration: state.chromaticAberration,
    grainEnabled: state.grainEnabled,
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
  );

  const startVal = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onStart(() => {
      switch (activePrimaryParameter) {
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
        default:
          startVal.value = -1;
      }
    })
    .onUpdate((e) => {
      if (startVal.value === -1) return;

      let delta = -(e.translationY / SLIDER_HEIGHT);
      if (activePrimaryParameter === 'focus') {
        delta = -delta;
      }
      
      const normalizedValue = Math.min(Math.max(startVal.value + delta, 0), 1);
      
      switch (activePrimaryParameter) {
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
      }
    });

  if (!activePrimaryParameter || activePrimaryParameter === 'none' || activePrimaryParameter === 'lens') {
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
