import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'grovkornet-global-preferences' });

const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    storage.set(name, value);
  },
  getItem: (name) => {
    return storage.getString(name) ?? null;
  },
  removeItem: (name) => {
    storage.remove(name);
  },
};

interface PreferencesState {
  fpsSetting: number | null;
  resolutionSetting: number | null;
  aspectRatio: number | null;
  language: string | null;
}

interface PreferencesActions {
  setFpsSettingPref: (val: number) => void;
  setResolutionSettingPref: (val: number) => void;
  setAspectRatioPref: (val: number) => void;
  setLanguagePref: (val: string) => void;
}

export const usePreferencesStore = create<PreferencesState & PreferencesActions>()(
  persist(
    (set) => ({
      fpsSetting: null,
      resolutionSetting: null,
      aspectRatio: null,
      language: null,

      setFpsSettingPref: (val) => set({ fpsSetting: val }),
      setResolutionSettingPref: (val) => set({ resolutionSetting: val }),
      setAspectRatioPref: (val) => set({ aspectRatio: val }),
      setLanguagePref: (val) => set({ language: val }),
    }),
    {
      name: 'grovkornet-preferences-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
