import { useState, useCallback } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { TabType, CameraEffectState, ParameterType, ModuleType } from '@shared/types/camera';
import { DEFAULT_GRAIN_INTENSITY, DEFAULT_SATURATION, DEFAULT_CONTRAST, DEFAULT_CHROMATIC_ABERRATION } from '@shared/constants/videoProcessing';

export const useCameraEffects = (): CameraEffectState => {
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

  const setGrainIntensity = useCallback((value: number) => {
    grainIntensity.value = value;
    grainEnabled.value = value > 0;
  }, [grainIntensity, grainEnabled]);

  const setSaturation = useCallback((value: number) => {
    saturation.value = value;
  }, [saturation]);

  const setContrast = useCallback((value: number) => {
    contrast.value = value;
  }, [contrast]);
  
  const setChromaticAberration = useCallback((value: number) => {
    chromaticAberration.value = value;
  }, [chromaticAberration]);

  const setGrainEnabled = useCallback((value: boolean) => {
    grainEnabled.value = value;
  }, [grainEnabled]);

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
  };
};
