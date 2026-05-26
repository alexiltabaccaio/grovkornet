import { renderHook, act } from '@testing-library/react-native';
import { useSelectiveSaturation } from './useSelectiveSaturation';
import { useFilmStore } from '@entities/film';
import { useSystemStore } from '@entities/system';

describe('useSelectiveSaturation', () => {
  beforeEach(() => {
    act(() => {
      useSystemStore.getState().setActiveParameter('none');
    });
  });

  it('initializes with activeColorIndex as master', () => {
    const { result } = renderHook(() => useSelectiveSaturation());
    expect(result.current.activeColorIndex).toBe('master');
    expect(result.current.isMaster).toBe(true);
  });

  it('changes active parameter to saturation and resets activeColorIndex to master', () => {
    const { result, rerender } = renderHook(() => useSelectiveSaturation());
    
    act(() => {
      useSystemStore.getState().setActiveParameter('saturation');
    });
    
    rerender(undefined);
    expect(result.current.activeColorIndex).toBe('master');
  });

  it('handles color pressing and updates active index', () => {
    const { result } = renderHook(() => useSelectiveSaturation());

    act(() => {
      result.current.handleColorPress('red', 0);
    });

    expect(result.current.activeColorIndex).toBe(0);
    expect(result.current.isMaster).toBe(false);
    expect(result.current.activeValue).toBe(useFilmStore.getState().satRed);
  });
});
