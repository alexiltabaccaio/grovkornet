import { useEffect, useRef } from 'react';
import { NativeFilmCameraRef } from '@entities/camera/ui/NativeFilmCamera';
import { useUIStore } from '../model/useUIStore';
import { useStylesStore } from '../model/useStylesStore';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';

export const useCameraCapture = () => {
  const cameraRef = useRef<NativeFilmCameraRef>(null);
  const isCapturing = useUIStore(state => state.isCapturing);
  const { noiseReductionAuto, noiseReductionMode } = useStylesStore();

  useEffect(() => {
    if (isCapturing && cameraRef.current) {
      cameraRef.current.takePhoto();
      
      if (noiseReductionAuto.value) {
        updateSharedValue(noiseReductionMode, 2);
      }
    }
  }, [isCapturing, noiseReductionAuto, noiseReductionMode]);

  return cameraRef;
};
