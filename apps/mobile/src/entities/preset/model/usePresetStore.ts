import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import {
  DEFAULT_GRAIN_INTENSITY,
  DEFAULT_SATURATION,
  DEFAULT_CONTRAST,
  DEFAULT_CHROMATIC_ABERRATION,
  DEFAULT_TEMPERATURE,
  DEFAULT_TINT,
  DEFAULT_GRAIN_SPEED,
  DEFAULT_SELECTIVE_SATURATION,
  DEFAULT_BOUND_MAGENTA_RED,
  DEFAULT_BOUND_RED_ORANGE,
  DEFAULT_BOUND_ORANGE_YELLOW,
  DEFAULT_BOUND_YELLOW_GREEN,
  DEFAULT_BOUND_GREEN_CYAN,
  DEFAULT_BOUND_CYAN_BLUE,
  DEFAULT_BOUND_BLUE_PURPLE,
  DEFAULT_BOUND_PURPLE_MAGENTA,
  DEFAULT_ISO,
  DEFAULT_EV,
  DEFAULT_SHUTTER_SPEED,
} from '@grovkornet/shared';
import { Preset, PresetPayload, FilmPresetPayload, BodyPresetPayload } from './types';

// ==========================================
// Default Preset Constants (Runtime)
// ==========================================

export const DEFAULT_FILM_PAYLOAD: FilmPresetPayload = {
  saturation: DEFAULT_SATURATION,
  contrast: DEFAULT_CONTRAST,
  grainIntensity: DEFAULT_GRAIN_INTENSITY,
  grainChroma: 0.0,
  grainSize: 1.0,
  grainSpeed: DEFAULT_GRAIN_SPEED,
  temperature: DEFAULT_TEMPERATURE,
  tint: DEFAULT_TINT,
  bloomIntensity: 0.0,
  chromaticAberration: DEFAULT_CHROMATIC_ABERRATION,
  aberrationDirection: 0,
  sharpening: 0.0,
  satRed: DEFAULT_SELECTIVE_SATURATION,
  satOrange: DEFAULT_SELECTIVE_SATURATION,
  satYellow: DEFAULT_SELECTIVE_SATURATION,
  satGreen: DEFAULT_SELECTIVE_SATURATION,
  satCyan: DEFAULT_SELECTIVE_SATURATION,
  satBlue: DEFAULT_SELECTIVE_SATURATION,
  satPurple: DEFAULT_SELECTIVE_SATURATION,
  satMagenta: DEFAULT_SELECTIVE_SATURATION,
  aberrationInvert: false,
  boundMagentaRed: DEFAULT_BOUND_MAGENTA_RED,
  boundRedOrange: DEFAULT_BOUND_RED_ORANGE,
  boundOrangeYellow: DEFAULT_BOUND_ORANGE_YELLOW,
  boundYellowGreen: DEFAULT_BOUND_YELLOW_GREEN,
  boundGreenCyan: DEFAULT_BOUND_GREEN_CYAN,
  boundCyanBlue: DEFAULT_BOUND_CYAN_BLUE,
  boundBluePurple: DEFAULT_BOUND_BLUE_PURPLE,
  boundPurpleMagenta: DEFAULT_BOUND_PURPLE_MAGENTA,
  grainEnabled: false,
  bloomEnabled: false,
  noiseReductionMode: 1,
  noiseReductionAuto: true,
  temperatureAuto: true,
};

export const DEFAULT_BODY_PAYLOAD: BodyPresetPayload = {
  iso: DEFAULT_ISO,
  ev: DEFAULT_EV,
  shutterSpeed: DEFAULT_SHUTTER_SPEED,
  isoAuto: true,
  shutterSpeedAuto: true,
  evAuto: true,
};

export const DEFAULT_PRESET_PAYLOAD: PresetPayload = {
  film: DEFAULT_FILM_PAYLOAD,
  body: DEFAULT_BODY_PAYLOAD,
};

// ==========================================
// Storage MMKV Configuration (react-native-mmkv v4+ uses createMMKV)
// ==========================================

const storage = createMMKV({ id: 'grovkornet-presets' });

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

// ==========================================
// Store Definition
// ==========================================

interface PresetStoreState {
  userPresets: Preset[];
  activePresetId: string;
  customizedPayload: PresetPayload | null;
  customizedThumbnailUri: string | null;
  isApplyingPreset: boolean;
  isAddModalVisible: boolean;
}

interface PresetStoreActions {
  setActivePresetId: (id: string) => void;
  setCustomizedPayload: (payload: PresetPayload | null) => void;
  setCustomizedThumbnailUri: (uri: string | null) => void;
  setApplyingPreset: (applying: boolean) => void;
  addUserPreset: (preset: Preset) => void;
  removeUserPreset: (id: string) => void;
  setFavoritePreset: (id: string | null) => void;
  toggleQuickSelect: (id: string) => void;
  setAddModalVisible: (visible: boolean) => void;
  getQuickSelectList: () => { id: string; name: string }[];
}

export interface PresetStore extends PresetStoreState, PresetStoreActions {}

export const usePresetStore = create<PresetStore>()(
  persist(
    (set, get) => ({
      // State
      userPresets: [],
      activePresetId: 'default',
      customizedPayload: null,
      customizedThumbnailUri: null,
      isApplyingPreset: false,
      isAddModalVisible: false,

      // Actions
      setActivePresetId: (id: string) => set({ activePresetId: id }),
      setCustomizedPayload: (payload: PresetPayload | null) => set({ customizedPayload: payload }),
      setCustomizedThumbnailUri: (uri: string | null) => set({ customizedThumbnailUri: uri }),
      setApplyingPreset: (applying: boolean) => set({ isApplyingPreset: applying }),
      
      addUserPreset: (preset: Preset) => {
        set((state) => ({
          userPresets: [...state.userPresets, preset],
          activePresetId: preset.id,
          customizedPayload: null, // Reset customized once saved
          customizedThumbnailUri: null,
        }));
      },

      removeUserPreset: (id: string) => {
        set((state) => ({
          userPresets: state.userPresets.filter((p) => p.id !== id),
        }));
      },

      setFavoritePreset: (id: string | null) => {
        const { userPresets } = get();
        const updated = userPresets.map((p) => ({
          ...p,
          isFavorite: p.id === id,
        }));
        set({ userPresets: updated });
      },

      toggleQuickSelect: (id: string) => {
        const { userPresets } = get();
        const preset = userPresets.find((p) => p.id === id);
        if (!preset) return;

        const currentlyPinned = userPresets.filter((p) => p.inQuickSelect).length;
        if (!preset.inQuickSelect && currentlyPinned >= 5) {
          throw new Error('LIMIT_EXCEEDED');
        }

        const updated = userPresets.map((p) => {
          if (p.id === id) {
            return { ...p, inQuickSelect: !p.inQuickSelect };
          }
          return p;
        });

        set({ userPresets: updated });
      },

      getQuickSelectList: () => {
        const { userPresets, customizedPayload } = get();
        const list = [{ id: 'default', name: 'Default' }];
        
        if (customizedPayload) {
          list.push({ id: 'customized', name: 'Personalizzato' });
        }

        userPresets.forEach((p) => {
          if (p.inQuickSelect) {
            list.push({ id: p.id, name: p.name });
          }
        });

        return list;
      },

      setAddModalVisible: (visible: boolean) => {
        set({ isAddModalVisible: visible });
      },
    }),
    {
      name: 'grovkornet-presets-storage',
      storage: createJSONStorage(() => mmkvStorage),
      // Persist only user presets and active preset ID
      partialize: (state) => ({
        userPresets: state.userPresets,
        activePresetId: state.activePresetId === 'customized' ? 'default' : state.activePresetId,
      }),
    }
  )
);
