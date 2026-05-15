import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { requireNativeComponent, ViewProps, UIManager, findNodeHandle } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';

interface NativeFilmCameraProps extends ViewProps {
  saturation: number | SharedValue<number>;
  contrast: number | SharedValue<number>;
  grainIntensity: number | SharedValue<number>;
  grainChroma: number | SharedValue<number>;
  grainSize: number | SharedValue<number>;
  grainEnabled: boolean | SharedValue<boolean>;
  chromaticAberration: number | SharedValue<number>;
  aberrationDirection: number | SharedValue<number>;
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
  torchState?: number | SharedValue<number>;
  torchStrength?: number | SharedValue<number>;
  onDebugUpdate?: (event: { nativeEvent: { fps: number; hwFps: number; resolution: string } }) => void;
  onExposureUpdate?: (event: { nativeEvent: { iso: number; shutterSpeed: number; focusDistance?: number } }) => void;
  onCapabilitiesUpdate?: (event: { nativeEvent: { 
    supportsFocus: boolean; 
    isoMin?: number; 
    isoMax?: number;
    availableCameras: Array<{ id: string; focalLength: number; focalLength35mm: number }>;
  } }) => void;
  onPhotoCaptured?: (event: { nativeEvent: { uri: string } }) => void;
}

const NativeFilmCameraBase = requireNativeComponent<NativeFilmCameraProps>('NativeFilmCamera');
const AnimatedNativeFilmCamera = Animated.createAnimatedComponent(NativeFilmCameraBase);

export interface NativeFilmCameraRef {
  takePhoto: () => void;
}

export const NativeFilmCamera = forwardRef<NativeFilmCameraRef, NativeFilmCameraProps>((props, ref) => {
  const nativeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    takePhoto: () => {
      const handle = findNodeHandle(nativeRef.current);
      if (handle) {
        UIManager.dispatchViewManagerCommand(handle, 'takePhoto', []);
      }
    },
  }));

  return <AnimatedNativeFilmCamera {...props} ref={nativeRef} />;
});

NativeFilmCamera.displayName = 'NativeFilmCamera';
