import { create } from 'zustand';
import { makeMutable } from 'react-native-reanimated';
import { logger } from '@shared/lib/logger';
import { HardwareStore } from '@shared/types/stores';
import { 
  DEFAULT_ISO,
  DEFAULT_EV,
  DEFAULT_SHUTTER_SPEED,
  DEFAULT_TEMPERATURE,
  DEFAULT_TINT,
} from '@grovkornet/shared';

export const useHardwareStore = create<HardwareStore>((set, get) => ({
  fps: makeMutable(0),
  hwFps: makeMutable(0),
  resolution: makeMutable(''),
  iso: makeMutable(DEFAULT_ISO),
  ev: makeMutable(DEFAULT_EV),
  shutterSpeed: makeMutable(DEFAULT_SHUTTER_SPEED),
  temperature: makeMutable(DEFAULT_TEMPERATURE),
  tint: makeMutable(DEFAULT_TINT),
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
  aspectRatio: makeMutable(1), // 0: 4:3, 1: 16:9, 2: 1:1, 3: 3:2, 4: 65:24
  resolutionSetting: makeMutable(1), // 0: 720p, 1: 1080p, 2: 4K
  fpsSetting: makeMutable(60), // 1 to 60
  capabilities: {
    supportsFocus: true,
    hasTorch: false,
    maxTorchStrength: 1,
    isoMin: 100,
    isoMax: 3200,
    availableCameras: [],
    maxFps: 60,
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
    get().shutterSpeedAuto.value = false;
    get().evAuto.value = true;
    get().ev.value = DEFAULT_EV;
  },
  setEv: (value) => {
    logger.debug('HardwareStore', `Setting EV: ${value}`);
    get().ev.value = value;
    get().evAuto.value = false;
    get().isoAuto.value = true;
    get().shutterSpeedAuto.value = true;
  },
  setShutterSpeed: (value) => {
    logger.debug('HardwareStore', `Setting Shutter Speed: ${value}`);
    get().shutterSpeed.value = value;
    get().shutterSpeedAuto.value = false;
    get().isoAuto.value = false;
    get().evAuto.value = true;
    get().ev.value = DEFAULT_EV;
  },
  setTemperature: (value) => {
    logger.debug('HardwareStore', `Setting Temperature: ${value}`);
    get().temperature.value = value;
    get().temperatureAuto.value = false;
  },
  setTint: (value) => {
    logger.debug('HardwareStore', `Setting Tint: ${value}`);
    get().tint.value = value;
    get().temperatureAuto.value = false;
  },
  setIsoAuto: (value) => {
    get().isoAuto.value = value;
    get().shutterSpeedAuto.value = value;
    if (value) {
      get().iso.value = DEFAULT_ISO;
      get().shutterSpeed.value = DEFAULT_SHUTTER_SPEED;
    }
  },
  setShutterSpeedAuto: (value) => {
    get().shutterSpeedAuto.value = value;
    get().isoAuto.value = value;
    if (value) {
      get().shutterSpeed.value = DEFAULT_SHUTTER_SPEED;
      get().iso.value = DEFAULT_ISO;
    }
  },
  setTemperatureAuto: (value) => {
    get().temperatureAuto.value = value;
    if (value) {
      get().temperature.value = DEFAULT_TEMPERATURE;
      get().tint.value = DEFAULT_TINT;
    }
  },
  setEvAuto: (value) => {
    get().evAuto.value = value;
    if (value) get().ev.value = DEFAULT_EV;
  },
  setFocusDistance: (value) => {
    logger.debug('HardwareStore', `Setting Focus Distance: ${value}`);
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
    if (capabilities.maxFps && get().fpsSetting.value > capabilities.maxFps) {
      get().fpsSetting.value = capabilities.maxFps;
    }
    set({ capabilities });
  },
}));
