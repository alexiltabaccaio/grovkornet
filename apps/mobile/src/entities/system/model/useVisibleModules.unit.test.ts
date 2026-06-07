import { renderHook, act } from '@testing-library/react-native';
import { useVisibleModules } from './useVisibleModules';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { useFilmStore } from '@entities/film';

describe('useVisibleModules', () => {
  beforeEach(() => {
    act(() => {
      useBodyStore.setState({
        capabilities: {
          hasTorch: true,
          maxTorchStrength: 1,
          isoMin: 100,
          isoMax: 3200,
          maxFps: 60,
        },
      });
      useLensStore.setState({
        capabilities: {
          supportsFocus: true,
          availableCameras: [{ id: '0', focalLength: 26, focalLength35mm: 26 }],
        },
      });
      useFilmStore.setState({
        capabilities: {
          availableNoiseReductionModes: [1, 2],
          availableEdgeModes: [1, 2],
        },
      });
    });
  });

  it('returns all body modules when torch is available', () => {
    const { result } = renderHook(() => useVisibleModules('body'));
    expect(result.current).toContain('exposure');
    expect(result.current).toContain('lighting');
    expect(result.current).toContain('processing');
    expect(result.current).toContain('capture');
  });

  it('filters out lighting module when torch is unavailable', () => {
    act(() => {
      useBodyStore.setState({
        capabilities: {
          ...useBodyStore.getState().capabilities,
          hasTorch: false,
        },
      });
    });

    const { result } = renderHook(() => useVisibleModules('body'));
    expect(result.current).toContain('exposure');
    expect(result.current).not.toContain('lighting');
    expect(result.current).toContain('processing');
    expect(result.current).toContain('capture');
  });

  it('returns correct modules for film section', () => {
    const { result } = renderHook(() => useVisibleModules('film'));
    expect(result.current).toEqual(['tone', 'color', 'texture', 'artifacts']);
  });
});
