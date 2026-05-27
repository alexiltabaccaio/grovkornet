import { renderHook } from '@testing-library/react-native';
import { useCameraEvents } from './useCameraEvents';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { useFilmStore } from '@entities/film';

describe('useCameraEvents', () => {
  beforeEach(() => {
    // Reset stores
    const lensStore = useLensStore.getState();
    lensStore.focusAuto.value = true;
    lensStore.focusDistance.value = 0.5;

    const filmStore = useFilmStore.getState();
    filmStore.noiseReductionAuto.value = true;
    filmStore.noiseReductionMode.value = 1;
  });

  it('handles debug update events', () => {
    const bodyStore = useBodyStore.getState();

    const { result } = renderHook(() => useCameraEvents());

    // Test with event containing nativeEvent
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

    // Test with event being the payload itself
    result.current.debugHandler({
      fps: 50,
      hwFps: 20,
      resolution: '720p',
    } as any);

    expect(bodyStore.fps.value).toBe(50);
    expect(bodyStore.hwFps.value).toBe(20);
    expect(bodyStore.resolution.value).toBe('720p');
  });

  it('updates store values on exposure update when in auto mode', () => {
    const bodyStore = useBodyStore.getState();
    const lensStore = useLensStore.getState();
    const filmStore = useFilmStore.getState();

    bodyStore.isoAuto.value = true;
    bodyStore.shutterSpeedAuto.value = true;
    lensStore.focusAuto.value = true;
    filmStore.noiseReductionAuto.value = true;

    const { result } = renderHook(() => useCameraEvents());

    result.current.exposureHandler({
      nativeEvent: {
        iso: 800,
        shutterSpeed: 100,
        focusDistance: 0.8,
        noiseReduction: 2,
      },
    });

    expect(bodyStore.iso.value).toBe(800);
    expect(bodyStore.shutterSpeed.value).toBe(100);
    expect(lensStore.focusDistance.value).toBe(0.8);
    expect(filmStore.noiseReductionMode.value).toBe(2);
  });

  it('does not update values on exposure update when not in auto mode', () => {
    const bodyStore = useBodyStore.getState();
    const lensStore = useLensStore.getState();
    const filmStore = useFilmStore.getState();

    bodyStore.isoAuto.value = false;
    bodyStore.shutterSpeedAuto.value = false;
    lensStore.focusAuto.value = false;
    filmStore.noiseReductionAuto.value = false;

    bodyStore.iso.value = 200;
    bodyStore.shutterSpeed.value = 50;
    lensStore.focusDistance.value = 0.3;
    filmStore.noiseReductionMode.value = 0;

    const { result } = renderHook(() => useCameraEvents());

    result.current.exposureHandler({
      nativeEvent: {
        iso: 800,
        shutterSpeed: 100,
        focusDistance: 0.8,
        noiseReduction: 2,
      },
    });

    expect(bodyStore.iso.value).toBe(200);
    expect(bodyStore.shutterSpeed.value).toBe(50);
    expect(lensStore.focusDistance.value).toBe(0.3);
    expect(filmStore.noiseReductionMode.value).toBe(0);
  });

  it('updates capabilities including filmStore capabilities', () => {
    const filmStore = useFilmStore.getState();
    const mockSetCapabilities = jest.fn();
    filmStore.setCapabilities = mockSetCapabilities;

    const { result } = renderHook(() => useCameraEvents());

    // Test with event payload directly (no nativeEvent wrapper)
    result.current.capabilitiesHandler({
      availableCameras: [{ id: 'back', focalLength: 24, focalLength35mm: 24 }],
    });

    expect(useLensStore.getState().capabilities.availableCameras).toEqual([{ id: 'back', focalLength: 24, focalLength35mm: 24 }]);
    expect(mockSetCapabilities).toHaveBeenCalled();

    // Test null/undefined check
    expect(() => {
      result.current.capabilitiesHandler(null);
    }).not.toThrow();
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

    // Test without nativeEvent wrapper
    result.current.torchStateHandler({
      enabled: false,
    } as any);

    expect(bodyStore.torchState.value).toBe(0);

    // Test null check
    expect(() => {
      result.current.torchStateHandler(null);
    }).not.toThrow();
  });
});
