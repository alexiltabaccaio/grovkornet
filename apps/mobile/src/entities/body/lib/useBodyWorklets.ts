import { useMemo } from 'react';
import { useBodyStore } from '../model/useBodyStore';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';
import { DEFAULT_EV } from '@grovkornet/shared';

export const useBodyWorklets = () => {
  return useMemo(() => {
    const body = useBodyStore.getState();

    const updateIso = (value: number) => {
      'worklet';
      updateSharedValue(body.iso, value);
      updateSharedValue(body.isoAuto, false);
      updateSharedValue(body.shutterSpeedAuto, false);
      updateSharedValue(body.evAuto, true);
      updateSharedValue(body.ev, DEFAULT_EV);
    };

    const updateEv = (value: number) => {
      'worklet';
      updateSharedValue(body.ev, value);
      updateSharedValue(body.evAuto, false);
      updateSharedValue(body.isoAuto, true);
      updateSharedValue(body.shutterSpeedAuto, true);
    };

    const updateShutterSpeed = (value: number) => {
      'worklet';
      updateSharedValue(body.shutterSpeed, value);
      updateSharedValue(body.shutterSpeedAuto, false);
      updateSharedValue(body.isoAuto, false);
      updateSharedValue(body.evAuto, true);
      updateSharedValue(body.ev, DEFAULT_EV);
    };

    const updateTorchStrength = (value: number) => {
      'worklet';
      updateSharedValue(body.torchStrength, value);
    };

    return {
      updateIso,
      updateEv,
      updateShutterSpeed,
      updateTorchStrength,
    };
  }, []);
};
