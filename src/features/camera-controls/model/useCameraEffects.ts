import { useState, useCallback } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { Worklets, useSharedValue as useWCSharedValue } from 'react-native-worklets-core';
import { useFilmFrameProcessor } from '@entities/camera';

import { TabType, CameraEffectState, ParameterType, ModuleType } from '@shared/types/camera';
import { DEFAULT_GRAIN_INTENSITY, DEFAULT_SATURATION, DEFAULT_CONTRAST, DEFAULT_CHROMATIC_ABERRATION } from '@shared/constants/videoProcessing';
import { DrawableFrameProcessor } from 'react-native-vision-camera';

export const useCameraEffects = (): CameraEffectState & { frameProcessor: DrawableFrameProcessor } => {
  const [activeTab, setActiveTab] = useState<TabType>('none');
  const [activeModule, setActiveModule] = useState<ModuleType>('none');
  const [activeParameter, setActiveParameter] = useState<ParameterType>('none');

  const [lastActiveParameters, setLastActiveParameters] = useState<Record<ModuleType, ParameterType>>({
    none: 'none',
    grain: 'grain',
    color_grading: 'saturation',
    lens_effects: 'chromatic_aberration',
    language: 'none',
    debug: 'none',
    fade: 'none',
    jitter: 'none',
    dropouts: 'none',
  });

  const handleSetActiveModule = useCallback((module: ModuleType) => {
    setActiveModule(module);
    setActiveParameter(lastActiveParameters[module] || 'none');
  }, [lastActiveParameters]);

  const handleSetActiveParameter = useCallback((param: ParameterType) => {
    setActiveParameter(param);
    setLastActiveParameters(prev => ({
      ...prev,
      [activeModule]: param,
    }));
  }, [activeModule]);

  // Reanimated Shared Values (for UI/Animations)
  const grainIntensity = useSharedValue(DEFAULT_GRAIN_INTENSITY);
  const saturation = useSharedValue(DEFAULT_SATURATION);
  const contrast = useSharedValue(DEFAULT_CONTRAST);
  const chromaticAberration = useSharedValue(DEFAULT_CHROMATIC_ABERRATION);
  const grainEnabled = useSharedValue(false);
  const [isDebugEnabled, setIsDebugEnabledState] = useState(false);
  const fps = useSharedValue(0);
  const resolution = useSharedValue('');

  // Worklets Core Shared Values (for GPU Frame Processor)
  const wcGrainIntensity = useWCSharedValue(DEFAULT_GRAIN_INTENSITY);
  const wcSaturation = useWCSharedValue(DEFAULT_SATURATION);
  const wcContrast = useWCSharedValue(DEFAULT_CONTRAST);
  const wcChromaticAberration = useWCSharedValue(DEFAULT_CHROMATIC_ABERRATION);
  const wcGrainEnabled = useWCSharedValue(false);

  const onDebugUpdate = Worklets.createRunOnJS((newFps: number, newResolution: string) => {
    fps.value = newFps;
    resolution.value = newResolution;
  });

  const frameProcessor = useFilmFrameProcessor({
    wcGrainEnabled,
    wcGrainIntensity,
    wcSaturation,
    wcContrast,
    wcChromaticAberration,
    onDebugUpdate,
  });

  const setGrainIntensity = useCallback((value: number) => {
    wcGrainIntensity.value = value;
    wcGrainEnabled.value = value > 0;
    grainEnabled.value = value > 0;
  }, [wcGrainIntensity, wcGrainEnabled, grainEnabled]);

  const setSaturation = useCallback((value: number) => {
    wcSaturation.value = value;
  }, [wcSaturation]);

  const setContrast = useCallback((value: number) => {
    wcContrast.value = value;
  }, [wcContrast]);
  
  const setChromaticAberration = useCallback((value: number) => {
    wcChromaticAberration.value = value;
  }, [wcChromaticAberration]);

  const setGrainEnabled = useCallback((value: boolean) => {
    wcGrainEnabled.value = value;
  }, [wcGrainEnabled]);

  const setIsDebugEnabled = useCallback((value: boolean) => {
    setIsDebugEnabledState(value);
  }, []);

  const resetTool = useCallback((tool: 'grain' | ParameterType) => {
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
    if (tool === 'chromatic_aberration') {
      chromaticAberration.value = DEFAULT_CHROMATIC_ABERRATION;
      setChromaticAberration(DEFAULT_CHROMATIC_ABERRATION);
    }
  }, [grainIntensity, saturation, contrast, chromaticAberration, setGrainIntensity, setSaturation, setContrast, setChromaticAberration]);

  return {
    activeTab,
    setActiveTab,
    activeModule,
    setActiveModule: handleSetActiveModule,
    activeParameter,
    setActiveParameter: handleSetActiveParameter,
    grainIntensity,
    saturation,
    contrast,
    chromaticAberration,
    grainEnabled,
    isDebugEnabled,
    fps,
    resolution,
    setGrainIntensity,
    setSaturation,
    setContrast,
    setChromaticAberration,
    setGrainEnabled,
    setIsDebugEnabled,
    resetTool,
    frameProcessor,
  };
};
