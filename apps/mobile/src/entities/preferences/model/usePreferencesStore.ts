// ⚠️ AI WARNING: Before modifying this global state store, query the dependency graph: node packages/shared/scripts/graphrag/query.js <query>
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createZustandMMKVStorage } from '@shared/lib/storage/mmkv';

interface PreferencesState {
  fpsSetting: number | null;
  resolutionSetting: number | null;
  aspectRatio: number | null;
  force60fpsCrop: number | null;
  language: string | null;
  cameraId: string | null;
  cameraAuto: boolean | null;
  focusDistance: number | null;
  focusAuto: boolean | null;
  hapticsEnabled: boolean | null;
  previewQuality: number | null;
}

interface PreferencesActions {
  setFpsSettingPref: (val: number) => void;
  setResolutionSettingPref: (val: number) => void;
  setAspectRatioPref: (val: number) => void;
  setForce60fpsCropPref: (val: number) => void;
  setLanguagePref: (val: string) => void;
  setCameraIdPref: (val: string) => void;
  setCameraAutoPref: (val: boolean) => void;
  setFocusDistancePref: (val: number) => void;
  setFocusAutoPref: (val: boolean) => void;
  setHapticsEnabledPref: (val: boolean) => void;
  setPreviewQualityPref: (val: number) => void;
}

export const usePreferencesStore = create<PreferencesState & PreferencesActions>()(
  persist(
    (set) => ({
      fpsSetting: null,
      resolutionSetting: null,
      aspectRatio: 1,
      force60fpsCrop: 1,
      language: null,
      cameraId: null,
      cameraAuto: null,
      focusDistance: null,
      focusAuto: null,
      hapticsEnabled: null,
      previewQuality: null,

      setFpsSettingPref: (val) => set({ fpsSetting: val }),
      setResolutionSettingPref: (val) => set({ resolutionSetting: val }),
      setAspectRatioPref: (val) => set({ aspectRatio: val }),
      setForce60fpsCropPref: (val) => set({ force60fpsCrop: val }),
      setLanguagePref: (val) => set({ language: val }),
      setCameraIdPref: (val) => set({ cameraId: val }),
      setCameraAutoPref: (val) => set({ cameraAuto: val }),
      setFocusDistancePref: (val) => set({ focusDistance: val }),
      setFocusAutoPref: (val) => set({ focusAuto: val }),
      setHapticsEnabledPref: (val) => set({ hapticsEnabled: val }),
      setPreviewQualityPref: (val) => set({ previewQuality: val }),
    }),
    {
      name: 'grovkornet-preferences-storage',
      storage: createJSONStorage(() => createZustandMMKVStorage('grovkornet-global-preferences')),
      merge: (persistedState: unknown, currentState: PreferencesState & PreferencesActions) => {
        // Startup State Hygiene (Rehydration)
        // Local storage is not reliable, so we sanitize the persisted data
        // before merging it into the initial in-memory state.
        const state = (persistedState || {}) as Partial<PreferencesState>;
        
        return {
          ...currentState,
          fpsSetting: typeof state.fpsSetting === 'number' ? state.fpsSetting : currentState.fpsSetting,
          resolutionSetting: typeof state.resolutionSetting === 'number' ? state.resolutionSetting : currentState.resolutionSetting,
          aspectRatio: typeof state.aspectRatio === 'number' ? state.aspectRatio : currentState.aspectRatio,
          force60fpsCrop: typeof state.force60fpsCrop === 'number' ? state.force60fpsCrop : currentState.force60fpsCrop,
          language: typeof state.language === 'string' ? state.language : currentState.language,
          cameraId: typeof state.cameraId === 'string' && state.cameraId !== '' ? state.cameraId : currentState.cameraId,
          cameraAuto: typeof state.cameraAuto === 'boolean' ? state.cameraAuto : currentState.cameraAuto,
          focusDistance: typeof state.focusDistance === 'number' ? state.focusDistance : currentState.focusDistance,
          focusAuto: typeof state.focusAuto === 'boolean' ? state.focusAuto : currentState.focusAuto,
          hapticsEnabled: typeof state.hapticsEnabled === 'boolean' ? state.hapticsEnabled : currentState.hapticsEnabled,
          previewQuality: typeof state.previewQuality === 'number' ? state.previewQuality : currentState.previewQuality,
        };
      },
    }
  )
);
