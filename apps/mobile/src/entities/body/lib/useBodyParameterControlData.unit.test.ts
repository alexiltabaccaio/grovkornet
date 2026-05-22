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

    // Test formatter
    const formatted = result.current.valueFormatter(1234.5);
    expect(formatted).toBe('1235');

    // Test reset
    result.current.onReset?.();
    expect(useBodyStore.getState().isoAuto.value).toBe(true);
  });

  it('maps "ev" parameter correctly and handles enabled state when auto mode is active', () => {
    const { result } = renderHook(() => useBodyParameterControlData('ev'));

    // Both shutter and ISO are in Auto in beforeEach, so ev is NOT disabled (isEvDisabled should be false)
    expect(result.current.disabled?.value).toBe(false);

    // Test onChange
    result.current.onChange(1.5);
    expect(useBodyStore.getState().ev.value).toBe(1.5);

    // Test valueFormatter for positive EV
    const formattedPos = result.current.valueFormatter(1.5);
    expect(formattedPos).toBe('+1.5');

    // Test valueFormatter for negative EV
    const formattedNeg = result.current.valueFormatter(-0.5);
    expect(formattedNeg).toBe('-0.5');

    // Test reset
    result.current.onReset?.();
    expect(useBodyStore.getState().ev.value).toBe(0.0);
  });

  it('maps "ev" parameter correctly and handles enabled state when manual mode is active', () => {
    const body = useBodyStore.getState();
    body.setIsoAuto(false); // disable auto mode before rendering hook

    const { result } = renderHook(() => useBodyParameterControlData('ev'));
    expect(result.current.disabled?.value).toBe(true);
  });

  it('maps "shutter_speed" parameter correctly', () => {
    const { result } = renderHook(() => useBodyParameterControlData('shutter_speed'));

    expect(result.current).toBeDefined();
    expect(result.current.minValue).toBe(1);
    expect(result.current.maxValue).toBe(1000);
    expect(result.current.autoValueText).toBe('AUTO');
    expect(result.current.hideValueInAuto).toBe(true);

    // Test onChange
    result.current.onChange(500);
    expect(useBodyStore.getState().shutterSpeed.value).toBe(500);

    // Test formatter
    const formatted = result.current.valueFormatter(125.4);
    expect(formatted).toBe('1/125');

    // Test reset
    result.current.onReset?.();
    expect(useBodyStore.getState().shutterSpeedAuto.value).toBe(true);
  });
});
