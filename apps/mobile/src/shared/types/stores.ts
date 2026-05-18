import { SharedValue } from 'react-native-reanimated';

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
  availableNoiseReductionModes?: number[];
  availableEdgeModes?: number[];
  maxFps?: number;
}

export interface HardwareState {
  fps: SharedValue<number>;
  hwFps: SharedValue<number>;
  resolution: SharedValue<string>;
  iso: SharedValue<number>;
  ev: SharedValue<number>;
  shutterSpeed: SharedValue<number>;
  temperature: SharedValue<number>;
  tint: SharedValue<number>;
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
  capabilities: CameraCapabilities;
}

export interface HardwareActions {
  setDebugInfo: (fps: number, resolution: string, hwFps: number) => void;
  setIso: (value: number) => void;
  setEv: (value: number) => void;
  setShutterSpeed: (value: number) => void;
  setTemperature: (value: number) => void;
  setTint: (value: number) => void;
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

export interface HardwareStore extends HardwareState, HardwareActions {}

export interface EffectsState {
  grainIntensity: SharedValue<number>;
  grainChroma: SharedValue<number>;
  grainSize: SharedValue<number>;
  saturation: SharedValue<number>;
  contrast: SharedValue<number>;
  chromaticAberration: SharedValue<number>;
  aberrationDirection: SharedValue<number>;
  grainEnabled: SharedValue<boolean>;
  noiseReductionAuto: SharedValue<boolean>;
  noiseReductionMode: SharedValue<number>;
  sharpening: SharedValue<number>;
}

export interface EffectsActions {
  setGrainIntensity: (value: number) => void;
  setGrainChroma: (value: number) => void;
  setGrainSize: (value: number) => void;
  setSaturation: (value: number) => void;
  setContrast: (value: number) => void;
  setChromaticAberration: (value: number) => void;
  setAberrationDirection: (value: number) => void;
  setGrainEnabled: (value: boolean) => void;
  setNoiseReductionAuto: (value: boolean) => void;
  setNoiseReductionMode: (mode: number) => void;
  setSharpening: (value: number) => void;
  resetEffect: (effect: string) => void;
}

export interface EffectsStore extends EffectsState, EffectsActions {}
