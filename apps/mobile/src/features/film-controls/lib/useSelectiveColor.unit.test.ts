import { renderHook, act } from '@testing-library/react-native';
import { useSelectiveColor } from './useSelectiveColor';
import { useFilmStore } from '@entities/film';

jest.mock('@entities/system');
jest.mock('@shared/lib/hooks/useDoublePress', () => ({
  useDoublePress: () => ({
    handlePressWithDouble: (key: string, cb: () => void) => cb(),
  }),
}));

describe('useSelectiveColor', () => {
  describe('type: saturation', () => {
    it('should initialize with activeColorIndex 0', () => {
      const { result } = renderHook(() => useSelectiveColor('saturation'));

      expect(result.current.activeColorIndex).toBe(0);
      expect(result.current.activeValue).toBe(useFilmStore.getState().satRed);
    });

    it('should update activeColorIndex when handleColorPress is called', () => {
      const { result } = renderHook(() => useSelectiveColor('saturation'));

      act(() => {
        result.current.handleColorPress('red', 0);
      });

      expect(result.current.activeColorIndex).toBe(0);
      expect(result.current.activeValue).toBe(useFilmStore.getState().satRed);
    });
  });

  describe('type: hue', () => {
    it('should initialize with activeColorIndex 0', () => {
      const { result } = renderHook(() => useSelectiveColor('hue'));

      expect(result.current.activeColorIndex).toBe(0);
      expect(result.current.activeValue).toBe(useFilmStore.getState().hueRed);
    });

    it('should update activeColorIndex when handleColorPress is called', () => {
      const { result } = renderHook(() => useSelectiveColor('hue'));

      act(() => {
        result.current.handleColorPress('red', 0);
      });

      expect(result.current.activeColorIndex).toBe(0);
      expect(result.current.activeValue).toBe(useFilmStore.getState().hueRed);
    });
  });
});
