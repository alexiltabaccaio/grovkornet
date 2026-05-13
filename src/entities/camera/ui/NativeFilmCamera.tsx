import { requireNativeComponent, ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';

interface NativeFilmCameraProps extends ViewProps {
  saturation: number;
  contrast: number;
  grainIntensity: number;
  grainEnabled: boolean;
  chromaticAberration: number;
}

const NativeFilmCameraBase = requireNativeComponent<NativeFilmCameraProps>('NativeFilmCamera');
// @ts-ignore
export const NativeFilmCamera = Animated.createAnimatedComponent(NativeFilmCameraBase) as any;


