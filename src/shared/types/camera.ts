import { SharedValue } from 'react-native-reanimated';

export type TabType = 'lens' | 'color' | 'tape' | 'crt' | 'settings' | 'exposure' | 'none';
export type ModuleType = 'color_grading' | 'fade' | 'grain' | 'jitter' | 'dropouts' | 'lens_effects' | 'language' | 'debug' | 'manual_exposure' | 'none';
export type ParameterType = 'saturation' | 'contrast' | 'grain' | 'chromatic_aberration' | 'iso' | 'ev' | 'shutter_speed' | 'white_balance' | 'none';

interface EffectSharedValues {
  grainIntensity: SharedValue<number>;
  saturation: SharedValue<number>;
  contrast: SharedValue<number>;
  chromaticAberration: SharedValue<number>;
  grainEnabled: SharedValue<boolean>;
  fps: SharedValue<number>;
  resolution: SharedValue<string>;
  iso: SharedValue<number>;
  ev: SharedValue<number>;
  shutterSpeed: SharedValue<number>;
  whiteBalance: SharedValue<number>;
  isoAuto: SharedValue<boolean>;
  shutterSpeedAuto: SharedValue<boolean>;
  whiteBalanceAuto: SharedValue<boolean>;
  evAuto: SharedValue<boolean>;
}

interface EffectHandlers {
  setGrainIntensity: (value: number) => void;
  setSaturation: (value: number) => void;
  setContrast: (value: number) => void;
  setChromaticAberration: (value: number) => void;
  setGrainEnabled: (value: boolean) => void;
  resetTool: (tool: 'grain' | ParameterType) => void;
  setDebugInfo: (fps: number, resolution: string) => void;
  setIso: (value: number) => void;
  setEv: (value: number) => void;
  setShutterSpeed: (value: number) => void;
  setWhiteBalance: (value: number) => void;
  setIsoAuto: (value: boolean) => void;
  setShutterSpeedAuto: (value: boolean) => void;
  setWhiteBalanceAuto: (value: boolean) => void;
  setEvAuto: (value: boolean) => void;
}

export interface UIState {
  activeTab: TabType;
  activeModule: ModuleType;
  activeParameter: ParameterType;
  isDebugEnabled: boolean;
  lastActiveParameters: Record<ModuleType, ParameterType>;
}

export interface UIActions {
  setActiveTab: (tab: TabType) => void;
  setActiveModule: (module: ModuleType) => void;
  setActiveParameter: (param: ParameterType) => void;
  setIsDebugEnabled: (enabled: boolean) => void;
}

export interface CameraState extends EffectSharedValues, EffectHandlers {}
