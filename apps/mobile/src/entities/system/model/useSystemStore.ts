import { create } from 'zustand';
import { logger } from '@shared/lib/logger';
import { SystemStore, ModuleType, ParameterType, SectionType, ParameterExtensionType } from './types';

export const useSystemStore = create<SystemStore>((set, get) => ({
  // UI State
  activeSection: 'none',
  activeModule: 'none',
  activeParameter: 'none',
  activeExtension: 'none',
  isDebugEnabled: false,
  isXRayEnabled: false,
  isLogsEnabled: __DEV__,
  isExtensionOpen: false,
  isCapturing: false,
  latestCapturedUri: null,

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
      activeExtension: 'none'
    });
  },
  
  setActiveModule: (module: ModuleType) => {
    const { lastActiveParameters, activeSection } = get();
    set((state) => ({ 
      activeModule: module, 
      activeParameter: lastActiveParameters[module] || 'none',
      activeExtension: 'none',
      lastActiveModules: {
        ...state.lastActiveModules,
        [activeSection]: module,
      }
    }));
  },

  setActiveParameter: (param: ParameterType) => {
    logger.debug('SystemStore', `setActiveParameter: ${param}`);
    const { activeModule } = get();
    set((state) => ({
      activeParameter: param,
      activeExtension: 'none',
      lastActiveParameters: {
        ...state.lastActiveParameters,
        [activeModule]: param,
      },
    }));
  },

  setIsDebugEnabled: (enabled: boolean) => {
    set({ isDebugEnabled: enabled });
  },

  setIsXRayEnabled: (enabled: boolean) => {
    // @ts-ignore - Inject into global for monkey patch
    global.__xray_enabled = enabled;
    set({ isXRayEnabled: enabled });
  },

  setIsLogsEnabled: (enabled: boolean) => {
    logger.setDebugEnabled(enabled);
    set({ isLogsEnabled: enabled });
  },

  setIsExtensionOpen: (open: boolean) => {
    set({ isExtensionOpen: open });
  },

  setActiveExtension: (param: ParameterExtensionType) => {
    set({ activeExtension: param });
  },

  triggerCapture: () => {
    set({ isCapturing: true });
    // Reset after animation
    setTimeout(() => {
      set({ isCapturing: false });
    }, 200);
  },
  
  setLatestCapturedUri: (uri) => {
    set({ latestCapturedUri: uri });
  },
}));
