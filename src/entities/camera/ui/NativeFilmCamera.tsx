import { requireNativeComponent, ViewProps } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';

interface NativeFilmCameraProps extends ViewProps {
  saturation: number | SharedValue<number>;
  contrast: number | SharedValue<number>;
  grainIntensity: number | SharedValue<number>;
  grainChroma: number | SharedValue<number>;
  grainSize: number | SharedValue<number>;
  grainEnabled: boolean | SharedValue<boolean>;
  chromaticAberration: number | SharedValue<number>;
  isoAuto?: boolean | SharedValue<boolean>;
  shutterSpeedAuto?: boolean | SharedValue<boolean>;
  whiteBalanceAuto?: boolean | SharedValue<boolean>;
  autoFocus?: boolean | SharedValue<boolean>;
  iso?: number | SharedValue<number>;
  exposureTime?: number | SharedValue<number>;
  ev?: number | SharedValue<number>;
  whiteBalance?: number | SharedValue<number>;
  focusDistance?: number | SharedValue<number>;
  cameraId?: string | SharedValue<string>;
  onDebugUpdate?: (event: { nativeEvent: { fps: number; resolution: string } }) => void;
  onExposureUpdate?: (event: { nativeEvent: { iso: number; shutterSpeed: number; focusDistance: number } }) => void;
  onCapabilitiesUpdate?: (event: { nativeEvent: { 
    supportsFocus: boolean; 
    isoMin?: number; 
    isoMax?: number;
    availableCameras: Array<{ id: string; focalLength: number; focalLength35mm: number }>;
  } }) => void;
}

const NativeFilmCameraBase = requireNativeComponent<NativeFilmCameraProps>('NativeFilmCamera');
export const NativeFilmCamera = Animated.createAnimatedComponent(NativeFilmCameraBase) as React.ComponentType<NativeFilmCameraProps>;





