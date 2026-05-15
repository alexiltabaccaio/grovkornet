import { SharedValue } from 'react-native-reanimated';

export type TabType = 'lens' | 'color' | 'tape' | 'crt' | 'settings' | 'exposure' | 'none';
export type ModuleType = 'color_grading' | 'fade' | 'grain' | 'jitter' | 'dropouts' | 'lens_effects' | 'language' | 'debug' | 'manual_exposure' | 'focus' | 'lens' | 'none';
export type ParameterType = 'saturation' | 'contrast' | 'grain' | 'grain_chroma' | 'grain_size' | 'chromatic_aberration' | 'iso' | 'ev' | 'shutter_speed' | 'white_balance' | 'focus' | 'lens' | 'torch' | 'torch_dimmer' | 'none';

export interface CameraCapabilities {
  supportsFocus: boolean;
  hasTorch?: boolean;
  maxTorchStrength?: number;
  isoMin?: number;
  isoMax?: number;
  availableCameras: Array<{
    id: string;
    focalLength: number;
    focalLength35mm: number;
  }>;
}

interface EffectSharedValues {
  grainIntensity: SharedValue<number>;
  grainChroma: SharedValue<number>;
  grainSize: SharedValue<number>;
  saturation: SharedValue<number>;
  contrast: SharedValue<number>;
  chromaticAberration: SharedValue<number>;
  grainEnabled: SharedValue<boolean>;
  fps: SharedValue<number>;
  hwFps: SharedValue<number>;
  resolution: SharedValue<string>;
  iso: SharedValue<number>;
  ev: SharedValue<number>;
  shutterSpeed: SharedValue<number>;
  whiteBalance: SharedValue<number>;
  isoAuto: SharedValue<boolean>;
  shutterSpeedAuto: SharedValue<boolean>;
  whiteBalanceAuto: SharedValue<boolean>;
  evAuto: SharedValue<boolean>;
  focusDistance: SharedValue<number>;
  focusAuto: SharedValue<boolean>;
  cameraId: string;
  cameraAuto: boolean;
  torchState: SharedValue<number>;
  torchStrength: SharedValue<number>;
}

interface EffectHandlers {
  setGrainIntensity: (value: number) => void;
  setGrainChroma: (value: number) => void;
  setGrainSize: (value: number) => void;
  setSaturation: (value: number) => void;
  setContrast: (value: number) => void;
  setChromaticAberration: (value: number) => void;
  setGrainEnabled: (value: boolean) => void;
  resetTool: (tool: 'grain' | ParameterType) => void;
  setDebugInfo: (fps: number, resolution: string, hwFps: number) => void;
  setIso: (value: number) => void;
  setEv: (value: number) => void;
  setShutterSpeed: (value: number) => void;
  setWhiteBalance: (value: number) => void;
  setIsoAuto: (value: boolean) => void;
  setShutterSpeedAuto: (value: boolean) => void;
  setWhiteBalanceAuto: (value: boolean) => void;
  setEvAuto: (value: boolean) => void;
  setFocusDistance: (value: number) => void;
  setFocusAuto: (value: boolean) => void;
  setCameraId: (value: string) => void;
  setCameraAuto: (value: boolean) => void;
  setTorchState: (value: number) => void;
  setTorchStrength: (value: number) => void;
  setCapabilities: (capabilities: CameraCapabilities) => void;
}

export interface UIState {
  activeTab: TabType;
  activeModule: ModuleType;
  activeParameter: ParameterType;
  isDebugEnabled: boolean;
  lastActiveParameters: Record<ModuleType, ParameterType>;
  capabilities: CameraCapabilities;
}

export interface UIActions {
  setActiveTab: (tab: TabType) => void;
  setActiveModule: (module: ModuleType) => void;
  setActiveParameter: (param: ParameterType) => void;
  setIsDebugEnabled: (enabled: boolean) => void;
}

export interface CameraState extends EffectSharedValues, EffectHandlers {
  capabilities: CameraCapabilities;
}
