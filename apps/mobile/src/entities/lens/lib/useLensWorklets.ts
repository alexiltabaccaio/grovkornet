import { useMemo } from 'react';
import { useLensStore } from '../model/useLensStore';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';

export const useLensWorklets = () => {
  return useMemo(() => {
    const lens = useLensStore.getState();

    const updateFocusDistance = (value: number) => {
      'worklet';
      updateSharedValue(lens.focusDistance, value);
      updateSharedValue(lens.focusAuto, false);
    };

    return {
      updateFocusDistance,
    };
  }, []);
};
