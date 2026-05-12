import { SharedValue } from 'react-native-reanimated';

export type TabType = 'grain' | 'saturation';

export interface EffectSharedValues {
  grainIntensity: SharedValue<number>;
  saturation: SharedValue<number>;
  grainEnabled: SharedValue<boolean>;
}

export interface EffectHandlers {
  setGrainIntensity: (value: number) => void;
  setSaturation: (value: number) => void;
  setGrainEnabled: (value: boolean) => void;
}

export interface CameraEffectState extends EffectSharedValues, EffectHandlers {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}
