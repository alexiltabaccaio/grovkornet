import { SharedValue } from 'react-native-reanimated';

export interface LensCapabilities {
  supportsFocus: boolean;
  availableCameras: Array<{
    id: string;
    focalLength: number;
    focalLength35mm: number;
  }>;
}

interface LensState {
  cameraAuto: boolean;
  chromaticAberration: SharedValue<number>;
  aberrationDirection: SharedValue<number>;
  bloomEnabled: SharedValue<boolean>;
  bloomIntensity: SharedValue<number>;
  // @@GEN_STATE_START@@
  focusAuto: SharedValue<boolean>;
  focusDistance: SharedValue<number>;
  cameraId: string;
  // @@GEN_STATE_END@@
  capabilities: LensCapabilities;
}

interface LensActions {
  setCameraAuto: (value: boolean) => void;
  // @@GEN_ACTIONS_START@@
  setFocusAuto: (value: boolean) => void;
  setFocusDistance: (value: number) => void;
  setCameraId: (value: string) => void;
  // @@GEN_ACTIONS_END@@
  setCapabilities: (capabilities: LensCapabilities) => void;
}

export interface LensStore extends LensState, LensActions {}
