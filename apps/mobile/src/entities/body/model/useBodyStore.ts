import { create } from 'zustand';
import { makeMutable } from 'react-native-reanimated';
import { logger } from '@shared/lib/logger';
import { BodyStore } from './types';
import { 
  DEFAULT_ISO,
  DEFAULT_EV,
  DEFAULT_SHUTTER_SPEED,
  DEFAULT_FPS_SETTING,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_ISO_AUTO,
  DEFAULT_SHUTTER_SPEED_AUTO,
  DEFAULT_TORCH_STATE,
  DEFAULT_TORCH_STRENGTH,
  DEFAULT_RESOLUTION_SETTING,
  DEFAULT_PREVIEW_IN_4K,
  DEFAULT_FORCE_4K_60FPS_CROP,
  DEFAULT_ZOOM,
} from '@grovkornet/shared';

export const useBodyStore = create<BodyStore>((set, get) => ({
  fps: makeMutable(0),
  hwFps: makeMutable(0),
  resolution: makeMutable(''),
  evAuto: makeMutable(true),
  // @@GEN_STATE_START@@
  ev: makeMutable(DEFAULT_EV),
  fpsSetting: makeMutable(DEFAULT_FPS_SETTING),
  aspectRatio: makeMutable(DEFAULT_ASPECT_RATIO),
  isoAuto: makeMutable(DEFAULT_ISO_AUTO),
  shutterSpeedAuto: makeMutable(DEFAULT_SHUTTER_SPEED_AUTO),
  iso: makeMutable(DEFAULT_ISO),
  shutterSpeed: makeMutable(DEFAULT_SHUTTER_SPEED),
  torchState: makeMutable(DEFAULT_TORCH_STATE),
  torchStrength: makeMutable(DEFAULT_TORCH_STRENGTH),
  resolutionSetting: makeMutable(DEFAULT_RESOLUTION_SETTING),
  previewIn4k: makeMutable(DEFAULT_PREVIEW_IN_4K),
  force4k60fpsCrop: makeMutable(DEFAULT_FORCE_4K_60FPS_CROP),
  zoom: makeMutable(DEFAULT_ZOOM),
  // @@GEN_STATE_END@@
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
  setEvAuto: (value) => {
    get().evAuto.value = value;
    if (value) get().ev.value = DEFAULT_EV;
  },
  // @@GEN_SETTERS_START@@
  setEv: (value) => {
    const { ev, evAuto, isoAuto, shutterSpeedAuto } = get();
    logger.debug('BodyStore', `Setting Ev: ${value}`);
    ev.value = value;
    evAuto.value = false;
    isoAuto.value = true;
    shutterSpeedAuto.value = true;

  },
  setFpsSetting: (value) => {
    get().fpsSetting.value = value;
  },
  setAspectRatio: (value) => {
    get().aspectRatio.value = value;
  },
  setIsoAuto: (value) => {
    const { isoAuto, shutterSpeedAuto, iso, shutterSpeed } = get();
    isoAuto.value = value;
    shutterSpeedAuto.value = value;
    if (value) {
      iso.value = DEFAULT_ISO;
      shutterSpeed.value = DEFAULT_SHUTTER_SPEED;
    }

  },
  setShutterSpeedAuto: (value) => {
    const { shutterSpeedAuto, isoAuto, shutterSpeed, iso } = get();
    shutterSpeedAuto.value = value;
    isoAuto.value = value;
    if (value) {
      shutterSpeed.value = DEFAULT_SHUTTER_SPEED;
      iso.value = DEFAULT_ISO;
    }

  },
  setIso: (value) => {
    const { iso, isoAuto, shutterSpeedAuto, evAuto, ev } = get();
    logger.debug('BodyStore', `Setting Iso: ${value}`);
    iso.value = value;
    isoAuto.value = false;
    shutterSpeedAuto.value = false;
    evAuto.value = true;
    ev.value = DEFAULT_EV;

  },
  setShutterSpeed: (value) => {
    const { shutterSpeed, shutterSpeedAuto, isoAuto, evAuto, ev } = get();
    logger.debug('BodyStore', `Setting Shutter Speed: ${value}`);
    shutterSpeed.value = value;
    shutterSpeedAuto.value = false;
    isoAuto.value = false;
    evAuto.value = true;
    ev.value = DEFAULT_EV;

  },
  setTorchState: (value) => {
    get().torchState.value = value;
  },
  setTorchStrength: (value) => {
    get().torchStrength.value = value;
  },
  setResolutionSetting: (value) => {
    get().resolutionSetting.value = value;
  },
  setPreviewIn4k: (value) => {
    get().previewIn4k.value = value;
  },
  setForce4k60fpsCrop: (value) => {
    get().force4k60fpsCrop.value = value;
  },
  setZoom: (value) => {
    get().zoom.value = value;
  },
  // @@GEN_SETTERS_END@@
  setCapabilities: (caps) => {
    logger.info('BodyStore', 'Hardware capabilities updated for Body');
    if (caps.maxFps && get().fpsSetting.value > caps.maxFps) {
      get().fpsSetting.value = caps.maxFps;
    }
    if (caps.maxZoom && get().zoom.value > caps.maxZoom) {
      get().zoom.value = caps.maxZoom;
    }
    if (caps.minZoom && get().zoom.value < caps.minZoom) {
      get().zoom.value = caps.minZoom;
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
let bodyListenerTimeout: NodeJS.Timeout | null = null;

export const setBodyParameterChangeListener = (listener: () => void) => {
  parameterChangeListener = listener;
};

const bodyStoreState = useBodyStore.getState();
const storeRecord = bodyStoreState as unknown as Record<string, unknown>;

Object.keys(storeRecord).forEach((key) => {
  if (
    key.startsWith('set') &&
    key !== 'setCapabilities' &&
    key !== 'setDebugInfo' &&
    typeof storeRecord[key] === 'function'
  ) {
    const originalFn = storeRecord[key] as (...args: unknown[]) => void;
    storeRecord[key] = (...args: unknown[]) => {
      originalFn(...args);
      if (bodyListenerTimeout) clearTimeout(bodyListenerTimeout);
      bodyListenerTimeout = setTimeout(() => {
        parameterChangeListener?.();
      }, 50);
    };
  }
});


