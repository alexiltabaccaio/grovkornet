import { renderHook } from '@testing-library/react-native';
import { useFilmParameterControlData } from './useFilmParameterControlData';
import { useFilmStore } from '../model/useFilmStore';
import { DEFAULT_TINT } from '@grovkornet/shared';

describe('useFilmParameterControlData', () => {
  beforeEach(() => {
    // Reset store to default before each test
    const film = useFilmStore.getState();
    film.setGrainIntensity(0);
    film.setSharpening(0);
    film.setSaturation(1.0);
    film.setContrast(1.0);
    film.setChromaticAberration(0);
    film.setBloomIntensity(0);
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

    // Test reset
    result.current.onReset?.();
    expect(useFilmStore.getState().grainIntensity.value).toBe(0);
  });

  it('maps "sharpening" parameter correctly', () => {
    const { result } = renderHook(() => useFilmParameterControlData('sharpening'));

    expect(result.current.minValue).toBe(0);
    expect(result.current.maxValue).toBe(1.0);

    result.current.onChange(0.8);
    expect(useFilmStore.getState().sharpening.value).toBe(0.8);

    const formatted = result.current.valueFormatter(0.8);
    expect(formatted).toBe('80');

    result.current.onReset?.();
    expect(useFilmStore.getState().sharpening.value).toBe(0.0);
  });

  it('maps "saturation" parameter correctly', () => {
    const { result } = renderHook(() => useFilmParameterControlData('saturation'));

    expect(result.current.minValue).toBe(0);
    expect(result.current.maxValue).toBe(2.0);
    expect(result.current.centerValue).toBe(1.0);

    result.current.onChange(1.25);
    expect(useFilmStore.getState().saturation.value).toBe(1.25);

    // Test valueFormatter positive
    expect(result.current.valueFormatter(1.25)).toBe('125');

    // Test valueFormatter negative/zero
    expect(result.current.valueFormatter(0.85)).toBe('85');
    expect(result.current.valueFormatter(1.0)).toBe('100');

    result.current.onReset?.();
    expect(useFilmStore.getState().saturation.value).toBe(1.0);
  });

  it('maps "contrast" parameter correctly', () => {
    const { result } = renderHook(() => useFilmParameterControlData('contrast'));

    expect(result.current.minValue).toBe(0);
    expect(result.current.maxValue).toBe(2.0);
    expect(result.current.centerValue).toBe(1.0);

    result.current.onChange(1.15);
    expect(useFilmStore.getState().contrast.value).toBe(1.15);

    expect(result.current.valueFormatter(1.15)).toBe('+15');
    expect(result.current.valueFormatter(0.9)).toBe('-10');

    result.current.onReset?.();
    expect(useFilmStore.getState().contrast.value).toBe(1.0);
  });

  it('maps "chromatic_aberration" parameter correctly', () => {
    const { result } = renderHook(() => useFilmParameterControlData('chromatic_aberration'));

    expect(result.current.minValue).toBe(0);
    expect(result.current.maxValue).toBe(2.0);

    result.current.onChange(0.5);
    expect(useFilmStore.getState().chromaticAberration.value).toBe(0.5);

    expect(result.current.valueFormatter(0.5)).toBe('50');

    result.current.onReset?.();
    expect(useFilmStore.getState().chromaticAberration.value).toBe(0.0);
  });

  it('maps "bloom" parameter correctly', () => {
    const { result } = renderHook(() => useFilmParameterControlData('bloom'));

    expect(result.current.minValue).toBe(0);
    expect(result.current.maxValue).toBe(1.0);

    result.current.onChange(0.3);
    expect(useFilmStore.getState().bloomIntensity.value).toBe(0.3);

    expect(result.current.valueFormatter(0.3)).toBe('30');

    result.current.onReset?.();
    expect(useFilmStore.getState().bloomIntensity.value).toBe(0.0);
  });

  it('maps "temperature" parameter correctly', () => {
    const { result } = renderHook(() => useFilmParameterControlData('temperature'));

    expect(result.current.minValue).toBe(2000);
    expect(result.current.maxValue).toBe(10000);
    expect(result.current.autoValueText).toBe('AWB');
    expect(result.current.hideValueInAuto).toBe(true);

    result.current.onChange(5500);
    expect(useFilmStore.getState().temperature.value).toBe(5500);
    expect(useFilmStore.getState().temperatureAuto.value).toBe(false);

    expect(result.current.valueFormatter(5500)).toBe('5500K');

    result.current.onReset?.();
    expect(useFilmStore.getState().temperatureAuto.value).toBe(true);

    result.current.onToggleAuto?.(false);
    expect(useFilmStore.getState().temperatureAuto.value).toBe(false);
  });

  it('maps "tint" parameter correctly', () => {
    const { result } = renderHook(() => useFilmParameterControlData('tint'));

    expect(result.current.minValue).toBe(-100);
    expect(result.current.maxValue).toBe(100);
    expect(result.current.centerValue).toBe(0);
    expect(result.current.autoValueText).toBe('AWB');
    expect(result.current.hideValueInAuto).toBe(true);

    result.current.onChange(20);
    expect(useFilmStore.getState().tint.value).toBe(20);

    expect(result.current.valueFormatter(20.4)).toBe('+20');
    expect(result.current.valueFormatter(-10.2)).toBe('-10');

    result.current.onReset?.();
    expect(useFilmStore.getState().temperatureAuto.value).toBe(true);
    expect(useFilmStore.getState().tint.value).toBe(DEFAULT_TINT);

    result.current.onToggleAuto?.(false);
    expect(useFilmStore.getState().temperatureAuto.value).toBe(false);
  });
});
