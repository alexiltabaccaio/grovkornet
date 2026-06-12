import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useCameraAppState } from './useCameraAppState';
import { useSystemStore } from '@entities/system';

import * as reanimatedModule from 'react-native-reanimated';

// Mock the system store
jest.mock('@entities/system', () => {
  const mockSystemStore = {
    getState: jest.fn(() => ({
      activeSection: 'none',
    })),
  };
  return {
    useSystemStore: mockSystemStore,
  };
});

describe('useCameraAppState', () => {
  let galleryTransitionMock: { value: number };
  let appStateCallback: ((state: string) => void) | null = null;
  const mockRemoveSubscription = jest.fn();
  let originalUseSharedValue: any;
  let addEventListenerSpy: jest.SpyInstance;

  beforeAll(() => {
    originalUseSharedValue = reanimatedModule.useSharedValue;
    const useMockSharedValue = (initialVal: any) => {
      return React.useRef({ value: initialVal }).current;
    };
    const reanimated = reanimatedModule as unknown as { useSharedValue: any };
    reanimated.useSharedValue = useMockSharedValue;
  });

  afterAll(() => {
    const reanimated = reanimatedModule as unknown as { useSharedValue: any };
    reanimated.useSharedValue = originalUseSharedValue;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    (useSystemStore.getState as jest.Mock).mockReturnValue({
      activeSection: 'none',
    });

    galleryTransitionMock = { value: 0 };
    appStateCallback = null;

    addEventListenerSpy = jest.spyOn(AppState, 'addEventListener').mockImplementation(
      (event, cb: any) => {
        appStateCallback = cb;
        return { remove: mockRemoveSubscription };
      }
    );

    // Mock requestAnimationFrame to call the callback immediately
    jest.spyOn(global, 'requestAnimationFrame').mockImplementation((cb: any) => {
      cb();
      return 1;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('sets up the AppState listener and tears it down on unmount', () => {
    const { unmount } = renderHook(() =>
      useCameraAppState({
        shouldRenderGallery: false,
        galleryTransition: galleryTransitionMock as any,
      })
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();
    expect(mockRemoveSubscription).toHaveBeenCalled();
  });

  it('increments cameraKey and recovers animation state when app becomes active and activeSection is none', () => {
    const { result } = renderHook(() =>
      useCameraAppState({
        shouldRenderGallery: false,
        galleryTransition: galleryTransitionMock as any,
      })
    );

    expect(result.current.cameraKey).toBe(0);

    // Simulate app going active
    act(() => {
      if (appStateCallback) {
        appStateCallback('active');
      }
    });

    // cameraKey should increment immediately
    expect(result.current.cameraKey).toBe(1);

    // Shared values should not be updated yet (before timeout)
    expect(result.current.drawerAnimation.value).toBe(250);
    expect(result.current.footerTranslateY.value).toBe(0);

    // Run the timers to trigger the setTimeout callback (150ms)
    act(() => {
      jest.advanceTimersByTime(150);
    });

    // Active section is 'none', so it should restore to 250 and 0
    expect(result.current.drawerAnimation.value).toBe(250);
    expect(result.current.footerTranslateY.value).toBe(0);
    expect(galleryTransitionMock.value).toBe(0); // shouldn't change as shouldRenderGallery is false
  });

  it('recovers state correctly when activeSection is not none', () => {
    // Override activeSection to not be 'none'
    (useSystemStore.getState as jest.Mock).mockReturnValue({
      activeSection: 'filters',
    });

    const { result, unmount } = renderHook(() =>
      useCameraAppState({
        shouldRenderGallery: false,
        galleryTransition: galleryTransitionMock as any,
      })
    );

    act(() => {
      if (appStateCallback) {
        appStateCallback('active');
      }
    });

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(result.current.drawerAnimation.value).toBe(0);
    expect(result.current.footerTranslateY.value).toBe(-50);
    unmount();
  });

  it('restores galleryTransition when app goes active and shouldRenderGallery is true', () => {
    const { unmount } = renderHook(() =>
      useCameraAppState({
        shouldRenderGallery: true,
        galleryTransition: galleryTransitionMock as any,
      })
    );

    act(() => {
      if (appStateCallback) {
        appStateCallback('active');
      }
    });

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(galleryTransitionMock.value).toBe(1);
    unmount();
  });

  it('does not increment cameraKey or recover values for non-active AppState transitions', () => {
    const { result, unmount } = renderHook(() =>
      useCameraAppState({
        shouldRenderGallery: false,
        galleryTransition: galleryTransitionMock as any,
      })
    );

    act(() => {
      if (appStateCallback) {
        appStateCallback('background');
      }
    });

    expect(result.current.cameraKey).toBe(0);

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(result.current.drawerAnimation.value).toBe(250);
    expect(result.current.footerTranslateY.value).toBe(0);
    unmount();
  });
});
