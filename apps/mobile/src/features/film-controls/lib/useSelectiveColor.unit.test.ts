import { renderHook, act } from '@testing-library/react-native';
import { useSelectiveColor } from './useSelectiveColor';
import { useFilmStore } from '@entities/film';
import { useSystemStore } from '@entities/system';

jest.mock('@shared/lib/hooks/useDoublePress', () => ({
  useDoublePress: () => ({
    handlePressWithDouble: (key: string, cb: () => void) => cb(),
  }),
}));

describe('useSelectiveColor', () => {
  beforeEach(() => {
    useSystemStore.setState({ selectedColorIndex: 0 });
    jest.clearAllMocks();
  });

  describe('type: saturation', () => {
    it('should initialize with activeColorIndex 0', () => {
      const { result } = renderHook(() => useSelectiveColor('saturation'));

      expect(result.current.activeColorIndex).toBe(0);
      expect(result.current.activeValue).toBe(useFilmStore.getState().satRed);
    });

    it('should update activeColorIndex when handleColorPress is called', () => {
      const { result } = renderHook(() => useSelectiveColor('saturation'));

      act(() => {
        result.current.handleColorPress('green', 3);
      });

      expect(useSystemStore.getState().selectedColorIndex).toBe(3);
      expect(result.current.activeColorIndex).toBe(3);
    });
  });

  describe('type: hue', () => {
    it('should initialize with activeColorIndex from store', () => {
      useSystemStore.setState({ selectedColorIndex: 3 }); // Start on green
      const { result } = renderHook(() => useSelectiveColor('hue'));

      expect(result.current.activeColorIndex).toBe(3);
      expect(result.current.activeValue).toBe(useFilmStore.getState().hueGreen);
    });

    it('should update activeColorIndex when handleColorPress is called', () => {
      const { result } = renderHook(() => useSelectiveColor('hue'));

      act(() => {
        result.current.handleColorPress('red', 0);
      });

      expect(useSystemStore.getState().selectedColorIndex).toBe(0);
      expect(result.current.activeColorIndex).toBe(0);
    });
  });
});
