import { useEffect, useRef } from 'react';
import { NativeRendererRef } from '@entities/lens';
import { useCameraStore } from '@entities/camera';

export const useCameraCapture = () => {
  const cameraRef = useRef<NativeRendererRef>(null);
  const isCapturing = useCameraStore(state => state.isCapturing);

  useEffect(() => {
    if (isCapturing && cameraRef.current) {
      cameraRef.current.takePhoto();
    }
  }, [isCapturing]);

  return cameraRef;
};
