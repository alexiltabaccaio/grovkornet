import { useEffect, useRef } from 'react';
import { NativeRendererRef } from '@entities/lens';
import { useSystemStore } from '@entities/system';

export const useCameraCapture = () => {
  const cameraRef = useRef<NativeRendererRef>(null);
  const isCapturing = useSystemStore(state => state.isCapturing);

  useEffect(() => {
    if (isCapturing && cameraRef.current) {
      cameraRef.current.takePhoto();
    }
  }, [isCapturing]);

  return cameraRef;
};
