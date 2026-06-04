import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createZustandMMKVStorage } from '@shared/lib/storage/mmkv';
import i18n from 'i18next';
import {
  // @@GEN_IMPORTS_START@@
  DEFAULT_ABERRATION_INVERT,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_BLACK_LEVEL,
  DEFAULT_BLACK_LEVEL_AUTO,
  DEFAULT_BLOOM_ENABLED,
  DEFAULT_BLOOM_INTENSITY,
  DEFAULT_BOUND_BLUE_PURPLE,
  DEFAULT_BOUND_CYAN_BLUE,
  DEFAULT_BOUND_GREEN_CYAN,
  DEFAULT_BOUND_MAGENTA_RED,
  DEFAULT_BOUND_ORANGE_YELLOW,
  DEFAULT_BOUND_PURPLE_MAGENTA,
  DEFAULT_BOUND_RED_ORANGE,
  DEFAULT_BOUND_YELLOW_GREEN,
  DEFAULT_CAMERA_ID,
  DEFAULT_CHROMATIC_ABERRATION,
  DEFAULT_CHROMA_SHIFT,
  DEFAULT_CHROMA_SHIFT_DIRECTION,
  DEFAULT_CHROMA_SHIFT_INVERT,
  DEFAULT_CONTRAST,
  DEFAULT_CONTRAST_AUTO,
  DEFAULT_EV,
  DEFAULT_FOCUS_AUTO,
  DEFAULT_FOCUS_DISTANCE,
  DEFAULT_FORCE_4K_60FPS_CROP,
  DEFAULT_FPS_SETTING,
  DEFAULT_GRAIN_CHROMA,
  DEFAULT_GRAIN_ENABLED,
  DEFAULT_GRAIN_INTENSITY,
  DEFAULT_GRAIN_ROUGHNESS,
  DEFAULT_GRAIN_SIZE,
  DEFAULT_GRAIN_SPEED,
  DEFAULT_HIGHLIGHTS,
  DEFAULT_HIGHLIGHTS_AUTO,
  DEFAULT_ISO,
  DEFAULT_ISO_AUTO,
  DEFAULT_IS_SELFIE_CAMERA,
  DEFAULT_NOISE_REDUCTION_AUTO,
  DEFAULT_NOISE_REDUCTION_MODE,
  DEFAULT_PIVOT,
  DEFAULT_PIVOT_AUTO,
  DEFAULT_PIXELATION_FACTOR,
  DEFAULT_PREVIEW_IN_4K,
  DEFAULT_RESOLUTION_SETTING,
  DEFAULT_SATURATION,
  DEFAULT_SCANLINES,
  DEFAULT_SELECTIVE_SATURATION,
  DEFAULT_SHARPENING,
  DEFAULT_SHUTTER_SPEED,
  DEFAULT_SHUTTER_SPEED_AUTO,
  DEFAULT_TAPE_JITTER,
  DEFAULT_TEMPERATURE,
  DEFAULT_TEMPERATURE_AUTO,
  DEFAULT_TINT,
  DEFAULT_TORCH_STATE,
  DEFAULT_TORCH_STRENGTH,
  DEFAULT_VIGNETTE_INTENSITY,
  DEFAULT_ZOOM,
  // @@GEN_IMPORTS_END@@
} from '@grovkornet/shared';
import { Preset, PresetPayload, FilmPresetPayload, BodyPresetPayload } from './types';

// ==========================================
// Default Preset Constants (Runtime)
// ==========================================

export const DEFAULT_FILM_PAYLOAD: FilmPresetPayload = {
  // @@GEN_DEFAULTS_START@@
  saturation: DEFAULT_SATURATION,
  contrast: DEFAULT_CONTRAST,
  grainIntensity: DEFAULT_GRAIN_INTENSITY,
  grainChroma: DEFAULT_GRAIN_CHROMA,
  grainSize: DEFAULT_GRAIN_SIZE,
  grainSpeed: DEFAULT_GRAIN_SPEED,
  vignetteIntensity: DEFAULT_VIGNETTE_INTENSITY,
  chromaShift: DEFAULT_CHROMA_SHIFT,
  temperature: DEFAULT_TEMPERATURE,
  tint: DEFAULT_TINT,
  bloomIntensity: DEFAULT_BLOOM_INTENSITY,
  chromaticAberration: DEFAULT_CHROMATIC_ABERRATION,
  chromaShiftDirection: DEFAULT_CHROMA_SHIFT_DIRECTION,
  sharpening: DEFAULT_SHARPENING,
  satRed: DEFAULT_SELECTIVE_SATURATION,
  satOrange: DEFAULT_SELECTIVE_SATURATION,
  satYellow: DEFAULT_SELECTIVE_SATURATION,
  satGreen: DEFAULT_SELECTIVE_SATURATION,
  satCyan: DEFAULT_SELECTIVE_SATURATION,
  satBlue: DEFAULT_SELECTIVE_SATURATION,
  satPurple: DEFAULT_SELECTIVE_SATURATION,
  satMagenta: DEFAULT_SELECTIVE_SATURATION,
  aberrationInvert: DEFAULT_ABERRATION_INVERT,
  boundMagentaRed: DEFAULT_BOUND_MAGENTA_RED,
  boundRedOrange: DEFAULT_BOUND_RED_ORANGE,
  boundOrangeYellow: DEFAULT_BOUND_ORANGE_YELLOW,
  boundYellowGreen: DEFAULT_BOUND_YELLOW_GREEN,
  boundGreenCyan: DEFAULT_BOUND_GREEN_CYAN,
  boundCyanBlue: DEFAULT_BOUND_CYAN_BLUE,
  boundBluePurple: DEFAULT_BOUND_BLUE_PURPLE,
  boundPurpleMagenta: DEFAULT_BOUND_PURPLE_MAGENTA,
  grainRoughness: DEFAULT_GRAIN_ROUGHNESS,
  grainEnabled: DEFAULT_GRAIN_ENABLED,
  bloomEnabled: DEFAULT_BLOOM_ENABLED,
  noiseReductionMode: DEFAULT_NOISE_REDUCTION_MODE,
  noiseReductionAuto: DEFAULT_NOISE_REDUCTION_AUTO,
  temperatureAuto: DEFAULT_TEMPERATURE_AUTO,
  blackLevel: DEFAULT_BLACK_LEVEL,
  highlights: DEFAULT_HIGHLIGHTS,
  pivot: DEFAULT_PIVOT,
  contrastAuto: DEFAULT_CONTRAST_AUTO,
  blackLevelAuto: DEFAULT_BLACK_LEVEL_AUTO,
  highlightsAuto: DEFAULT_HIGHLIGHTS_AUTO,
  pivotAuto: DEFAULT_PIVOT_AUTO,
  pixelationFactor: DEFAULT_PIXELATION_FACTOR,
  tapeJitter: DEFAULT_TAPE_JITTER,
  scanlines: DEFAULT_SCANLINES,
  chromaShiftInvert: DEFAULT_CHROMA_SHIFT_INVERT,
  // @@GEN_DEFAULTS_END@@
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
  isDeleteModalVisible: boolean;
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
  setDeleteModalVisible: (visible: boolean) => void;
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
      isDeleteModalVisible: false,

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

        const updated = userPresets.map((p) => {
          if (p.id === id) {
            return { ...p, inQuickSelect: !p.inQuickSelect };
          }
          return p;
        });

        set({ userPresets: updated });
      },

      getQuickSelectList: () => {
        const { userPresets, customizedPayload, activePresetId } = get();
        const tDefault = i18n.t ? i18n.t('presets.default', 'Default') : 'Default';
        const list = [{ id: 'default', name: tDefault || 'Default' }];
        
        if (customizedPayload) {
          const tCustomized = i18n.t ? i18n.t('presets.customized', 'Custom') : 'Custom';
          list.push({ id: 'customized', name: tCustomized || 'Custom' });
        }

        const sortedPresets = [...userPresets].sort((a, b) => {
          // 1. Favorite preset first
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;

          // 2. Quick select (pinned) next
          if (a.inQuickSelect && !b.inQuickSelect) return -1;
          if (!a.inQuickSelect && b.inQuickSelect) return 1;

          // 3. Alphabetical sorting
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true });
        });

        sortedPresets.forEach((p) => {
          if (p.inQuickSelect || p.id === activePresetId) {
            list.push({ id: p.id, name: p.name });
          }
        });

        return list;
      },

      setAddModalVisible: (visible: boolean) => {
        set({ isAddModalVisible: visible });
      },

      setDeleteModalVisible: (visible: boolean) => {
        set({ isDeleteModalVisible: visible });
      },
    }),
    {
      name: 'grovkornet-presets-storage',
      storage: createJSONStorage(() => createZustandMMKVStorage('grovkornet-presets')),
      // Persist user presets, active preset ID (including 'customized'), and customized payload
      partialize: (state) => ({
        userPresets: state.userPresets,
        activePresetId: state.activePresetId,
        customizedPayload: state.customizedPayload,
      }),
    }
  )
);
