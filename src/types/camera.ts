import { SharedValue } from 'react-native-reanimated';

export type TabType = 'grain' | 'image';
export type ImageToolType = 'saturation' | 'contrast';

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
  resetTool: (tool: 'grain' | ImageToolType) => void;
}

export interface CameraEffectState extends EffectSharedValues, EffectHandlers {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeImageTool: ImageToolType;
  setActiveImageTool: (tool: ImageToolType) => void;
}
