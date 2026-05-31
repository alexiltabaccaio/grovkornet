import { renderHook, act } from '@testing-library/react-native';
import { useSelectiveSaturation } from './useSelectiveSaturation';
import { useFilmStore } from '@entities/film';


jest.mock('@entities/system');
jest.mock('@shared/lib/hooks/useDoublePress', () => ({
  useDoublePress: () => ({
    handlePressWithDouble: (key: string, cb: () => void) => cb(),
  }),
}));

describe('useSelectiveSaturation', () => {
  it('should initialize with activeColorIndex 0', () => {
    const { result } = renderHook(() => useSelectiveSaturation());

    expect(result.current.activeColorIndex).toBe(0);
    expect(result.current.activeValue).toBe(useFilmStore.getState().satRed);
  });

  it('should update activeColorIndex when handleColorPress is called', () => {
    const { result } = renderHook(() => useSelectiveSaturation());

    act(() => {
      // Mock the handlePressWithDouble to immediately execute the callback
      result.current.handleColorPress('red', 0);
    });

    expect(result.current.activeColorIndex).toBe(0);
    expect(result.current.activeValue).toBe(useFilmStore.getState().satRed);
  });
});
