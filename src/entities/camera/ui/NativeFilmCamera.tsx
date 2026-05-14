import { requireNativeComponent, ViewProps } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';

interface NativeFilmCameraProps extends ViewProps {
  saturation: number | SharedValue<number>;
  contrast: number | SharedValue<number>;
  grainIntensity: number | SharedValue<number>;
  grainEnabled: boolean | SharedValue<boolean>;
  chromaticAberration: number | SharedValue<number>;
  autoExposure?: boolean | SharedValue<boolean>;
  autoFocus?: boolean | SharedValue<boolean>;
  iso?: number | SharedValue<number>;
  exposureTime?: number | SharedValue<number>;
  ev?: number | SharedValue<number>;
  whiteBalance?: number | SharedValue<number>;
  focusDistance?: number | SharedValue<number>;
  onDebugUpdate?: (event: { nativeEvent: { fps: number; resolution: string } }) => void;
}

const NativeFilmCameraBase = requireNativeComponent<NativeFilmCameraProps>('NativeFilmCamera');
export const NativeFilmCamera = Animated.createAnimatedComponent(NativeFilmCameraBase) as React.ComponentType<NativeFilmCameraProps>;





