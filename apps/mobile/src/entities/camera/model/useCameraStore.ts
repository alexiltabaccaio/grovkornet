import { create } from 'zustand';

export interface CameraState {
  isCapturing: boolean;
  isCameraSecure: boolean;
  isTorchOn: boolean;
  thermalState: 'normal' | 'warning' | 'critical';
  isLowRam: boolean;
}

export interface CameraActions {
  triggerCapture: () => void;
  setIsCameraSecure: (isCameraSecure: boolean) => void;
  setIsTorchOn: (isTorchOn: boolean) => void;
  setThermalState: (state: 'normal' | 'warning' | 'critical') => void;
  setIsLowRam: (isLowRam: boolean) => void;
}

export interface CameraStore extends CameraState, CameraActions {}

export const useCameraStore = create<CameraStore>()((set) => ({
  // State
  isCapturing: false,
  isCameraSecure: true,
  isTorchOn: false,
  thermalState: 'normal',
  isLowRam: false,

  // Actions
  triggerCapture: () => {
    set({ isCapturing: true });
    // Reset after animation
    setTimeout(() => {
      set({ isCapturing: false });
    }, 350);
  },
  setIsCameraSecure: (isCameraSecure) => {
    set({ isCameraSecure });
  },
  setIsTorchOn: (isTorchOn) => {
    set({ isTorchOn });
  },
  setThermalState: (thermalState) => {
    set({ thermalState });
  },
  setIsLowRam: (isLowRam) => {
    set({ isLowRam });
  },
}));
