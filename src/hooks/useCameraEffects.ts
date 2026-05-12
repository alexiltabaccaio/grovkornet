import { useState, useCallback } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { useSharedValue as useWCSharedValue } from 'react-native-worklets-core';
import { useFilmFrameProcessor } from './useFilmFrameProcessor';
import { TabType, CameraEffectState, ImageToolType } from '../types/camera';
import { DEFAULT_GRAIN_INTENSITY, DEFAULT_SATURATION, DEFAULT_CONTRAST } from '../constants/videoProcessing';
import { DrawableFrameProcessor } from 'react-native-vision-camera';

export const useCameraEffects = (): CameraEffectState & { frameProcessor: DrawableFrameProcessor } => {
  const [activeTab, setActiveTab] = useState<TabType>('grain');
  const [activeImageTool, setActiveImageTool] = useState<ImageToolType>('saturation');

  // Reanimated Shared Values (for UI/Animations)
  const grainIntensity = useSharedValue(DEFAULT_GRAIN_INTENSITY);
  const saturation = useSharedValue(DEFAULT_SATURATION);
  const contrast = useSharedValue(DEFAULT_CONTRAST);
  const grainEnabled = useSharedValue(false);

  // Worklets Core Shared Values (for GPU Frame Processor)
  const wcGrainIntensity = useWCSharedValue(DEFAULT_GRAIN_INTENSITY);
  const wcSaturation = useWCSharedValue(DEFAULT_SATURATION);
  const wcContrast = useWCSharedValue(DEFAULT_CONTRAST);
  const wcGrainEnabled = useWCSharedValue(false);

  const frameProcessor = useFilmFrameProcessor({
    wcGrainEnabled,
    wcGrainIntensity,
    wcSaturation,
    wcContrast,
  });

  const setGrainIntensity = useCallback((value: number) => {
    wcGrainIntensity.value = value;
  }, [wcGrainIntensity]);

  const setSaturation = useCallback((value: number) => {
    wcSaturation.value = value;
  }, [wcSaturation]);

  const setContrast = useCallback((value: number) => {
    wcContrast.value = value;
  }, [wcContrast]);

  const setGrainEnabled = useCallback((value: boolean) => {
    wcGrainEnabled.value = value;
  }, [wcGrainEnabled]);

  const resetTool = useCallback((tool: 'grain' | ImageToolType) => {
    if (tool === 'grain') {
      grainIntensity.value = DEFAULT_GRAIN_INTENSITY;
      setGrainIntensity(DEFAULT_GRAIN_INTENSITY);
    }
    if (tool === 'saturation') {
      saturation.value = DEFAULT_SATURATION;
      setSaturation(DEFAULT_SATURATION);
    }
    if (tool === 'contrast') {
      contrast.value = DEFAULT_CONTRAST;
      setContrast(DEFAULT_CONTRAST);
    }
  }, [grainIntensity, saturation, contrast, setGrainIntensity, setSaturation, setContrast]);

  return {
    activeTab,
    setActiveTab,
    activeImageTool,
    setActiveImageTool,
    grainIntensity,
    saturation,
    contrast,
    grainEnabled,
    setGrainIntensity,
    setSaturation,
    setContrast,
    setGrainEnabled,
    resetTool,
    frameProcessor,
  };
};
