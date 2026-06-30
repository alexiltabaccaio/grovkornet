import { useBodyStore } from '@entities/body';
import { ParameterType } from '@entities/system';
import { DEFAULT_TORCH_STRENGTH } from '@grovkornet/shared';

export const resetBodyParameter = (param: ParameterType): boolean => {
  const store = useBodyStore.getState();
  switch (param) {
    case 'ev':
      store.setEvAuto(true);
      return true;
    case 'iso':
      store.setIsoAuto(true);
      return true;
    case 'shutter_speed':
      store.setShutterSpeedAuto(true);
      return true;
    case 'torch':
      store.setTorchState(0);
      store.setTorchStrength(DEFAULT_TORCH_STRENGTH);
      return true;
    case 'torch_strength':
      store.setTorchStrength(DEFAULT_TORCH_STRENGTH);
      return true;
    case 'fps_setting': {
      const maxFps = store.capabilities.maxFps ?? 60;
      store.setFpsSetting(maxFps >= 60 ? 60 : 30);
      return true;
    }
    default:
      return false;
  }
};
