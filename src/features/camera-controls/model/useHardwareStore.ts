import { create } from 'zustand';
import { makeMutable } from 'react-native-reanimated';
import { logger } from '@shared/lib/logger';
import { HardwareStore } from '@shared/types/stores';
import { 
  DEFAULT_ISO,
  DEFAULT_EV,
  DEFAULT_SHUTTER_SPEED,
  DEFAULT_TEMPERATURE,
} from '@shared/constants/videoProcessing';

export const useHardwareStore = create<HardwareStore>((set, get) => ({
  fps: makeMutable(0),
  hwFps: makeMutable(0),
  resolution: makeMutable(''),
  iso: makeMutable(DEFAULT_ISO),
  ev: makeMutable(DEFAULT_EV),
  shutterSpeed: makeMutable(DEFAULT_SHUTTER_SPEED),
  temperature: makeMutable(DEFAULT_TEMPERATURE),
  isoAuto: makeMutable(true),
  shutterSpeedAuto: makeMutable(true),
  temperatureAuto: makeMutable(true),
  evAuto: makeMutable(true),
  focusDistance: makeMutable(0),
  focusAuto: makeMutable(true),
  cameraId: '',
  cameraAuto: true,
  torchState: makeMutable(0),
  torchStrength: makeMutable(1),
  aspectRatio: makeMutable(0), // 0: 4:3, 1: 16:9, 2: 1:1, 3: 3:2, 4: 65:24
  resolutionSetting: makeMutable(1), // 0: 720p, 1: 1080p, 2: 4K
  fpsSetting: makeMutable(1), // 0: 24, 1: 30, 2: 60
  capabilities: {
    supportsFocus: true,
    hasTorch: false,
    maxTorchStrength: 1,
    isoMin: 100,
    isoMax: 3200,
    availableCameras: [],
  },

  setDebugInfo: (fpsVal, resVal, hwFpsVal) => {
    const { fps, resolution, hwFps } = get();
    fps.value = fpsVal;
    resolution.value = resVal;
    hwFps.value = hwFpsVal;
  },
  setIso: (value) => {
    logger.debug('HardwareStore', `Setting ISO: ${value}`);
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
  setTemperature: (value) => {
    get().temperature.value = value;
    get().temperatureAuto.value = false;
  },
  setIsoAuto: (value) => {
    get().isoAuto.value = value;
  },
  setShutterSpeedAuto: (value) => {
    get().shutterSpeedAuto.value = value;
  },
  setTemperatureAuto: (value) => {
    get().temperatureAuto.value = value;
  },
  setEvAuto: (value) => {
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
    set({ cameraId: value });
  },
  setCameraAuto: (value) => {
    logger.debug('HardwareStore', `Setting Camera Auto: ${value}`);
    set({ cameraAuto: value });
  },
  setTorchState: (value) => {
    get().torchState.value = value;
  },
  setTorchStrength: (value) => {
    get().torchStrength.value = value;
  },
  setAspectRatio: (value) => {
    get().aspectRatio.value = value;
  },
  setResolutionSetting: (value) => {
    get().resolutionSetting.value = value;
  },
  setFpsSetting: (value) => {
    get().fpsSetting.value = value;
  },
  setCapabilities: (capabilities) => {
    logger.info('HardwareStore', 'Hardware capabilities updated');
    set({ capabilities });
  },
}));
