import { SharedValue } from 'react-native-reanimated';

export type TabType = 'lens' | 'color' | 'tape' | 'crt' | 'settings' | 'none';
export type ModuleType = 'color_grading' | 'fade' | 'grain' | 'jitter' | 'dropouts' | 'lens_effects' | 'language' | 'debug' | 'none';
export type ParameterType = 'saturation' | 'contrast' | 'grain' | 'chromatic_aberration' | 'none';

interface EffectSharedValues {
  grainIntensity: SharedValue<number>;
  saturation: SharedValue<number>;
  contrast: SharedValue<number>;
  chromaticAberration: SharedValue<number>;
  grainEnabled: SharedValue<boolean>;
  isDebugEnabled: boolean;
  fps: SharedValue<number>;
  resolution: SharedValue<string>;
}

interface EffectHandlers {
  setGrainIntensity: (value: number) => void;
  setSaturation: (value: number) => void;
  setContrast: (value: number) => void;
  setChromaticAberration: (value: number) => void;
  setGrainEnabled: (value: boolean) => void;
  setIsDebugEnabled: (value: boolean) => void;
  resetTool: (tool: 'grain' | ParameterType) => void;
  setDebugInfo: (fps: number, resolution: string) => void;
}

export interface CameraEffectState extends EffectSharedValues, EffectHandlers {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  activeParameter: ParameterType;
  setActiveParameter: (tool: ParameterType) => void;
}
