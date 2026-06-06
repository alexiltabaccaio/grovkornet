import { renderHook, act } from '@testing-library/react-native';
import { useSelectiveHue } from './useSelectiveHue';
import { useFilmStore } from '@entities/film';

jest.mock('@entities/system');
jest.mock('@shared/lib/hooks/useDoublePress', () => ({
  useDoublePress: () => ({
    handlePressWithDouble: (key: string, cb: () => void) => cb(),
  }),
}));

describe('useSelectiveHue', () => {
  it('should initialize with activeColorIndex 0', () => {
    const { result } = renderHook(() => useSelectiveHue());

    expect(result.current.activeColorIndex).toBe(0);
    expect(result.current.activeValue).toBe(useFilmStore.getState().hueRed);
  });

  it('should update activeColorIndex when handleColorPress is called', () => {
    const { result } = renderHook(() => useSelectiveHue());

    act(() => {
      result.current.handleColorPress('red', 0);
    });

    expect(result.current.activeColorIndex).toBe(0);
    expect(result.current.activeValue).toBe(useFilmStore.getState().hueRed);
  });
});
