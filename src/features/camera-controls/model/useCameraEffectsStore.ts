import { create } from 'zustand';
import { makeMutable } from 'react-native-reanimated';
import { CameraEffectState, ParameterType, ModuleType } from '@shared/types/camera';
import { 
  DEFAULT_GRAIN_INTENSITY, 
  DEFAULT_SATURATION, 
  DEFAULT_CONTRAST, 
  DEFAULT_CHROMATIC_ABERRATION,
  DEFAULT_ISO,
  DEFAULT_EV,
  DEFAULT_SHUTTER_SPEED,
  DEFAULT_WHITE_BALANCE,
  DEFAULT_AUTO_EXPOSURE
} from '@shared/constants/videoProcessing';

interface CameraEffectsStore extends CameraEffectState {
  lastActiveParameters: Record<ModuleType, ParameterType>;
}

export const useCameraEffectsStore = create<CameraEffectsStore>((set, get) => ({
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

  // Reanimated Shared Values (created via makeMutable for global store usage)
  grainIntensity: makeMutable(DEFAULT_GRAIN_INTENSITY),
  saturation: makeMutable(DEFAULT_SATURATION),
  contrast: makeMutable(DEFAULT_CONTRAST),
  chromaticAberration: makeMutable(DEFAULT_CHROMATIC_ABERRATION),
  grainEnabled: makeMutable(false),
  fps: makeMutable(0),
  resolution: makeMutable(''),
  iso: makeMutable(DEFAULT_ISO),
  ev: makeMutable(DEFAULT_EV),
  shutterSpeed: makeMutable(DEFAULT_SHUTTER_SPEED),
  whiteBalance: makeMutable(DEFAULT_WHITE_BALANCE),
  autoExposure: makeMutable(DEFAULT_AUTO_EXPOSURE),

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setActiveModule: (module) => {
    const { lastActiveParameters } = get();
    set({ 
      activeModule: module, 
      activeParameter: lastActiveParameters[module] || 'none' 
    });
  },

  setActiveParameter: (param) => {
    const { activeModule } = get();
    set((state) => ({
      activeParameter: param,
      lastActiveParameters: {
        ...state.lastActiveParameters,
        [activeModule]: param,
      },
    }));
  },

  setGrainIntensity: (value) => {
    const { grainIntensity, grainEnabled } = get();
    grainIntensity.value = value;
    grainEnabled.value = value > 0;
  },

  setSaturation: (value) => {
    get().saturation.value = value;
  },

  setContrast: (value) => {
    get().contrast.value = value;
  },

  setChromaticAberration: (value) => {
    get().chromaticAberration.value = value;
  },

  setGrainEnabled: (value) => {
    get().grainEnabled.value = value;
  },

  setIsDebugEnabled: (value) => {
    set({ isDebugEnabled: value });
  },

  setDebugInfo: (fpsVal, resVal) => {
    const { fps, resolution } = get();
    fps.value = fpsVal;
    resolution.value = resVal;
  },

  setIso: (value) => {
    get().iso.value = value;
    get().autoExposure.value = false;
  },

  setEv: (value) => {
    get().ev.value = value;
    get().autoExposure.value = false;
  },

  setShutterSpeed: (value) => {
    get().shutterSpeed.value = value;
    get().autoExposure.value = false;
  },

  setWhiteBalance: (value) => {
    get().whiteBalance.value = value;
    get().autoExposure.value = false;
  },

  setAutoExposure: (value) => {
    get().autoExposure.value = value;
  },

  resetTool: (tool) => {
    const { 
      grainIntensity, saturation, contrast, chromaticAberration,
      iso, ev, shutterSpeed, whiteBalance, autoExposure,
      setGrainIntensity, setSaturation, setContrast, setChromaticAberration,
      setIso, setEv, setShutterSpeed, setWhiteBalance, setAutoExposure
    } = get();

    if (tool === 'grain') {
      grainIntensity.value = DEFAULT_GRAIN_INTENSITY;
      setGrainIntensity(DEFAULT_GRAIN_INTENSITY);
    } else if (tool === 'saturation') {
      saturation.value = DEFAULT_SATURATION;
      setSaturation(DEFAULT_SATURATION);
    } else if (tool === 'contrast') {
      contrast.value = DEFAULT_CONTRAST;
      setContrast(DEFAULT_CONTRAST);
    } else if (tool === 'chromatic_aberration') {
      chromaticAberration.value = DEFAULT_CHROMATIC_ABERRATION;
      setChromaticAberration(DEFAULT_CHROMATIC_ABERRATION);
    } else if (tool === 'iso') {
      iso.value = DEFAULT_ISO;
      setIso(DEFAULT_ISO);
    } else if (tool === 'ev') {
      ev.value = DEFAULT_EV;
      setEv(DEFAULT_EV);
    } else if (tool === 'shutter_speed') {
      shutterSpeed.value = DEFAULT_SHUTTER_SPEED;
      setShutterSpeed(DEFAULT_SHUTTER_SPEED);
    } else if (tool === 'white_balance') {
      whiteBalance.value = DEFAULT_WHITE_BALANCE;
      setWhiteBalance(DEFAULT_WHITE_BALANCE);
      // Optional: non rimettiamo autoExposure=true per ora, per evitare sobbalzi 
      // se gli altri controlli manuali sono ancora attivi.
    }
  },
}));
