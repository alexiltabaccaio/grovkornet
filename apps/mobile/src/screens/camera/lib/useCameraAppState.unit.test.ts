import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useCameraAppState } from './useCameraAppState';
import { useControlPanelStore } from '@entities/system';

import * as reanimatedModule from 'react-native-reanimated';

// Mock the system store
jest.mock('@entities/system', () => {
  const mockControlPanelStore = {
    getState: jest.fn(() => ({
      activeSection: 'none',
    })),
  };
  return {
    useSystemStore: {
      getState: jest.fn(() => ({})),
    },
    useControlPanelStore: mockControlPanelStore,
  };
});

describe('useCameraAppState', () => {
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

    (useControlPanelStore.getState as jest.Mock).mockReturnValue({
      activeSection: 'none',
    });

    appStateCallback = null;

    addEventListenerSpy = jest.spyOn(AppState, 'addEventListener').mockImplementation(
      (event, cb: any) => {
        appStateCallback = cb;
        return { remove: mockRemoveSubscription };
      }
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sets up the AppState listener and tears it down on unmount', () => {
    const { unmount } = renderHook(() => useCameraAppState());

    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();
    expect(mockRemoveSubscription).toHaveBeenCalled();
  });

  it('increments cameraKey when app becomes active', () => {
    const { result } = renderHook(() => useCameraAppState());

    expect(result.current.cameraKey).toBe(0);

    // Simulate app going active
    act(() => {
      if (appStateCallback) {
        appStateCallback('active');
      }
    });

    // cameraKey should increment immediately
    expect(result.current.cameraKey).toBe(1);
  });

  it('does not increment cameraKey for non-active AppState transitions', () => {
    const { result } = renderHook(() => useCameraAppState());

    act(() => {
      if (appStateCallback) {
        appStateCallback('background');
      }
    });

    expect(result.current.cameraKey).toBe(0);
  });
  
  it('initializes shared values correctly based on activeSection', () => {
    (useControlPanelStore.getState as jest.Mock).mockReturnValue({
      activeSection: 'filters',
    });

    const { result } = renderHook(() => useCameraAppState());
    
    expect(result.current.drawerAnimation.value).toBe(-250);
    expect(result.current.footerTranslateY.value).toBe(-50);
    expect(result.current.viewfinderTranslateY.value).toBe(0);
  });

  it('persists viewfinderTranslateY value when app state changes to active and key increments', () => {
    const { result } = renderHook(() => useCameraAppState());

    act(() => {
      result.current.viewfinderTranslateY.value = -150;
    });

    act(() => {
      if (appStateCallback) {
        appStateCallback('background');
      }
    });

    act(() => {
      if (appStateCallback) {
        appStateCallback('active');
      }
    });

    expect(result.current.cameraKey).toBe(1);
    expect(result.current.viewfinderTranslateY.value).toBe(-150);
  });
});
