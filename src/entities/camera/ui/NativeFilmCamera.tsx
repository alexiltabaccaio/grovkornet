import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import Animated, { AnimateProps } from 'react-native-reanimated';
import { NativeFilmCameraView, NativeFilmCameraViewProps } from '../../../../modules/native-film-camera';

const AnimatedNativeFilmCamera = Animated.createAnimatedComponent(NativeFilmCameraView);

export interface NativeFilmCameraRef {
  takePhoto: () => void;
}

export const NativeFilmCamera = forwardRef<NativeFilmCameraRef, AnimateProps<NativeFilmCameraViewProps>>((props, ref) => {
  // We use any for the internal ref to the animated component to avoid complex Reanimated/Expo type conflicts
  // while still maintaining the public imperative API.
  const nativeRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    takePhoto: () => {
      // Access the native view via the animated ref
      const nativeView = nativeRef.current;
      if (nativeView?.takePhoto) {
        nativeView.takePhoto();
      } else if (nativeView?.getNativeElement?.()?.takePhoto) {
        nativeView.getNativeElement().takePhoto();
      }
    },
  }));

  return <AnimatedNativeFilmCamera {...(props as any)} ref={nativeRef} />;
});

NativeFilmCamera.displayName = 'NativeFilmCamera';
