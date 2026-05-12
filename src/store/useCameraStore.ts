import { create } from 'zustand';

interface CameraState {
  // Camera parameters
  cameraPosition: 'front' | 'back';
  toggleCameraPosition: () => void;
  
  // Flash and other options
  flashMode: 'on' | 'off' | 'auto';
  setFlashMode: (mode: 'on' | 'off' | 'auto') => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  cameraPosition: 'back',
  toggleCameraPosition: () => 
    set((state) => ({ 
      cameraPosition: state.cameraPosition === 'back' ? 'front' : 'back' 
    })),
    
  flashMode: 'off',
  setFlashMode: (mode) => set({ flashMode: mode }),
}));
