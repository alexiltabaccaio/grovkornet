import { useState, useCallback } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { useSharedValue as useWCSharedValue } from 'react-native-worklets-core';
import { useFilmFrameProcessor } from './useFilmFrameProcessor';
import { TabType, CameraEffectState } from '../types/camera';
import { DEFAULT_GRAIN_INTENSITY, DEFAULT_SATURATION } from '../constants/videoFilters';
import { DrawableFrameProcessor } from 'react-native-vision-camera';

export const useCameraEffects = (): CameraEffectState & { frameProcessor: DrawableFrameProcessor } => {
  const [activeTab, setActiveTab] = useState<TabType>('grain');

  // Reanimated Shared Values (for UI/Animations)
  const grainIntensity = useSharedValue(DEFAULT_GRAIN_INTENSITY);
  const saturation = useSharedValue(DEFAULT_SATURATION);
  const grainEnabled = useSharedValue(false);

  // Worklets Core Shared Values (for GPU Frame Processor)
  const wcGrainIntensity = useWCSharedValue(DEFAULT_GRAIN_INTENSITY);
  const wcSaturation = useWCSharedValue(DEFAULT_SATURATION);
  const wcGrainEnabled = useWCSharedValue(false);

  const frameProcessor = useFilmFrameProcessor({
    wcGrainEnabled,
    wcGrainIntensity,
    wcSaturation,
  });

  const setGrainIntensity = useCallback((value: number) => {
    wcGrainIntensity.value = value;
  }, [wcGrainIntensity]);

  const setSaturation = useCallback((value: number) => {
    wcSaturation.value = value;
  }, [wcSaturation]);

  const setGrainEnabled = useCallback((value: boolean) => {
    wcGrainEnabled.value = value;
  }, [wcGrainEnabled]);

  return {
    activeTab,
    setActiveTab,
    grainIntensity,
    saturation,
    grainEnabled,
    setGrainIntensity,
    setSaturation,
    setGrainEnabled,
    frameProcessor,
  };
};
