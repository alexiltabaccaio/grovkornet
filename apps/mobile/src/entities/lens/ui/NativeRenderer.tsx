import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import Animated, { AnimateProps } from 'react-native-reanimated';
import { NativeFilmCameraView, NativeFilmCameraViewProps } from '@grovkornet/engine';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
const AnimatedNativeFilmCamera = Animated.createAnimatedComponent(NativeFilmCameraView) as any;

export interface NativeRendererRef {
  takePhoto: () => void;
}

interface InternalNativeRef {
  takePhoto?: () => void;
  getNativeElement?: () => { takePhoto: () => void };
}

export const NativeRenderer = forwardRef<NativeRendererRef, AnimateProps<NativeFilmCameraViewProps>>((props, ref) => {
  const nativeRef = useRef<InternalNativeRef>(null);

  useImperativeHandle(ref, () => ({
    takePhoto: () => {
      const nativeView = nativeRef.current;
      if (nativeView?.takePhoto) {
        nativeView.takePhoto();
      } else {
        nativeView?.getNativeElement?.()?.takePhoto();
      }
    },
  }));

  return <AnimatedNativeFilmCamera {...props} ref={nativeRef} />;
});

NativeRenderer.displayName = 'NativeRenderer';
