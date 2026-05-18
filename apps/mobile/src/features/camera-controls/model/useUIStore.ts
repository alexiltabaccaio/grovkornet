import { create } from 'zustand';
import { UIStore, ModuleType, ParameterType, SectionType, SubParameterType } from '@shared/types/camera';

export const useUIStore = create<UIStore>((set, get) => ({
  // UI State
  activeSection: 'none',
  activeModule: 'none',
  activeParameter: 'none',
  activeSubParameter: 'none',
  isDebugEnabled: false,
  isSubPanelOpen: false,
  isCapturing: false,
  latestCapturedUri: null,
  gestureConfig: null,

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
      activeSubParameter: 'none'
    });
  },
  
  setActiveModule: (module: ModuleType) => {
    const { lastActiveParameters, activeSection } = get();
    set((state) => ({ 
      activeModule: module, 
      activeParameter: lastActiveParameters[module] || 'none',
      activeSubParameter: 'none',
      lastActiveModules: {
        ...state.lastActiveModules,
        [activeSection]: module,
      }
    }));
  },

  setActiveParameter: (param: ParameterType) => {
    const { activeModule } = get();
    set((state) => ({
      activeParameter: param,
      activeSubParameter: 'none',
      lastActiveParameters: {
        ...state.lastActiveParameters,
        [activeModule]: param,
      },
    }));
  },

  setIsDebugEnabled: (enabled: boolean) => {
    set({ isDebugEnabled: enabled });
  },

  setIsSubPanelOpen: (open: boolean) => {
    set({ isSubPanelOpen: open });
  },

  setActiveSubParameter: (param: SubParameterType) => {
    set({ activeSubParameter: param });
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
  
  setGestureConfig: (config) => {
    set({ gestureConfig: config });
  },
}));
