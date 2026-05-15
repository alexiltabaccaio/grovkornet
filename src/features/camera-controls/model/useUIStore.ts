import { create } from 'zustand';
import { UIState, UIActions, ModuleType, PrimaryParameterType } from '@shared/types/camera';

interface UIStore extends UIState, UIActions {}

export const useUIStore = create<UIStore>((set, get) => ({
  // UI State
  activeSection: 'none',
  activeModule: 'none',
  activePrimaryParameter: 'none',
  isDebugEnabled: false,
  
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
  setActiveSection: (section) => set({ activeSection: section }),
  
  setActiveModule: (module: ModuleType) => {
    const { lastActivePrimaryParameters } = get();
    set({ 
      activeModule: module, 
      activePrimaryParameter: lastActivePrimaryParameters[module] || 'none' 
    });
  },

  setActivePrimaryParameter: (param: PrimaryParameterType) => {
    const { activeModule } = get();
    set((state) => ({
      activePrimaryParameter: param,
      lastActivePrimaryParameters: {
        ...state.lastActivePrimaryParameters,
        [activeModule]: param,
      },
    }));
  },

  setIsDebugEnabled: (value: boolean) => {
    set({ isDebugEnabled: value });
  },
}));
