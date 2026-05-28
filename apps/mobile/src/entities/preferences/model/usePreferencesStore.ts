import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createZustandMMKVStorage } from '@shared/lib/storage/mmkv';

interface PreferencesState {
  fpsSetting: number | null;
  resolutionSetting: number | null;
  aspectRatio: number | null;
  force4k60fpsCrop: number | null;
  language: string | null;
  cameraId: string | null;
  cameraAuto: boolean | null;
  focusDistance: number | null;
  focusAuto: boolean | null;
  hapticsEnabled: boolean | null;
}

interface PreferencesActions {
  setFpsSettingPref: (val: number) => void;
  setResolutionSettingPref: (val: number) => void;
  setAspectRatioPref: (val: number) => void;
  setForce4k60fpsCropPref: (val: number) => void;
  setLanguagePref: (val: string) => void;
  setCameraIdPref: (val: string) => void;
  setCameraAutoPref: (val: boolean) => void;
  setFocusDistancePref: (val: number) => void;
  setFocusAutoPref: (val: boolean) => void;
  setHapticsEnabledPref: (val: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState & PreferencesActions>()(
  persist(
    (set) => ({
      fpsSetting: null,
      resolutionSetting: null,
      aspectRatio: null,
      force4k60fpsCrop: null,
      language: null,
      cameraId: null,
      cameraAuto: null,
      focusDistance: null,
      focusAuto: null,
      hapticsEnabled: null,

      setFpsSettingPref: (val) => set({ fpsSetting: val }),
      setResolutionSettingPref: (val) => set({ resolutionSetting: val }),
      setAspectRatioPref: (val) => set({ aspectRatio: val }),
      setForce4k60fpsCropPref: (val) => set({ force4k60fpsCrop: val }),
      setLanguagePref: (val) => set({ language: val }),
      setCameraIdPref: (val) => set({ cameraId: val }),
      setCameraAutoPref: (val) => set({ cameraAuto: val }),
      setFocusDistancePref: (val) => set({ focusDistance: val }),
      setFocusAutoPref: (val) => set({ focusAuto: val }),
      setHapticsEnabledPref: (val) => set({ hapticsEnabled: val }),
    }),
    {
      name: 'grovkornet-preferences-storage',
      storage: createJSONStorage(() => createZustandMMKVStorage('grovkornet-global-preferences')),
    }
  )
);
