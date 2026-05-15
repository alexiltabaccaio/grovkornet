import { create } from 'zustand';
import { makeMutable } from 'react-native-reanimated';
import { CameraState } from '../../../shared/types/camera';
import { 
  DEFAULT_GRAIN_INTENSITY, 
  DEFAULT_SATURATION, 
  DEFAULT_CONTRAST, 
  DEFAULT_CHROMATIC_ABERRATION,
  DEFAULT_ISO,
  DEFAULT_EV,
  DEFAULT_SHUTTER_SPEED,
  DEFAULT_WHITE_BALANCE,
} from '@shared/constants/videoProcessing';

export const useCameraEffectsStore = create<CameraState>((set, get) => ({
  // Reanimated Shared Values
  grainIntensity: makeMutable(DEFAULT_GRAIN_INTENSITY),
  grainChroma: makeMutable(0.0),
  grainSize: makeMutable(1.0),
  saturation: makeMutable(DEFAULT_SATURATION),
  contrast: makeMutable(DEFAULT_CONTRAST),
  chromaticAberration: makeMutable(DEFAULT_CHROMATIC_ABERRATION),
  grainEnabled: makeMutable(false),
  fps: makeMutable(0),
  hwFps: makeMutable(0),
  resolution: makeMutable(''),
  iso: makeMutable(DEFAULT_ISO),
  ev: makeMutable(DEFAULT_EV),
  shutterSpeed: makeMutable(DEFAULT_SHUTTER_SPEED),
  whiteBalance: makeMutable(DEFAULT_WHITE_BALANCE),
  isoAuto: makeMutable(true),
  shutterSpeedAuto: makeMutable(true),
  whiteBalanceAuto: makeMutable(true),
  evAuto: makeMutable(true),
  focusDistance: makeMutable(0),
  focusAuto: makeMutable(true),
  cameraId: '',
  cameraAuto: true,
  torchState: makeMutable(0),
  torchStrength: makeMutable(1),
  capabilities: {
    supportsFocus: true,
    hasTorch: false,
    maxTorchStrength: 1,
    isoMin: 100,
    isoMax: 3200,
    availableCameras: [],
  },

  // Actions
  setGrainIntensity: (value) => {
    const { grainIntensity, grainEnabled } = get();
    grainIntensity.value = value;
    grainEnabled.value = value > 0;
  },
  setGrainChroma: (value) => {
    get().grainChroma.value = value;
  },
  setGrainSize: (value) => {
    get().grainSize.value = value;
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

  setDebugInfo: (fpsVal, resVal, hwFpsVal) => {
    const { fps, resolution, hwFps } = get();
    fps.value = fpsVal;
    resolution.value = resVal;
    hwFps.value = hwFpsVal;
  },

  setIso: (value) => {
    get().iso.value = value;
    get().isoAuto.value = false;
  },

  setEv: (value) => {
    get().ev.value = value;
    get().evAuto.value = false;
  },

  setShutterSpeed: (value) => {
    get().shutterSpeed.value = value;
    get().shutterSpeedAuto.value = false;
  },

  setWhiteBalance: (value) => {
    get().whiteBalance.value = value;
    get().whiteBalanceAuto.value = false;
  },

  setIsoAuto: (value: boolean) => {
    get().isoAuto.value = value;
  },

  setShutterSpeedAuto: (value: boolean) => {
    get().shutterSpeedAuto.value = value;
  },

  setWhiteBalanceAuto: (value: boolean) => {
    get().whiteBalanceAuto.value = value;
  },

  setEvAuto: (value: boolean) => {
    get().evAuto.value = value;
  },

  setFocusDistance: (value) => {
    get().focusDistance.value = value;
    get().focusAuto.value = false;
  },

  setFocusAuto: (value) => {
    get().focusAuto.value = value;
  },

  setCameraId: (value) => {
    set({ cameraId: value, cameraAuto: false });
  },

  setCameraAuto: (value) => {
    set((state) => ({ cameraAuto: value, ...(value ? { cameraId: '' } : {}) }));
  },
  
  setTorchState: (value) => {
    get().torchState.value = value;
  },

  setTorchStrength: (value) => {
    get().torchStrength.value = value;
  },

  setCapabilities: (caps) => {
    set({ capabilities: caps });
  },

  resetTool: (tool) => {
    const { 
      grainIntensity, saturation, contrast, chromaticAberration,
      iso, ev, shutterSpeed, whiteBalance,
      isoAuto, evAuto, shutterSpeedAuto, whiteBalanceAuto,
      setGrainIntensity, setSaturation, setContrast, setChromaticAberration,
    } = get();

    if (tool === 'grain') {
      grainIntensity.value = DEFAULT_GRAIN_INTENSITY;
      get().grainChroma.value = 0.0;
      get().grainSize.value = 1.0;
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
      isoAuto.value = true;
    } else if (tool === 'ev') {
      ev.value = DEFAULT_EV;
      evAuto.value = true;
    } else if (tool === 'shutter_speed') {
      shutterSpeed.value = DEFAULT_SHUTTER_SPEED;
      shutterSpeedAuto.value = true;
    } else if (tool === 'white_balance') {
      whiteBalance.value = DEFAULT_WHITE_BALANCE;
      whiteBalanceAuto.value = true;
    } else if (tool === 'focus') {
      get().focusAuto.value = true;
    } else if (tool === 'lens') {
      set({ cameraAuto: true, cameraId: '' });
    }
  },
}));

