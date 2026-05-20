import { renderHook } from '@testing-library/react-native';
import { useParameterControlData } from './useParameterControlData';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';

describe('useParameterControlData', () => {
  beforeEach(() => {
    // Reset stores to default before each test if necessary
    const styles = useStylesStore.getState();
    styles.setGrainIntensity(0);
    styles.setSaturation(1.0);

    const hw = useHardwareStore.getState();
    hw.setIsoAuto(true);
    hw.setShutterSpeedAuto(true);
    hw.setIso(800);
    hw.setEv(0);
  });

  it('maps "grain" parameter correctly', () => {
    const { result } = renderHook(() => useParameterControlData('grain'));

    expect(result.current).toBeDefined();
    expect(result.current?.minValue).toBe(0);
    expect(result.current?.maxValue).toBe(1.0);
    expect(result.current?.value.value).toBe(0); // stylesStore grainIntensity default
    
    // Test onChange callback
    result.current?.onChange(0.55);
    expect(useStylesStore.getState().grainIntensity.value).toBe(0.55);

    // Test formatter
    const formatted = result.current?.valueFormatter(0.55);
    expect(formatted).toBe('55');
  });

  it('maps "iso" parameter correctly', () => {
    const { result } = renderHook(() => useParameterControlData('iso'));

    expect(result.current?.minValue).toBe(100); // default capabilities value in store
    expect(result.current?.maxValue).toBe(3200); // default capabilities value in store
    expect(result.current?.autoValueText).toBe('AUTO');
    expect(result.current?.hideValueInAuto).toBe(true);

    result.current?.onChange(1600);
    expect(useHardwareStore.getState().iso.value).toBe(1600);
    expect(useHardwareStore.getState().isoAuto.value).toBe(false);
  });

  it('maps "ev" parameter correctly and handles enabled state when auto mode is active', () => {
    const { result } = renderHook(() => useParameterControlData('ev'));

    // Both shutter and ISO are in Auto in beforeEach, so ev is NOT disabled (isEvDisabled should be false)
    expect(result.current?.disabled?.value).toBe(false);
  });

  it('maps "ev" parameter correctly and handles disabled state when manual mode is active', () => {
    const hw = useHardwareStore.getState();
    hw.setIsoAuto(false); // disable auto mode before rendering hook

    const { result } = renderHook(() => useParameterControlData('ev'));
    expect(result.current?.disabled?.value).toBe(true);
  });

  it('maps "temperature" parameter correctly', () => {
    const { result } = renderHook(() => useParameterControlData('temperature'));

    expect(result.current?.minValue).toBe(2000);
    expect(result.current?.maxValue).toBe(10000);
    expect(result.current?.autoValueText).toBe('AWB');
  });
});
