import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createZustandMMKVStorage } from '@shared/lib/storage/mmkv';
import { logger } from '@shared/lib/logger';
import { SystemStore, ModuleType, ParameterType, SectionType, ParameterDetailPanelType } from './types';
import { SECTION_MODULES } from './constants';

export const useSystemStore = create<SystemStore>()(
  persist(
    (set, get) => ({
  // UI State
  activeSection: 'none',
  activeModule: 'none',
  activeParameter: 'none',
  activeDetailPanel: 'none',
  isFpsOverlayEnabled: false,
  isLayoutOverlayEnabled: false,
  isLogsEnabled: __DEV__,
  isDetailPanelOpen: false,
  isCapturing: false,
  isCameraSecure: true,
  isTorchOn: false,
  latestPreviewUri: null,
  latestCapturedUri: null,
  lastNonNoneSection: 'none',
  lastNonNoneModule: 'none',
  thermalState: 'normal',
  isLowRam: false,
  selectedColorIndex: 0,

  lastActiveModules: {
    none: 'none',
    system: SECTION_MODULES.system[0],
    lens: SECTION_MODULES.lens[0],
    body: SECTION_MODULES.body[0],
    film: SECTION_MODULES.film[0],
  },

  lastActiveParameters: {
    none: 'none',
    preferences: 'language',
    presets: 'presets',
    theme: 'none',
    optics: 'camera_selection',
    artifacts: 'chromatic_aberration',
    exposure: 'iso',
    lighting: 'torch',
    processing: 'noise_reduction',
    tone: 'contrast',
    color: 'temperature',
    texture: 'grain',
    details: 'sharpening',
    capture: 'aspect_ratio',
    debug: 'ui_overlay',
  },

  // Actions
  setActiveSection: (section: SectionType) => {
    const { lastActiveModules, lastActiveParameters } = get();
    const module = lastActiveModules[section] || 'none';
    const parameter = lastActiveParameters[module] || 'none';
    set({ 
      activeSection: section,
      activeModule: module,
      activeParameter: parameter,
      activeDetailPanel: 'none',
      ...(section !== 'none' ? { lastNonNoneSection: section } : {}),
      ...(module !== 'none' ? { lastNonNoneModule: module } : {}),
    });
  },
  
  setActiveModule: (module: ModuleType) => {
    const { lastActiveParameters, activeSection } = get();
    set((state) => ({ 
      activeModule: module, 
      activeParameter: lastActiveParameters[module] || 'none',
      activeDetailPanel: 'none',
      lastActiveModules: {
        ...state.lastActiveModules,
        [activeSection]: module,
      },
      ...(module !== 'none' ? { lastNonNoneModule: module } : {}),
    }));
  },

  setActiveParameter: (param: ParameterType) => {
    logger.debug('SystemStore', `setActiveParameter: ${param}`);
    const { activeModule } = get();
    set((state) => ({
      activeParameter: param,
      activeDetailPanel: 'none',
      lastActiveParameters: {
        ...state.lastActiveParameters,
        [activeModule]: param,
      },
    }));
  },

  setIsFpsOverlayEnabled: (enabled: boolean) => {
    set({ isFpsOverlayEnabled: enabled });
  },

  setIsLayoutOverlayEnabled: (enabled: boolean) => {
    set({ isLayoutOverlayEnabled: enabled });
  },

  setIsLogsEnabled: (enabled: boolean) => {
    logger.setDebugEnabled(enabled);
    set({ isLogsEnabled: enabled });
  },

  setIsDetailPanelOpen: (open: boolean) => {
    set({ isDetailPanelOpen: open });
  },

  setIsCameraSecure: (enabled: boolean) => {
    set({ isCameraSecure: enabled });
  },

  setActiveDetailPanel: (param: ParameterDetailPanelType) => {
    set({ activeDetailPanel: param });
  },

  setIsTorchOn: (isOn: boolean) => {
    set({ isTorchOn: isOn });
  },

  triggerCapture: () => {
    set({ isCapturing: true });
    // Reset after animation
    setTimeout(() => {
      set({ isCapturing: false });
    }, 350);
  },
  
  setLatestPreviewUri: (uri) => {
    set({ latestPreviewUri: uri });
  },
  
  setLatestCapturedUri: (uri) => {
    set({ latestCapturedUri: uri, latestPreviewUri: null });
  },

  setThermalState: (state) => {
    set({ thermalState: state });
  },

  setIsLowRam: (isLowRam) => {
    set({ isLowRam });
  },
  setSelectedColorIndex: (index: number) => {
    set({ selectedColorIndex: index });
  },
    }),
    {
      name: 'grovkornet-system-storage',
      storage: createJSONStorage(() => createZustandMMKVStorage('system-storage')),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!__DEV__) {
            useSystemStore.getState().setIsLogsEnabled(false);
          } else {
            logger.setDebugEnabled(state.isLogsEnabled);
            logger.debug('SystemStore', 'Store rehydrated successfully', state);
          }
        } else {
          logger.error('SystemStore', 'Store rehydration failed or storage is empty');
        }
      },
      partialize: (state) => ({
        latestCapturedUri: state.latestCapturedUri,
        isLogsEnabled: state.isLogsEnabled,
      }),
    }
  )
);
