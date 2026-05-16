import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import Animated from 'react-native-reanimated';
import { NativeFilmCameraView, NativeFilmCameraViewProps } from '../../../../modules/native-film-camera';

const AnimatedNativeFilmCamera = Animated.createAnimatedComponent(NativeFilmCameraView);

export interface NativeFilmCameraRef {
  takePhoto: () => void;
}

export const NativeFilmCamera = forwardRef<NativeFilmCameraRef, NativeFilmCameraViewProps>((props, ref) => {
  const nativeRef = useRef<React.ElementRef<typeof NativeFilmCameraView>>(null);

  useImperativeHandle(ref, () => ({
    takePhoto: () => {
      // In Expo Modules, we can call functions directly if exported as AsyncFunction
      // But for a View component, we might need a ref to the view instance.
      // In Expo Modules API, we can use the 'nativeRef' to call functions.
      const nativeView = nativeRef.current as unknown as Record<string, () => void>;
      nativeView?.takePhoto?.();
    },
  }));

  return <AnimatedNativeFilmCamera {...(props)} ref={nativeRef} />;
});

NativeFilmCamera.displayName = 'NativeFilmCamera';
