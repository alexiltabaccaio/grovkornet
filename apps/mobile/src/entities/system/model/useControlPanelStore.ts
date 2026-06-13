import { create } from 'zustand';
import { logger } from '@shared/lib/logger';
import { SectionType, ModuleType, ParameterType, ParameterDetailPanelType } from './types';
import { SECTION_MODULES } from './constants';

export interface ControlPanelState {
  activeSection: SectionType;
  activeModule: ModuleType;
  activeParameter: ParameterType;
  activeDetailPanel: ParameterDetailPanelType;
  isDetailPanelOpen: boolean;
  lastActiveModules: Record<SectionType, ModuleType>;
  lastActiveParameters: Record<ModuleType, ParameterType>;
  lastNonNoneSection: SectionType;
  lastNonNoneModule: ModuleType;
  selectedColorIndex: number;
}

export interface ControlPanelActions {
  setActiveSection: (section: SectionType) => void;
  setActiveModule: (module: ModuleType) => void;
  setActiveParameter: (param: ParameterType) => void;
  setActiveDetailPanel: (panel: ParameterDetailPanelType) => void;
  setIsDetailPanelOpen: (open: boolean) => void;
  setSelectedColorIndex: (index: number) => void;
}

export interface ControlPanelStore extends ControlPanelState, ControlPanelActions {}

export const useControlPanelStore = create<ControlPanelStore>()((set, get) => ({
  // State
  activeSection: 'none',
  activeModule: 'none',
  activeParameter: 'none',
  activeDetailPanel: 'none',
  isDetailPanelOpen: false,
  selectedColorIndex: 0,
  lastNonNoneSection: 'none',
  lastNonNoneModule: 'none',

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
  setActiveSection: (section) => {
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

  setActiveModule: (module) => {
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

  setActiveParameter: (param) => {
    logger.debug('ControlPanelStore', `setActiveParameter: ${param}`);
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

  setActiveDetailPanel: (panel) => {
    set({ activeDetailPanel: panel });
  },

  setIsDetailPanelOpen: (open) => {
    set({ isDetailPanelOpen: open });
  },

  setSelectedColorIndex: (index) => {
    set({ selectedColorIndex: index });
  },
}));
