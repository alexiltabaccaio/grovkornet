import { create } from 'zustand';

interface CameraState {
  // Parametri della fotocamera
  cameraPosition: 'front' | 'back';
  toggleCameraPosition: () => void;
  
  // Parametri dell'effetto visivo
  grainIntensity: number;
  setGrainIntensity: (intensity: number) => void;
  
  // Flash e altre opzioni
  flashMode: 'on' | 'off' | 'auto';
  setFlashMode: (mode: 'on' | 'off' | 'auto') => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  cameraPosition: 'back',
  toggleCameraPosition: () => 
    set((state) => ({ 
      cameraPosition: state.cameraPosition === 'back' ? 'front' : 'back' 
    })),
    
  grainIntensity: 0.5, // Valore di default per la grana (da 0.0 a 1.0)
  setGrainIntensity: (intensity) => set({ grainIntensity: intensity }),
  
  flashMode: 'off',
  setFlashMode: (mode) => set({ flashMode: mode }),
}));
