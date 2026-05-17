import { renderHook } from '@testing-library/react-native';
import { useCameraEvents } from './useCameraEvents';
import { useHardwareStore } from '../model/useHardwareStore';
import { useStylesStore } from '../model/useStylesStore';

describe('useCameraEvents', () => {
  it('handles debug update events', () => {
    const hwStore = useHardwareStore.getState();
    const styleStore = useStylesStore.getState();

    const { result } = renderHook(() => useCameraEvents(hwStore, styleStore));

    result.current.debugHandler({
      nativeEvent: {
        fps: 60,
        hwFps: 15,
        resolution: '1080p',
      },
    });

    expect(hwStore.fps.value).toBe(60);
    expect(hwStore.hwFps.value).toBe(15);
    expect(hwStore.resolution.value).toBe('1080p');
  });

  it('updates store values on exposure update when in auto mode', () => {
    const hwStore = useHardwareStore.getState();
    const styleStore = useStylesStore.getState();
    hwStore.isoAuto.value = true;

    const { result } = renderHook(() => useCameraEvents(hwStore, styleStore));

    result.current.exposureHandler({
      nativeEvent: {
        iso: 800,
        shutterSpeed: 100,
      },
    });

    expect(hwStore.iso.value).toBe(800);
  });

  it('updates capabilities', () => {
    const hwStore = useHardwareStore.getState();
    const styleStore = useStylesStore.getState();

    const { result } = renderHook(() => useCameraEvents(hwStore, styleStore));

    result.current.capabilitiesHandler({
      nativeEvent: {
        availableCameras: ['back', 'front'],
      },
    });

    expect(useHardwareStore.getState().capabilities.availableCameras).toEqual(['back', 'front']);
  });
});
