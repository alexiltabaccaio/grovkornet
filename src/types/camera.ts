import { SharedValue } from 'react-native-reanimated';

export type TabType = 'lens' | 'color' | 'tape' | 'crt' | 'none';
export type ModuleType = 'color_grading' | 'fade' | 'grain' | 'jitter' | 'dropouts' | 'none';
export type ParameterType = 'saturation' | 'contrast';

export interface EffectSharedValues {
  grainIntensity: SharedValue<number>;
  saturation: SharedValue<number>;
  contrast: SharedValue<number>;
  grainEnabled: SharedValue<boolean>;
}

export interface EffectHandlers {
  setGrainIntensity: (value: number) => void;
  setSaturation: (value: number) => void;
  setContrast: (value: number) => void;
  setGrainEnabled: (value: boolean) => void;
  resetTool: (tool: 'grain' | ParameterType) => void;
}

export interface CameraEffectState extends EffectSharedValues, EffectHandlers {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  activeParameter: ParameterType;
  setActiveParameter: (tool: ParameterType) => void;
}
