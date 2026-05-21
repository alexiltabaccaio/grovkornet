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
  focusDistance: SharedValue<number>;
  focusAuto: SharedValue<boolean>;
  cameraId: string;
  cameraAuto: boolean;
  chromaticAberration: SharedValue<number>;
  aberrationDirection: SharedValue<number>;
  bloomEnabled: SharedValue<boolean>;
  bloomIntensity: SharedValue<number>;
  capabilities: LensCapabilities;
}

interface LensActions {
  setFocusDistance: (value: number) => void;
  setFocusAuto: (value: boolean) => void;
  setCameraId: (value: string) => void;
  setCameraAuto: (value: boolean) => void;
  setCapabilities: (capabilities: LensCapabilities) => void;
}

export interface LensStore extends LensState, LensActions {}
