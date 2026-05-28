import { create } from 'zustand';
import { makeMutable } from 'react-native-reanimated';
import { logger } from '@shared/lib/logger';
import { usePreferencesStore } from '@entities/preferences';
import { LensStore } from './types';

export const useLensStore = create<LensStore>((set, get) => ({
  focusDistance: makeMutable(0),
  focusAuto: makeMutable(true),
  cameraId: '',
  cameraAuto: true,
  chromaticAberration: makeMutable(0),
  aberrationDirection: makeMutable(0),
  bloomEnabled: makeMutable(false),
  bloomIntensity: makeMutable(0),
  capabilities: {
    supportsFocus: true,
    availableCameras: [],
  },

  setFocusDistance: (value) => {
    logger.debug('LensStore', `Setting Focus Distance: ${value}`);
    get().focusDistance.value = value;
    get().focusAuto.value = false;
    usePreferencesStore.getState().setFocusDistancePref(value);
    usePreferencesStore.getState().setFocusAutoPref(false);
  },
  setFocusAuto: (value) => {
    get().focusAuto.value = value;
    usePreferencesStore.getState().setFocusAutoPref(value);
  },
  setCameraId: (value) => {
    set({ cameraId: value });
    usePreferencesStore.getState().setCameraIdPref(value);
  },
  setCameraAuto: (value) => {
    logger.debug('LensStore', `Setting Camera Auto: ${value}`);
    set({ cameraAuto: value });
    usePreferencesStore.getState().setCameraAutoPref(value);
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
