import { create } from 'zustand';
import { UIState, UIActions, ModuleType, ParameterType } from '@shared/types/camera';

interface UIStore extends UIState, UIActions {}

export const useUIStore = create<UIStore>((set, get) => ({
  // UI State
  activeTab: 'none',
  activeModule: 'none',
  activeParameter: 'none',
  isDebugEnabled: false,
  
  lastActiveParameters: {
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
  },

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setActiveModule: (module: ModuleType) => {
    const { lastActiveParameters } = get();
    set({ 
      activeModule: module, 
      activeParameter: lastActiveParameters[module] || 'none' 
    });
  },

  setActiveParameter: (param: ParameterType) => {
    const { activeModule } = get();
    set((state) => ({
      activeParameter: param,
      lastActiveParameters: {
        ...state.lastActiveParameters,
        [activeModule]: param,
      },
    }));
  },

  setIsDebugEnabled: (value: boolean) => {
    set({ isDebugEnabled: value });
  },
}));
