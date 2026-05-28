import { SharedValue } from 'react-native-reanimated';

export interface BodyCapabilities {
  hasTorch?: boolean;
  maxTorchStrength?: number;
  isoMin?: number;
  isoMax?: number;
  maxFps?: number;
}

interface BodyState {
  fps: SharedValue<number>;
  hwFps: SharedValue<number>;
  resolution: SharedValue<string>;
  iso: SharedValue<number>;
  ev: SharedValue<number>;
  shutterSpeed: SharedValue<number>;
  isoAuto: SharedValue<boolean>;
  shutterSpeedAuto: SharedValue<boolean>;
  evAuto: SharedValue<boolean>;
  torchState: SharedValue<number>;
  torchStrength: SharedValue<number>;
  aspectRatio: SharedValue<number>;
  resolutionSetting: SharedValue<number>;
  fpsSetting: SharedValue<number>;
  previewIn4k: SharedValue<number>;
  force4k60fpsCrop: SharedValue<number>;
  capabilities: BodyCapabilities;
}

interface BodyActions {
  setDebugInfo: (fps: number, resolution: string, hwFps: number) => void;
  setIso: (value: number) => void;
  setEv: (value: number) => void;
  setShutterSpeed: (value: number) => void;
  setIsoAuto: (value: boolean) => void;
  setShutterSpeedAuto: (value: boolean) => void;
  setEvAuto: (value: boolean) => void;
  setTorchState: (value: number) => void;
  setTorchStrength: (value: number) => void;
  setAspectRatio: (value: number) => void;
  setResolutionSetting: (value: number) => void;
  setFpsSetting: (value: number) => void;
  setPreviewIn4k: (value: number) => void;
  setForce4k60fpsCrop: (value: number) => void;
  setCapabilities: (capabilities: BodyCapabilities) => void;
}

export interface BodyStore extends BodyState, BodyActions {}
