import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createZustandMMKVStorage } from '@shared/lib/storage/mmkv';
import { logger } from '@shared/lib/logger';
import { SystemStore, ModuleType, ParameterType, SectionType, ParameterDetailPanelType } from './types';



export const useSystemStore = create<SystemStore>()(
  persist(
    (set, get) => ({
  // UI State
  activeSection: 'none',
  activeModule: 'none',
  activeParameter: 'none',
  activeDetailPanel: 'none',
  isDebugEnabled: false,
  isLogsEnabled: __DEV__,
  isDetailPanelOpen: false,
  isCapturing: false,
  isCameraSecure: true,
  isTorchOn: false,
  latestPreviewUri: null,
  latestCapturedUri: null,
  lastNonNoneSection: 'none',
  lastNonNoneModule: 'none',

  lastActiveModules: {
    none: 'none',
    system: 'preferences',
    lens: 'optics',
    body: 'exposure',
    film: 'development',
  },

  lastActiveParameters: {
    none: 'none',
    preferences: 'language',
    presets: 'presets',
    optics: 'camera_selection',
    flaws: 'chromatic_aberration',
    exposure: 'iso',
    lighting: 'torch',
    development: 'temperature',
    texture: 'grain',
    capture: 'aspect_ratio',
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

  setIsDebugEnabled: (enabled: boolean) => {
    set({ isDebugEnabled: enabled });
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
    }, 200);
  },
  
  setLatestPreviewUri: (uri) => {
    set({ latestPreviewUri: uri });
  },
  
  setLatestCapturedUri: (uri) => {
    set({ latestCapturedUri: uri });
  },
    }),
    {
      name: 'grovkornet-system-storage',
      storage: createJSONStorage(() => createZustandMMKVStorage('system-storage')),
      partialize: (state) => ({
        latestCapturedUri: state.latestCapturedUri,
      }),
    }
  )
);
