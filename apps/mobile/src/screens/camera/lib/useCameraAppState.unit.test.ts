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
  let originalUseSharedValue: any;

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
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

  it('persists viewfinderTranslateY value', () => {
    const { result } = renderHook(() => useCameraAppState());

    act(() => {
      result.current.viewfinderTranslateY.value = -150;
    });

    expect(result.current.cameraKey).toBe(0);
    expect(result.current.viewfinderTranslateY.value).toBe(-150);
  });
});
