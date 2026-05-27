import { create } from 'zustand';
import { makeMutable } from 'react-native-reanimated';
import { logger } from '@shared/lib/logger';
import { BodyStore } from './types';
import { usePreferencesStore } from '@entities/preferences';
import { 
  DEFAULT_ISO,
  DEFAULT_EV,
  DEFAULT_SHUTTER_SPEED,
} from '@grovkornet/shared';

export const useBodyStore = create<BodyStore>((set, get) => ({
  fps: makeMutable(0),
  hwFps: makeMutable(0),
  resolution: makeMutable(''),
  iso: makeMutable(DEFAULT_ISO),
  ev: makeMutable(DEFAULT_EV),
  shutterSpeed: makeMutable(DEFAULT_SHUTTER_SPEED),
  isoAuto: makeMutable(true),
  shutterSpeedAuto: makeMutable(true),
  evAuto: makeMutable(true),
  torchState: makeMutable(0),
  torchStrength: makeMutable(1),
  aspectRatio: makeMutable(1), // 0: 4:3, 1: 16:9, 2: 1:1, 3: 3:2, 4: 65:24
  resolutionSetting: makeMutable(1), // 0: 4K, 1: 1080p, 2: 720p, 3: 480p, 4: 360p, 5: 240p, 6: 144p
  fpsSetting: makeMutable(60), // 1 to 60
  previewIn4k: makeMutable(0),
  capabilities: {
    hasTorch: false,
    maxTorchStrength: 1,
    isoMin: 100,
    isoMax: 3200,
    maxFps: 60,
  },

  setDebugInfo: (fpsVal, resVal, hwFpsVal) => {
    const { fps, resolution, hwFps } = get();
    fps.value = fpsVal;
    resolution.value = resVal;
    hwFps.value = hwFpsVal;
  },
  setIso: (value) => {
    logger.debug('BodyStore', `Setting ISO: ${value}`);
    get().iso.value = value;
    get().isoAuto.value = false;
    get().shutterSpeedAuto.value = false;
    get().evAuto.value = true;
    get().ev.value = DEFAULT_EV;
  },
  setEv: (value) => {
    logger.debug('BodyStore', `Setting EV: ${value}`);
    get().ev.value = value;
    get().evAuto.value = false;
    get().isoAuto.value = true;
    get().shutterSpeedAuto.value = true;
  },
  setShutterSpeed: (value) => {
    logger.debug('BodyStore', `Setting Shutter Speed: ${value}`);
    get().shutterSpeed.value = value;
    get().shutterSpeedAuto.value = false;
    get().isoAuto.value = false;
    get().evAuto.value = true;
    get().ev.value = DEFAULT_EV;
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
  setEvAuto: (value) => {
    get().evAuto.value = value;
    if (value) get().ev.value = DEFAULT_EV;
  },
  setTorchState: (value) => {
    get().torchState.value = value;
  },
  setTorchStrength: (value) => {
    get().torchStrength.value = value;
  },
  setAspectRatio: (value) => {
    get().aspectRatio.value = value;
    usePreferencesStore.getState().setAspectRatioPref(value);
  },
  setResolutionSetting: (value) => {
    get().resolutionSetting.value = value;
    usePreferencesStore.getState().setResolutionSettingPref(value);
  },
  setFpsSetting: (value) => {
    get().fpsSetting.value = value;
    usePreferencesStore.getState().setFpsSettingPref(value);
  },
  setPreviewIn4k: (value) => {
    get().previewIn4k.value = value;
  },
  setCapabilities: (caps) => {
    logger.info('BodyStore', 'Hardware capabilities updated for Body');
    if (caps.maxFps && get().fpsSetting.value > caps.maxFps) {
      get().fpsSetting.value = caps.maxFps;
    }
    set((state) => ({
      capabilities: {
        ...state.capabilities,
        ...caps,
      }
    }));
  },
}));

let parameterChangeListener: (() => void) | null = null;
export const setBodyParameterChangeListener = (listener: () => void) => {
  parameterChangeListener = listener;
};

const bodyStoreState = useBodyStore.getState();
const includedBodySetters = [
  'setIso',
  'setEv',
  'setShutterSpeed',
  'setIsoAuto',
  'setShutterSpeedAuto',
  'setEvAuto',
];

const storeRecord = bodyStoreState as unknown as Record<string, unknown>;

Object.keys(storeRecord).forEach((key) => {
  if (
    includedBodySetters.includes(key) &&
    typeof storeRecord[key] === 'function'
  ) {
    const originalFn = storeRecord[key] as (...args: unknown[]) => void;
    storeRecord[key] = (...args: unknown[]) => {
      originalFn(...args);
      parameterChangeListener?.();
    };
  }
});

