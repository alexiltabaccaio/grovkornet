// ⚠️ AI WARNING: Before modifying this global state store, query the dependency graph: node packages/shared/scripts/graphrag/query.js <query>
import { create } from 'zustand';

export const IS_SECURE_CAMERA_ENABLED = false;

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
  isCameraSecure: IS_SECURE_CAMERA_ENABLED,
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
