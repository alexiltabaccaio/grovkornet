import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import { useFilmStore, setFilmParameterChangeListener } from '@entities/film';
import { useBodyStore, setBodyParameterChangeListener } from '@entities/body';
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
  isApplyingPreset: boolean;
  isAddModalVisible: boolean;
}

interface PresetStoreActions {
  addPreset: (name: string) => void;
  removePreset: (id: string) => void;
  setFavoritePreset: (id: string | null) => void;
  toggleQuickSelect: (id: string) => void;
  applyPreset: (id: string) => void;
  markAsCustomized: () => void;
  getQuickSelectList: () => { id: string; name: string }[];
  nextQuickPreset: () => void;
  prevQuickPreset: () => void;
  setAddModalVisible: (visible: boolean) => void;
}

export interface PresetStore extends PresetStoreState, PresetStoreActions {}

export const usePresetStore = create<PresetStore>()(
  persist(
    (set, get) => ({
      // State
      userPresets: [],
      activePresetId: 'default',
      customizedPayload: null,
      isApplyingPreset: false,
      isAddModalVisible: false,

      // Actions
      addPreset: (name: string) => {
        const { customizedPayload, userPresets } = get();
        let payload = customizedPayload;

        if (!payload) {
          // If no customized payload, snapshot the current active state
          const filmStore = useFilmStore.getState();
          const bodyStore = useBodyStore.getState();

          const filmPayload: any = {};
          Object.keys(DEFAULT_FILM_PAYLOAD).forEach((key) => {
            const k = key as keyof FilmPresetPayload;
            const val = filmStore[k];
            filmPayload[k] = val && typeof val === 'object' && 'value' in val
              ? (val as any).value
              : DEFAULT_FILM_PAYLOAD[k];
          });

          const bodyPayload: any = {};
          Object.keys(DEFAULT_BODY_PAYLOAD).forEach((key) => {
            const k = key as keyof BodyPresetPayload;
            const val = bodyStore[k];
            bodyPayload[k] = val && typeof val === 'object' && 'value' in val
              ? (val as any).value
              : DEFAULT_BODY_PAYLOAD[k];
          });

          payload = {
            film: filmPayload as FilmPresetPayload,
            body: bodyPayload as BodyPresetPayload,
          };
        }

        const newPreset: Preset = {
          id: Date.now().toString(),
          name,
          payload,
          isFavorite: false,
          inQuickSelect: false,
          createdAt: Date.now(),
        };

        set({
          userPresets: [...userPresets, newPreset],
          activePresetId: newPreset.id,
          customizedPayload: null, // Reset customized once saved
        });
      },

      removePreset: (id: string) => {
        const { userPresets, activePresetId } = get();
        const updated = userPresets.filter((p) => p.id !== id);
        
        set({ userPresets: updated });

        if (activePresetId === id) {
          get().applyPreset('default');
        }
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

      applyPreset: (id: string) => {
        const { userPresets, customizedPayload } = get();
        let payload: PresetPayload | null = null;

        if (id === 'default') {
          payload = DEFAULT_PRESET_PAYLOAD;
        } else if (id === 'customized') {
          payload = customizedPayload;
        } else {
          const preset = userPresets.find((p) => p.id === id);
          if (preset) {
            payload = preset.payload;
          }
        }

        if (!payload) return;

        set({ isApplyingPreset: true, activePresetId: id });

        // Safe Merge & direct update of Film shared values
        const filmStore = useFilmStore.getState();
        const targetFilm = { ...DEFAULT_FILM_PAYLOAD, ...payload.film };
        Object.keys(targetFilm).forEach((key) => {
          const k = key as keyof FilmPresetPayload;
          if (filmStore[k] && typeof filmStore[k] === 'object' && 'value' in filmStore[k]) {
            (filmStore[k] as any).value = targetFilm[k];
          }
        });

        // Safe Merge & direct update of Body shared values
        const bodyStore = useBodyStore.getState();
        const targetBody = { ...DEFAULT_BODY_PAYLOAD, ...payload.body };
        Object.keys(targetBody).forEach((key) => {
          const k = key as keyof BodyPresetPayload;
          if (bodyStore[k] && typeof bodyStore[k] === 'object' && 'value' in bodyStore[k]) {
            (bodyStore[k] as any).value = targetBody[k];
          }
        });

        set({ isApplyingPreset: false });
      },

      markAsCustomized: () => {
        const { activePresetId, isApplyingPreset } = get();
        if (isApplyingPreset) return;

        const filmStore = useFilmStore.getState();
        const bodyStore = useBodyStore.getState();

        const filmPayload: any = {};
        Object.keys(DEFAULT_FILM_PAYLOAD).forEach((key) => {
          const k = key as keyof FilmPresetPayload;
          const val = filmStore[k];
          filmPayload[k] = val && typeof val === 'object' && 'value' in val
            ? (val as any).value
            : DEFAULT_FILM_PAYLOAD[k];
        });

        const bodyPayload: any = {};
        Object.keys(DEFAULT_BODY_PAYLOAD).forEach((key) => {
          const k = key as keyof BodyPresetPayload;
          const val = bodyStore[k];
          bodyPayload[k] = val && typeof val === 'object' && 'value' in val
            ? (val as any).value
            : DEFAULT_BODY_PAYLOAD[k];
        });

        const payload: PresetPayload = {
          film: filmPayload as FilmPresetPayload,
          body: bodyPayload as BodyPresetPayload,
        };

        set({
          activePresetId: 'customized',
          customizedPayload: payload,
        });
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

      nextQuickPreset: () => {
        const list = get().getQuickSelectList();
        if (list.length <= 1) return;
        const currentIndex = list.findIndex((p) => p.id === get().activePresetId);
        const nextIndex = (currentIndex + 1) % list.length;
        get().applyPreset(list[nextIndex].id);
      },

      prevQuickPreset: () => {
        const list = get().getQuickSelectList();
        if (list.length <= 1) return;
        const currentIndex = list.findIndex((p) => p.id === get().activePresetId);
        const prevIndex = (currentIndex - 1 + list.length) % list.length;
        get().applyPreset(list[prevIndex].id);
      },

      setAddModalVisible: (visible: boolean) => {
        set({ isAddModalVisible: visible });
      },
    }),
    {
      name: 'grovkornet-presets-storage',
      storage: createJSONStorage(() => mmkvStorage),
      // Persist only user presets and active preset ID (active preset ID can be 'default' or a user preset ID)
      partialize: (state) => ({
        userPresets: state.userPresets,
        activePresetId: state.activePresetId === 'customized' ? 'default' : state.activePresetId,
      } as any),
    }
  )
);

// Register listeners to mark preset as customized on manual changes
if (typeof setFilmParameterChangeListener === 'function') {
  setFilmParameterChangeListener(() => {
    usePresetStore.getState().markAsCustomized();
  });
}
if (typeof setBodyParameterChangeListener === 'function') {
  setBodyParameterChangeListener(() => {
    usePresetStore.getState().markAsCustomized();
  });
}

