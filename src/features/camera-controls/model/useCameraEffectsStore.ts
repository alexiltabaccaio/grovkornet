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
  isoAuto: makeMutable(true),
  shutterSpeedAuto: makeMutable(true),
  whiteBalanceAuto: makeMutable(true),
  evAuto: makeMutable(true),

  // Actions
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

  setDebugInfo: (fpsVal, resVal) => {
    const { fps, resolution } = get();
    fps.value = fpsVal;
    resolution.value = resVal;
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

  resetTool: (tool) => {
    const { 
      grainIntensity, saturation, contrast, chromaticAberration,
      iso, ev, shutterSpeed, whiteBalance,
      isoAuto, evAuto, shutterSpeedAuto, whiteBalanceAuto,
      setGrainIntensity, setSaturation, setContrast, setChromaticAberration,
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
    }
  },
}));

