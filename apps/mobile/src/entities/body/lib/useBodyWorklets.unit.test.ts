import { renderHook } from '@testing-library/react-native';
import { useBodyWorklets } from './useBodyWorklets';
import { useBodyStore } from '../model/useBodyStore';
import { DEFAULT_ISO, DEFAULT_EV, DEFAULT_SHUTTER_SPEED } from '@grovkornet/shared';

describe('useBodyWorklets', () => {
  beforeEach(() => {
    // Reset store state
    const body = useBodyStore.getState();
    body.setIsoAuto(true);
    body.setEvAuto(true);
    body.setIso(DEFAULT_ISO);
    body.setEv(DEFAULT_EV);
    body.setShutterSpeed(DEFAULT_SHUTTER_SPEED);
    body.setTorchStrength(1.0);
  });

  it('correctly updates ISO and related modes in updateIso worklet', () => {
    const { result } = renderHook(() => useBodyWorklets());
    const worklets = result.current;

    worklets.updateIso(1600);

    const state = useBodyStore.getState();
    expect(state.iso.value).toBe(1600);
    expect(state.isoAuto.value).toBe(false);
    expect(state.shutterSpeedAuto.value).toBe(false);
    expect(state.evAuto.value).toBe(true);
    expect(state.ev.value).toBe(DEFAULT_EV);
  });

  it('correctly updates EV and related modes in updateEv worklet', () => {
    const { result } = renderHook(() => useBodyWorklets());
    const worklets = result.current;

    worklets.updateEv(1.5);

    const state = useBodyStore.getState();
    expect(state.ev.value).toBe(1.5);
    expect(state.evAuto.value).toBe(false);
    expect(state.isoAuto.value).toBe(true);
    expect(state.shutterSpeedAuto.value).toBe(true);
  });

  it('correctly updates shutter speed and related modes in updateShutterSpeed worklet', () => {
    const { result } = renderHook(() => useBodyWorklets());
    const worklets = result.current;

    worklets.updateShutterSpeed(500);

    const state = useBodyStore.getState();
    expect(state.shutterSpeed.value).toBe(500);
    expect(state.shutterSpeedAuto.value).toBe(false);
    expect(state.isoAuto.value).toBe(false);
    expect(state.evAuto.value).toBe(true);
    expect(state.ev.value).toBe(DEFAULT_EV);
  });

  it('correctly updates torch strength in updateTorchStrength worklet', () => {
    const { result } = renderHook(() => useBodyWorklets());
    const worklets = result.current;

    worklets.updateTorchStrength(0.5);

    const state = useBodyStore.getState();
    expect(state.torchStrength.value).toBe(0.5);
  });
});
