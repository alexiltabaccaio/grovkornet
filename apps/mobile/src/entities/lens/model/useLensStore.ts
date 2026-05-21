import { create } from 'zustand';
import { makeMutable } from 'react-native-reanimated';
import { logger } from '@shared/lib/logger';
import { LensStore } from './types';

export const useLensStore = create<LensStore>((set, get) => ({
  focusDistance: makeMutable(0),
  focusAuto: makeMutable(true),
  cameraId: '',
  cameraAuto: true,
  capabilities: {
    supportsFocus: true,
    availableCameras: [],
  },

  setFocusDistance: (value) => {
    logger.debug('LensStore', `Setting Focus Distance: ${value}`);
    get().focusDistance.value = value;
    get().focusAuto.value = false;
  },
  setFocusAuto: (value) => {
    get().focusAuto.value = value;
  },
  setCameraId: (value) => {
    set({ cameraId: value });
  },
  setCameraAuto: (value) => {
    logger.debug('LensStore', `Setting Camera Auto: ${value}`);
    set({ cameraAuto: value });
  },
  setCapabilities: (caps) => {
    logger.info('LensStore', 'Hardware capabilities updated for Lens');
    set((state) => ({
      capabilities: {
        ...state.capabilities,
        ...caps,
      }
    }));
  },
}));
