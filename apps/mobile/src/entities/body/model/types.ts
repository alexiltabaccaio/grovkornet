import { SharedValue } from 'react-native-reanimated';

export interface BodyCapabilities {
  hasTorch?: boolean;
  maxTorchStrength?: number;
  isoMin?: number;
  isoMax?: number;
  maxFps?: number;
  minZoom?: number;
  maxZoom?: number;
  maxResolutionWidth?: number;
}

interface BodyState {
  fps: SharedValue<number>;
  hwFps: SharedValue<number>;
  resolution: SharedValue<string>;
  evAuto: SharedValue<boolean>;
  // @@GEN_STATE_START@@
  ev: SharedValue<number>;
  fpsSetting: SharedValue<number>;
  aspectRatio: SharedValue<number>;
  isoAuto: SharedValue<boolean>;
  shutterSpeedAuto: SharedValue<boolean>;
  iso: SharedValue<number>;
  shutterSpeed: SharedValue<number>;
  torchState: SharedValue<number>;
  torchStrength: SharedValue<number>;
  resolutionSetting: SharedValue<number>;
  previewQuality: SharedValue<number>;
  force4k60fpsCrop: SharedValue<number>;
  zoom: SharedValue<number>;
  // @@GEN_STATE_END@@
  capabilities: BodyCapabilities;
}

interface BodyActions {
  setDebugInfo: (fps: number, resolution: string, hwFps: number) => void;
  setEvAuto: (value: boolean) => void;
  // @@GEN_ACTIONS_START@@
  setEv: (value: number) => void;
  setFpsSetting: (value: number) => void;
  setAspectRatio: (value: number) => void;
  setIsoAuto: (value: boolean) => void;
  setShutterSpeedAuto: (value: boolean) => void;
  setIso: (value: number) => void;
  setShutterSpeed: (value: number) => void;
  setTorchState: (value: number) => void;
  setTorchStrength: (value: number) => void;
  setResolutionSetting: (value: number) => void;
  setPreviewQuality: (value: number) => void;
  setForce4k60fpsCrop: (value: number) => void;
  setZoom: (value: number) => void;
  // @@GEN_ACTIONS_END@@
  setCapabilities: (capabilities: BodyCapabilities) => void;
}

export interface BodyStore extends BodyState, BodyActions {}
