import { renderHook } from '@testing-library/react-native';
import { useLensParameterControlData } from './useLensParameterControlData';
import { useLensStore } from '../model/useLensStore';

describe('useLensParameterControlData', () => {
  beforeEach(() => {
    // Reset store to default before each test
    const lens = useLensStore.getState();
    lens.setFocusAuto(true);
    lens.setFocusDistance(0.0);
  });

  it('maps "focus" parameter correctly', () => {
    const { result } = renderHook(() => useLensParameterControlData('focus'));

    expect(result.current).toBeDefined();
    expect(result.current.minValue).toBe(0);
    expect(result.current.maxValue).toBe(10);
    expect(result.current.autoValueText).toBe('AF');
    expect(result.current.hideValueInAuto).toBe(true);

    result.current.onChange(5);
    expect(useLensStore.getState().focusDistance.value).toBe(5);

    // Test value formatting worklet
    const formattedInfinity = result.current.valueFormatter(0.05);
    expect(formattedInfinity).toBe('∞');

    const formattedMeters = result.current.valueFormatter(1.0); // 1 / 1 = 1m
    expect(formattedMeters).toBe('1.0m');

    const formattedCm = result.current.valueFormatter(2.0); // 1 / 2 = 0.5m = 50cm
    expect(formattedCm).toBe('50cm');
  });
});
