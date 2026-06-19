import { renderHook, act } from '@testing-library/react-native';
import { useSelectiveSaturation } from './useSelectiveSaturation';
import { useFilmStore } from '@entities/film';
import { useControlPanelStore } from '@entities/system';
import { DEFAULT_SELECTIVE_SATURATION } from '@grovkornet/shared';

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

describe('useSelectiveSaturation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFilmStore.setState({
      satRed: { value: 10 } as any,
      satOrange: { value: 20 } as any,
      satYellow: { value: 30 } as any,
      satGreen: { value: 40 } as any,
      satCyan: { value: 50 } as any,
      satBlue: { value: 60 } as any,
      satPurple: { value: 70 } as any,
      satMagenta: { value: 80 } as any,
    });
    useControlPanelStore.setState({
      activeParameter: 'saturation',
    });
  });

  const colors = [
    { name: 'red', index: 0, storeKey: 'satRed' },
    { name: 'orange', index: 1, storeKey: 'satOrange' },
    { name: 'yellow', index: 2, storeKey: 'satYellow' },
    { name: 'green', index: 3, storeKey: 'satGreen' },
    { name: 'cyan', index: 4, storeKey: 'satCyan' },
    { name: 'blue', index: 5, storeKey: 'satBlue' },
    { name: 'purple', index: 6, storeKey: 'satPurple' },
    { name: 'magenta', index: 7, storeKey: 'satMagenta' },
  ];

  colors.forEach(({ name, index, storeKey }) => {
    it(`should handle operations for ${name} (index ${index})`, () => {
      const { result } = renderHook(() => useSelectiveSaturation());

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
      expect((useFilmStore.getState() as any)[storeKey].value).toBe(DEFAULT_SELECTIVE_SATURATION);
    });
  });

  it('resets color index to 0 when activeParameter changes to saturation', () => {
    useControlPanelStore.setState({
      activeParameter: 'hue',
    });
    const { result, rerender } = renderHook(() => useSelectiveSaturation());

    act(() => {
      result.current.setActiveColorIndex(3);
    });
    expect(result.current.activeColorIndex).toBe(3);

    act(() => {
      useControlPanelStore.setState({
      activeParameter: 'saturation',
    });
    });
    rerender({});

    expect(result.current.activeColorIndex).toBe(0);
  });

  it('triggers full reset bounds for each color', () => {
    renderHook(() => useSelectiveSaturation());

    colors.forEach(({ name }) => {
      act(() => {
        mockHandleFullColorReset(name);
      });
    });

    const state = useFilmStore.getState();
    expect(state.satRed.value).toBe(DEFAULT_SELECTIVE_SATURATION);
    expect(state.satOrange.value).toBe(DEFAULT_SELECTIVE_SATURATION);
    expect(state.satYellow.value).toBe(DEFAULT_SELECTIVE_SATURATION);
    expect(state.satGreen.value).toBe(DEFAULT_SELECTIVE_SATURATION);
    expect(state.satCyan.value).toBe(DEFAULT_SELECTIVE_SATURATION);
    expect(state.satBlue.value).toBe(DEFAULT_SELECTIVE_SATURATION);
    expect(state.satPurple.value).toBe(DEFAULT_SELECTIVE_SATURATION);
    expect(state.satMagenta.value).toBe(DEFAULT_SELECTIVE_SATURATION);
  });
});
