import { renderHook, act } from '@testing-library/react-native';
import { useSelectiveColor } from './useSelectiveColor';
import { useFilmStore } from '@entities/film';
import { useSystemStore, useControlPanelStore } from '@entities/system';
import { DEFAULT_SELECTIVE_SATURATION, DEFAULT_SELECTIVE_HUE } from '@grovkornet/shared';

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

describe('useSelectiveColor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useControlPanelStore.setState({
      selectedColorIndex: 0,
    });
    useFilmStore.setState({
      satRed: { value: 10 } as any,
      satOrange: { value: 20 } as any,
      satYellow: { value: 30 } as any,
      satGreen: { value: 40 } as any,
      satCyan: { value: 50 } as any,
      satBlue: { value: 60 } as any,
      satPurple: { value: 70 } as any,
      satMagenta: { value: 80 } as any,

      hueRed: { value: 15 } as any,
      hueOrange: { value: 25 } as any,
      hueYellow: { value: 35 } as any,
      hueGreen: { value: 45 } as any,
      hueCyan: { value: 55 } as any,
      hueBlue: { value: 65 } as any,
      huePurple: { value: 75 } as any,
      hueMagenta: { value: 85 } as any,
    });
  });

  const satColors = [
    { name: 'red', index: 0, storeKey: 'satRed' },
    { name: 'orange', index: 1, storeKey: 'satOrange' },
    { name: 'yellow', index: 2, storeKey: 'satYellow' },
    { name: 'green', index: 3, storeKey: 'satGreen' },
    { name: 'cyan', index: 4, storeKey: 'satCyan' },
    { name: 'blue', index: 5, storeKey: 'satBlue' },
    { name: 'purple', index: 6, storeKey: 'satPurple' },
    { name: 'magenta', index: 7, storeKey: 'satMagenta' },
  ];

  const hueColors = [
    { name: 'red', index: 0, storeKey: 'hueRed' },
    { name: 'orange', index: 1, storeKey: 'hueOrange' },
    { name: 'yellow', index: 2, storeKey: 'hueYellow' },
    { name: 'green', index: 3, storeKey: 'hueGreen' },
    { name: 'cyan', index: 4, storeKey: 'hueCyan' },
    { name: 'blue', index: 5, storeKey: 'hueBlue' },
    { name: 'purple', index: 6, storeKey: 'huePurple' },
    { name: 'magenta', index: 7, storeKey: 'hueMagenta' },
  ];

  describe('type: saturation', () => {
    satColors.forEach(({ name, index, storeKey }) => {
      it(`should handle operations for saturation - ${name} (index ${index})`, () => {
        const { result } = renderHook(() => useSelectiveColor('saturation'));

        act(() => {
          result.current.handleColorPress(name, index);
        });

        expect(result.current.activeColorIndex).toBe(index);
        expect(result.current.activeValue).toBe((useFilmStore.getState() as any)[storeKey]);

        // Verify activeSetter
        act(() => {
          result.current.activeSetter(99);
        });
        expect((useFilmStore.getState() as any)[storeKey].value).toBe(99);

        // Verify activeWorklet
        expect(result.current.activeWorklet).toBeDefined();

        // Verify activeReset
        act(() => {
          result.current.activeReset();
        });
        expect((useFilmStore.getState() as any)[storeKey].value).toBe(DEFAULT_SELECTIVE_SATURATION);
      });
    });

    it('triggers full reset bounds for each color under saturation', () => {
      renderHook(() => useSelectiveColor('saturation'));

      satColors.forEach(({ name }) => {
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

  describe('type: hue', () => {
    hueColors.forEach(({ name, index, storeKey }) => {
      it(`should handle operations for hue - ${name} (index ${index})`, () => {
        const { result } = renderHook(() => useSelectiveColor('hue'));

        act(() => {
          result.current.handleColorPress(name, index);
        });

        expect(result.current.activeColorIndex).toBe(index);
        expect(result.current.activeValue).toBe((useFilmStore.getState() as any)[storeKey]);

        // Verify activeSetter
        act(() => {
          result.current.activeSetter(88);
        });
        expect((useFilmStore.getState() as any)[storeKey].value).toBe(88);

        // Verify activeWorklet
        expect(result.current.activeWorklet).toBeDefined();

        // Verify activeReset
        act(() => {
          result.current.activeReset();
        });
        expect((useFilmStore.getState() as any)[storeKey].value).toBe(DEFAULT_SELECTIVE_HUE);
      });
    });

    it('triggers full reset bounds for each color under hue', () => {
      renderHook(() => useSelectiveColor('hue'));

      hueColors.forEach(({ name }) => {
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
});
