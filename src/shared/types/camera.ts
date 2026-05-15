import { SharedValue } from 'react-native-reanimated';

export type SectionType = 'system' | 'lens' | 'body' | 'film' | 'none';
export type ModuleType = 'preferences' | 'optics' | 'flaws' | 'exposure' | 'lighting' | 'capture' | 'development' | 'texture' | 'none';
export type ParameterType = 'language' | 'debug' | 'camera_selection' | 'focus' | 'chromatic_aberration' | 'iso' | 'shutter_speed' | 'ev' | 'torch' | 'torch_strength' | 'aspect_ratio' | 'resolution_setting' | 'fps_setting' | 'temperature' | 'saturation' | 'contrast' | 'grain' | 'none';
export type SubParameterType = 'grain_size' | 'grain_chroma' | 'torch_strength' | 'aberration_direction' | 'none';


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
  aberrationDirection: SharedValue<number>;
  grainEnabled: SharedValue<boolean>;
  fps: SharedValue<number>;
  hwFps: SharedValue<number>;
  resolution: SharedValue<string>;
  iso: SharedValue<number>;
  ev: SharedValue<number>;
  shutterSpeed: SharedValue<number>;
  temperature: SharedValue<number>;
  isoAuto: SharedValue<boolean>;
  shutterSpeedAuto: SharedValue<boolean>;
  temperatureAuto: SharedValue<boolean>;
  evAuto: SharedValue<boolean>;
  focusDistance: SharedValue<number>;
  focusAuto: SharedValue<boolean>;
  cameraId: string;
  cameraAuto: boolean;
  torchState: SharedValue<number>;
  torchStrength: SharedValue<number>;
  aspectRatio: SharedValue<number>;
  resolutionSetting: SharedValue<number>;
  fpsSetting: SharedValue<number>;
}

interface EffectHandlers {
  setGrainIntensity: (value: number) => void;
  setGrainChroma: (value: number) => void;
  setGrainSize: (value: number) => void;
  setSaturation: (value: number) => void;
  setContrast: (value: number) => void;
  setChromaticAberration: (value: number) => void;
  setAberrationDirection: (value: number) => void;
  setGrainEnabled: (value: boolean) => void;
  resetTool: (tool: 'grain' | ParameterType) => void;
  setDebugInfo: (fps: number, resolution: string, hwFps: number) => void;
  setIso: (value: number) => void;
  setEv: (value: number) => void;
  setShutterSpeed: (value: number) => void;
  setTemperature: (value: number) => void;
  setIsoAuto: (value: boolean) => void;
  setShutterSpeedAuto: (value: boolean) => void;
  setTemperatureAuto: (value: boolean) => void;
  setEvAuto: (value: boolean) => void;
  setFocusDistance: (value: number) => void;
  setFocusAuto: (value: boolean) => void;
  setCameraId: (value: string) => void;
  setCameraAuto: (value: boolean) => void;
  setTorchState: (value: number) => void;
  setTorchStrength: (value: number) => void;
  setAspectRatio: (value: number) => void;
  setResolutionSetting: (value: number) => void;
  setFpsSetting: (value: number) => void;
  setCapabilities: (capabilities: CameraCapabilities) => void;
}

export interface UIState {
  activeSection: SectionType;
  activeModule: ModuleType;
  activeParameter: ParameterType;
  activeSubParameter: SubParameterType;
  isDebugEnabled: boolean;
  isSubPanelOpen: boolean;
  isCapturing: boolean;
  lastActiveParameters: Record<ModuleType, ParameterType>;
}


export interface UIActions {
  setActiveSection: (section: SectionType) => void;
  setActiveModule: (module: ModuleType) => void;
  setActiveParameter: (param: ParameterType) => void;
  setActiveSubParameter: (param: SubParameterType) => void;
  setIsDebugEnabled: (enabled: boolean) => void;
  setIsSubPanelOpen: (open: boolean) => void;
  triggerCapture: () => void;
}


export interface UIStore extends UIState, UIActions {}

export interface CameraState extends EffectSharedValues, EffectHandlers {
  capabilities: CameraCapabilities;
}
