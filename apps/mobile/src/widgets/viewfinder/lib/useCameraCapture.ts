import { useEffect, useRef } from 'react';
import { NativeRendererRef } from '@entities/lens/ui/NativeRenderer';
import { useSystemStore } from '@entities/system';
import { useFilmStore } from '@entities/film';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';

export const useCameraCapture = () => {
  const cameraRef = useRef<NativeRendererRef>(null);
  const isCapturing = useSystemStore(state => state.isCapturing);
  const { noiseReductionAuto, noiseReductionMode } = useFilmStore();

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
