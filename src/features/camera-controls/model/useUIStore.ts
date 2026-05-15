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

  lastActiveParameters: {
    none: 'none',
    preferences: 'language',
    optics: 'camera_selection',
    flaws: 'chromatic_aberration',
    exposure: 'iso',
    lighting: 'torch',
    development: 'temperature',
    texture: 'grain',
  },

  // Actions
  setActiveSection: (section: SectionType) => {
    set({ activeSection: section });
  },
  
  setActiveModule: (module: ModuleType) => {
    const { lastActiveParameters } = get();
    set({ 
      activeModule: module, 
      activeParameter: lastActiveParameters[module] || 'none',
      activeSubParameter: 'none'
    });
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
}));
