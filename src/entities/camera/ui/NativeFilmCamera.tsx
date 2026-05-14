import React from 'react';
import { requireNativeComponent, ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';

interface NativeFilmCameraProps extends ViewProps {
  saturation: number;
  contrast: number;
  grainIntensity: number;
  grainEnabled: boolean;
  chromaticAberration: number;
  onDebugUpdate?: (event: { nativeEvent: { fps: number; resolution: string } }) => void;
}

const NativeFilmCameraBase = requireNativeComponent<NativeFilmCameraProps>('NativeFilmCamera');
export const NativeFilmCamera = Animated.createAnimatedComponent(NativeFilmCameraBase) as React.ComponentType<NativeFilmCameraProps>;





