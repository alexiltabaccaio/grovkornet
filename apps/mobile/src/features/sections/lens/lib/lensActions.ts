import { useLensStore } from '@entities/lens';
import { ParameterType } from '@entities/system';

export const resetLensParameter = (param: ParameterType): boolean => {
  const store = useLensStore.getState();
  switch (param) {
    case 'focus':
      store.setFocusAuto(true);
      return true;
    case 'camera_selection':
      store.setCameraAuto(true);
      return true;
    default:
      return false;
  }
};
