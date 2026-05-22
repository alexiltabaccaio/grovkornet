import { renderHook } from '@testing-library/react-native';
import { useFilmParameterControlData } from './useFilmParameterControlData';
import { useFilmStore } from '../model/useFilmStore';

describe('useFilmParameterControlData', () => {
  beforeEach(() => {
    // Reset store to default before each test
    const film = useFilmStore.getState();
    film.setGrainIntensity(0);
    film.setSaturation(1.0);
    film.setTemperatureAuto(true);
  });

  it('maps "grain" parameter correctly', () => {
    const { result } = renderHook(() => useFilmParameterControlData('grain'));

    expect(result.current).toBeDefined();
    expect(result.current.minValue).toBe(0);
    expect(result.current.maxValue).toBe(2.0);
    expect(result.current.value.value).toBe(0); // filmStore grainIntensity default

    // Test onChange callback
    result.current.onChange(0.55);
    expect(useFilmStore.getState().grainIntensity.value).toBe(0.55);

    // Test formatter
    const formatted = result.current.valueFormatter(0.55);
    expect(formatted).toBe('55');
  });

  it('maps "temperature" parameter correctly', () => {
    const { result } = renderHook(() => useFilmParameterControlData('temperature'));

    expect(result.current.minValue).toBe(2000);
    expect(result.current.maxValue).toBe(10000);
    expect(result.current.autoValueText).toBe('AWB');
    expect(result.current.hideValueInAuto).toBe(true);
  });
});
