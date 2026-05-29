import { create } from 'zustand';
import { makeMutable } from 'react-native-reanimated';
import { logger } from '@shared/lib/logger';
import { usePreferencesStore } from '@entities/preferences';
import { LensStore } from './types';

export const useLensStore = create<LensStore>((set, get) => ({
  cameraAuto: true,
  chromaticAberration: makeMutable(0),
  aberrationDirection: makeMutable(0),
  bloomEnabled: makeMutable(false),
  bloomIntensity: makeMutable(0),
  // @@GEN_STATE_START@@
  focusAuto: makeMutable(true),
  focusDistance: makeMutable(0),
  cameraId: "",
  // @@GEN_STATE_END@@
  capabilities: {
    supportsFocus: true,
    availableCameras: [],
  },

  setCameraAuto: (value) => {
    logger.debug('LensStore', `Setting Camera Auto: ${value}`);
    set({ cameraAuto: value });
    usePreferencesStore.getState().setCameraAutoPref(value);
  },
  // @@GEN_SETTERS_START@@
  setFocusAuto: (value) => {
    const { focusAuto } = get();
    focusAuto.value = value;
    usePreferencesStore.getState().setFocusAutoPref(value);

  },
  setFocusDistance: (value) => {
    const { focusDistance, focusAuto } = get();
    logger.debug('LensStore', `Setting Focus Distance: ${value}`);
    focusDistance.value = value;
    focusAuto.value = false;
    usePreferencesStore.getState().setFocusDistancePref(value);
    usePreferencesStore.getState().setFocusAutoPref(false);

  },
  setCameraId: (value) => {
    set({ cameraId: value });
    usePreferencesStore.getState().setCameraIdPref(value);

  },
  // @@GEN_SETTERS_END@@
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
