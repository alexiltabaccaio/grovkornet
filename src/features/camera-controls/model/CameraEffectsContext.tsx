import React, { createContext, useContext, ReactNode } from 'react';
import { DrawableFrameProcessor } from 'react-native-vision-camera';
import { CameraEffectState } from '@shared/types/camera';
import { useCameraEffects } from './useCameraEffects';

interface CameraEffectsContextValue extends CameraEffectState {
  frameProcessor: DrawableFrameProcessor;
}

const CameraEffectsContext = createContext<CameraEffectsContextValue | null>(null);

export const CameraEffectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const effects = useCameraEffects();

  return (
    <CameraEffectsContext.Provider value={effects}>
      {children}
    </CameraEffectsContext.Provider>
  );
};

export const useCameraEffectsContext = () => {
  const context = useContext(CameraEffectsContext);
  if (!context) {
    throw new Error('useCameraEffectsContext must be used within a CameraEffectsProvider');
  }
  return context;
};
