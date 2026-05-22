import { renderHook } from '@testing-library/react-native';
import { useBodyParameterControlData } from './useBodyParameterControlData';
import { useBodyStore } from '../model/useBodyStore';

describe('useBodyParameterControlData', () => {
  beforeEach(() => {
    // Reset store to default before each test
    const body = useBodyStore.getState();
    body.setIsoAuto(true);
    body.setShutterSpeedAuto(true);
    body.setIso(800);
    body.setEv(0);
  });

  it('maps "iso" parameter correctly', () => {
    const { result } = renderHook(() => useBodyParameterControlData('iso'));

    expect(result.current).toBeDefined();
    expect(result.current.minValue).toBe(100); // default capabilities value in store
    expect(result.current.maxValue).toBe(3200); // default capabilities value in store
    expect(result.current.autoValueText).toBe('AUTO');
    expect(result.current.hideValueInAuto).toBe(true);

    result.current.onChange(1600);
    expect(useBodyStore.getState().iso.value).toBe(1600);
    expect(useBodyStore.getState().isoAuto.value).toBe(false);
  });

  it('maps "ev" parameter correctly and handles enabled state when auto mode is active', () => {
    const { result } = renderHook(() => useBodyParameterControlData('ev'));

    // Both shutter and ISO are in Auto in beforeEach, so ev is NOT disabled (isEvDisabled should be false)
    expect(result.current.disabled?.value).toBe(false);
  });

  it('maps "ev" parameter correctly and handles enabled state when manual mode is active', () => {
    const body = useBodyStore.getState();
    body.setIsoAuto(false); // disable auto mode before rendering hook

    const { result } = renderHook(() => useBodyParameterControlData('ev'));
    expect(result.current.disabled?.value).toBe(true);
  });
});
