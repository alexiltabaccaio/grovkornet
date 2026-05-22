import { renderHook } from '@testing-library/react-native';
import { useCameraEvents } from './useCameraEvents';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';

describe('useCameraEvents', () => {
  it('handles debug update events', () => {
    const bodyStore = useBodyStore.getState();

    const { result } = renderHook(() => useCameraEvents());

    result.current.debugHandler({
      nativeEvent: {
        fps: 60,
        hwFps: 15,
        resolution: '1080p',
      },
    });

    expect(bodyStore.fps.value).toBe(60);
    expect(bodyStore.hwFps.value).toBe(15);
    expect(bodyStore.resolution.value).toBe('1080p');
  });

  it('updates store values on exposure update when in auto mode', () => {
    const bodyStore = useBodyStore.getState();
    bodyStore.isoAuto.value = true;

    const { result } = renderHook(() => useCameraEvents());

    result.current.exposureHandler({
      nativeEvent: {
        iso: 800,
        shutterSpeed: 100,
      },
    });

    expect(bodyStore.iso.value).toBe(800);
  });

  it('updates capabilities', () => {
    const { result } = renderHook(() => useCameraEvents());

    result.current.capabilitiesHandler({
      nativeEvent: {
        availableCameras: [{ id: 'back', focalLength: 24, focalLength35mm: 24 }],
      },
    });

    expect(useLensStore.getState().capabilities.availableCameras).toEqual([{ id: 'back', focalLength: 24, focalLength35mm: 24 }]);
  });

  it('updates torch state on torch state change event', () => {
    const bodyStore = useBodyStore.getState();
    bodyStore.torchState.value = 0;

    const { result } = renderHook(() => useCameraEvents());

    result.current.torchStateHandler({
      nativeEvent: {
        enabled: true,
      },
    });

    expect(bodyStore.torchState.value).toBe(1);

    result.current.torchStateHandler({
      nativeEvent: {
        enabled: false,
      },
    });

    expect(bodyStore.torchState.value).toBe(0);
  });
});
