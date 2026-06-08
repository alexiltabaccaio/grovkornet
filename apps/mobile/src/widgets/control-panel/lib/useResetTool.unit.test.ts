import { renderHook, act } from '@testing-library/react-native';
import { useResetTool } from './useResetTool';
import { useFilmStore } from '@entities/film';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';

describe('useResetTool', () => {
  let spyResetEffect: jest.SpyInstance;
  let spySetEvAuto: jest.SpyInstance;
  let spySetIsoAuto: jest.SpyInstance;
  let spySetShutterSpeedAuto: jest.SpyInstance;
  let spySetFocusAuto: jest.SpyInstance;
  let spySetTemperatureAuto: jest.SpyInstance;
  let spySetContrastAuto: jest.SpyInstance;
  let spySetBlackLevelAuto: jest.SpyInstance;
  let spySetHighlightsAuto: jest.SpyInstance;
  let spySetPivotAuto: jest.SpyInstance;
  let spySetCameraAuto: jest.SpyInstance;
  let spySetTorchState: jest.SpyInstance;
  let spySetFpsSetting: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    spyResetEffect = jest.spyOn(useFilmStore.getState(), 'resetEffect');
    spySetEvAuto = jest.spyOn(useBodyStore.getState(), 'setEvAuto');
    spySetIsoAuto = jest.spyOn(useBodyStore.getState(), 'setIsoAuto');
    spySetShutterSpeedAuto = jest.spyOn(useBodyStore.getState(), 'setShutterSpeedAuto');
    spySetFocusAuto = jest.spyOn(useLensStore.getState(), 'setFocusAuto');
    spySetTemperatureAuto = jest.spyOn(useFilmStore.getState(), 'setTemperatureAuto');
    spySetContrastAuto = jest.spyOn(useFilmStore.getState(), 'setContrastAuto');
    spySetBlackLevelAuto = jest.spyOn(useFilmStore.getState(), 'setBlackLevelAuto');
    spySetHighlightsAuto = jest.spyOn(useFilmStore.getState(), 'setHighlightsAuto');
    spySetPivotAuto = jest.spyOn(useFilmStore.getState(), 'setPivotAuto');
    spySetCameraAuto = jest.spyOn(useLensStore.getState(), 'setCameraAuto');
    spySetTorchState = jest.spyOn(useBodyStore.getState(), 'setTorchState');
    spySetFpsSetting = jest.spyOn(useBodyStore.getState(), 'setFpsSetting');
  });

  afterEach(() => {
    spyResetEffect.mockRestore();
    spySetEvAuto.mockRestore();
    spySetIsoAuto.mockRestore();
    spySetShutterSpeedAuto.mockRestore();
    spySetFocusAuto.mockRestore();
    spySetTemperatureAuto.mockRestore();
    spySetContrastAuto.mockRestore();
    spySetBlackLevelAuto.mockRestore();
    spySetHighlightsAuto.mockRestore();
    spySetPivotAuto.mockRestore();
    spySetCameraAuto.mockRestore();
    spySetTorchState.mockRestore();
    spySetFpsSetting.mockRestore();
  });

  it('resets exposure parameters correctly', () => {
    const { result } = renderHook(() => useResetTool());
    
    act(() => {
      result.current('ev');
    });
    expect(spySetEvAuto).toHaveBeenCalledWith(true);

    act(() => {
      result.current('iso');
    });
    expect(spySetIsoAuto).toHaveBeenCalledWith(true);

    act(() => {
      result.current('shutter_speed');
    });
    expect(spySetShutterSpeedAuto).toHaveBeenCalledWith(true);
  });

  it('resets optics parameters correctly', () => {
    const { result } = renderHook(() => useResetTool());

    act(() => {
      result.current('focus');
    });
    expect(spySetFocusAuto).toHaveBeenCalledWith(true);

    act(() => {
      result.current('camera_selection');
    });
    expect(spySetCameraAuto).toHaveBeenCalledWith(true);
  });

  it('resets color and tone parameters correctly', () => {
    const { result } = renderHook(() => useResetTool());

    act(() => {
      result.current('temperature');
    });
    expect(spySetTemperatureAuto).toHaveBeenCalledWith(true);

    act(() => {
      result.current('contrast');
    });
    expect(spySetContrastAuto).toHaveBeenCalledWith(true);
    expect(spySetPivotAuto).toHaveBeenCalledWith(true);

    act(() => {
      result.current('blackLevel');
    });
    expect(spySetBlackLevelAuto).toHaveBeenCalledWith(true);

    act(() => {
      result.current('highlights');
    });
    expect(spySetHighlightsAuto).toHaveBeenCalledWith(true);
  });

  it('resets body capture setting with maxFps constraints', () => {
    act(() => {
      useBodyStore.setState({
        capabilities: {
          ...useBodyStore.getState().capabilities,
          maxFps: 60,
        },
      });
    });
    const { result, rerender } = renderHook(() => useResetTool());

    act(() => {
      result.current('fps_setting');
    });
    expect(spySetFpsSetting).toHaveBeenCalledWith(60);

    act(() => {
      useBodyStore.setState({
        capabilities: {
          ...useBodyStore.getState().capabilities,
          maxFps: 30,
        },
      });
    });
    rerender(undefined);

    act(() => {
      result.current('fps_setting');
    });
    expect(spySetFpsSetting).toHaveBeenCalledWith(30);
  });

  it('delegates film effects reset to resetEffect', () => {
    const { result } = renderHook(() => useResetTool());

    act(() => {
      result.current('grain');
    });
    expect(spyResetEffect).toHaveBeenCalledWith('grain');

    act(() => {
      result.current('scanlines');
    });
    expect(spyResetEffect).toHaveBeenCalledWith('scanlines');
  });
});
