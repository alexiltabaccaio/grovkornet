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
  const { activeModule, activeParameter } = useUIStore(useShallow(state => ({
    activeModule: state.activeModule,
    activeParameter: state.activeParameter,
  })));

  const {
    grainIntensity,
    saturation,
    contrast,
    chromaticAberration,
    grainEnabled,
    iso,
    ev,
    shutterSpeed,
    whiteBalance,
    isoAuto,
    evAuto,
    shutterSpeedAuto,
    whiteBalanceAuto,
  } = useCameraEffectsStore(useShallow(state => ({
    grainIntensity: state.grainIntensity,
    saturation: state.saturation,
    contrast: state.contrast,
    chromaticAberration: state.chromaticAberration,
    grainEnabled: state.grainEnabled,
    iso: state.iso,
    ev: state.ev,
    shutterSpeed: state.shutterSpeed,
    whiteBalance: state.whiteBalance,
    isoAuto: state.isoAuto,
    evAuto: state.evAuto,
    shutterSpeedAuto: state.shutterSpeedAuto,
    whiteBalanceAuto: state.whiteBalanceAuto,
  })));

  const {
    updateGrain,
    updateSaturation,
    updateContrast,
    updateChromaticAberration,
    updateIso,
    updateEv,
    updateShutterSpeed,
    updateWhiteBalance,
  } = useCameraWorklets(
    grainIntensity,
    grainEnabled,
    saturation,
    contrast,
    chromaticAberration,
    iso,
    ev,
    shutterSpeed,
    whiteBalance,
    isoAuto,
    evAuto,
    shutterSpeedAuto,
    whiteBalanceAuto,
  );

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
      } else if (activeModule === 'manual_exposure') {
        if (activeParameter === 'iso') {
          startVal.value = (iso.value - 50) / (3200 - 50);
        } else if (activeParameter === 'ev') {
          startVal.value = (ev.value - (-2.0)) / (2.0 - (-2.0));
        } else if (activeParameter === 'shutter_speed') {
          startVal.value = (shutterSpeed.value - 1) / (1000 - 1);
        } else if (activeParameter === 'white_balance') {
          startVal.value = (whiteBalance.value - 2000) / (10000 - 2000);
        } else {
          startVal.value = -1;
        }
      } else {
        startVal.value = -1; // Indicate nothing is selected
      }
    })
    .onUpdate((e) => {
      if (startVal.value === -1) return; // Do nothing if no parameter selected

      const delta = -(e.translationY / SLIDER_HEIGHT);
      const normalizedValue = Math.min(Math.max(startVal.value + delta, 0), 1);
      
      if (activeModule === 'grain' && activeParameter === 'grain') {
        updateGrain(normalizedValue);
      } else if (activeModule === 'color_grading') {
        const scaledValue = normalizedValue * 2.0;
        if (activeParameter === 'saturation') {
          updateSaturation(scaledValue);
        } else if (activeParameter === 'contrast') {
          updateContrast(scaledValue);
        }
      } else if (activeModule === 'lens_effects' && activeParameter === 'chromatic_aberration') {
        const scaledValue = normalizedValue * 2.0;
        updateChromaticAberration(scaledValue);
      } else if (activeModule === 'manual_exposure') {
        if (activeParameter === 'iso') {
          const val = 50 + normalizedValue * (3200 - 50);
          updateIso(val);
        } else if (activeParameter === 'ev') {
          const val = -2.0 + normalizedValue * (2.0 - (-2.0));
          updateEv(val);
        } else if (activeParameter === 'shutter_speed') {
          const val = 1 + normalizedValue * (1000 - 1);
          updateShutterSpeed(val);
        } else if (activeParameter === 'white_balance') {
          const val = 2000 + normalizedValue * (10000 - 2000);
          updateWhiteBalance(val);
        }
      }
    });

  if (activeModule !== 'grain' && activeModule !== 'color_grading' && activeModule !== 'lens_effects' && activeModule !== 'manual_exposure') {
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
