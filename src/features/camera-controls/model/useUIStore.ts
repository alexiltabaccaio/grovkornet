import { create } from 'zustand';
import { UIStore, ModuleType, PrimaryParameterType, SectionType, SubParameterType } from '@shared/types/camera';

export const useUIStore = create<UIStore>((set, get) => ({
  // UI State
  activeSection: 'none',
  activeModule: 'none',
  activePrimaryParameter: 'none',
  activeSubParameter: 'none',
  isDebugEnabled: false,
  isSubPanelOpen: false,

  
  lastActivePrimaryParameters: {
    none: 'none',
    grain: 'grain',
    color_grading: 'saturation',
    lens_effects: 'chromatic_aberration',
    language: 'none',
    debug: 'none',
    fade: 'none',
    jitter: 'none',
    dropouts: 'none',
    manual_exposure: 'iso',
    focus: 'none',
    lens: 'none',
  },

  // Actions
  setActiveSection: (section: SectionType) => {
    set({ activeSection: section });
  },
  
  setActiveModule: (module: ModuleType) => {
    const { lastActivePrimaryParameters } = get();
    set({ 
      activeModule: module, 
      activePrimaryParameter: lastActivePrimaryParameters[module] || 'none',
      activeSubParameter: 'none'
    });

  },

  setActivePrimaryParameter: (param: PrimaryParameterType) => {
    const { activeModule } = get();
    set((state) => ({
      activePrimaryParameter: param,
      activeSubParameter: 'none',
      lastActivePrimaryParameters: {
        ...state.lastActivePrimaryParameters,
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
