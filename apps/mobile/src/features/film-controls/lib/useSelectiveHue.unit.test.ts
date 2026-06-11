import { renderHook, act } from '@testing-library/react-native';
import { useSelectiveHue } from './useSelectiveHue';
import { useFilmStore } from '@entities/film';
import { useSystemStore } from '@entities/system';
import { DEFAULT_SELECTIVE_HUE } from '@grovkornet/shared';

// Mock double press to execute double tap callback immediately
const mockHandleFullColorReset = jest.fn();
jest.mock('@shared/lib/hooks/useDoublePress', () => ({
  useDoublePress: (cb: any) => {
    mockHandleFullColorReset.mockImplementation(cb);
    return {
      handlePressWithDouble: (key: string, pressCb: () => void) => pressCb(),
    };
  },
}));

describe('useSelectiveHue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFilmStore.setState({
      hueRed: { value: 10 } as any,
      hueOrange: { value: 20 } as any,
      hueYellow: { value: 30 } as any,
      hueGreen: { value: 40 } as any,
      hueCyan: { value: 50 } as any,
      hueBlue: { value: 60 } as any,
      huePurple: { value: 70 } as any,
      hueMagenta: { value: 80 } as any,
    });
    useSystemStore.setState({ activeParameter: 'hue' });
  });

  const colors = [
    { name: 'red', index: 0, storeKey: 'hueRed' },
    { name: 'orange', index: 1, storeKey: 'hueOrange' },
    { name: 'yellow', index: 2, storeKey: 'hueYellow' },
    { name: 'green', index: 3, storeKey: 'hueGreen' },
    { name: 'cyan', index: 4, storeKey: 'hueCyan' },
    { name: 'blue', index: 5, storeKey: 'hueBlue' },
    { name: 'purple', index: 6, storeKey: 'huePurple' },
    { name: 'magenta', index: 7, storeKey: 'hueMagenta' },
  ];

  colors.forEach(({ name, index, storeKey }) => {
    it(`should handle operations for ${name} (index ${index})`, () => {
      const { result } = renderHook(() => useSelectiveHue());

      act(() => {
        result.current.handleColorPress(name, index);
      });

      expect(result.current.activeColorIndex).toBe(index);
      
      // Verify activeValue
      const expectedVal = (useFilmStore.getState() as any)[storeKey];
      expect(result.current.activeValue).toBe(expectedVal);

      // Verify activeSetter
      act(() => {
        result.current.activeSetter(99);
      });
      expect((useFilmStore.getState() as any)[storeKey].value).toBe(99);

      // Verify activeWorklet exists
      expect(result.current.activeWorklet).toBeDefined();

      // Verify activeReset
      act(() => {
        result.current.activeReset();
      });
      expect((useFilmStore.getState() as any)[storeKey].value).toBe(DEFAULT_SELECTIVE_HUE);
    });
  });

  it('resets color index to 0 when activeParameter changes to hue', () => {
    useSystemStore.setState({ activeParameter: 'saturation' });
    const { result, rerender } = renderHook(() => useSelectiveHue());

    act(() => {
      result.current.setActiveColorIndex(3);
    });
    expect(result.current.activeColorIndex).toBe(3);

    act(() => {
      useSystemStore.setState({ activeParameter: 'hue' });
    });
    rerender({});

    expect(result.current.activeColorIndex).toBe(0);
  });

  it('triggers full reset bounds for each color', () => {
    renderHook(() => useSelectiveHue());

    colors.forEach(({ name }) => {
      act(() => {
        mockHandleFullColorReset(name);
      });
    });

    const state = useFilmStore.getState();
    expect(state.hueRed.value).toBe(DEFAULT_SELECTIVE_HUE);
    expect(state.hueOrange.value).toBe(DEFAULT_SELECTIVE_HUE);
    expect(state.hueYellow.value).toBe(DEFAULT_SELECTIVE_HUE);
    expect(state.hueGreen.value).toBe(DEFAULT_SELECTIVE_HUE);
    expect(state.hueCyan.value).toBe(DEFAULT_SELECTIVE_HUE);
    expect(state.hueBlue.value).toBe(DEFAULT_SELECTIVE_HUE);
    expect(state.huePurple.value).toBe(DEFAULT_SELECTIVE_HUE);
    expect(state.hueMagenta.value).toBe(DEFAULT_SELECTIVE_HUE);
  });
});
