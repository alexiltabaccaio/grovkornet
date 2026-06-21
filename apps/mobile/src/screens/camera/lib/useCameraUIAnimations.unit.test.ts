import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { useCameraUIAnimations } from './useCameraUIAnimations';
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

describe('useCameraUIAnimations', () => {
  let originalUseSharedValue: any;

  beforeAll(() => {
    originalUseSharedValue = reanimatedModule.useSharedValue;
    const useMockSharedValue = (initialVal: any) => {
      // Preserve reference across re-renders
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
  });

  it('initializes shared values to 0 when activeSection is none', () => {
    (useControlPanelStore.getState as jest.Mock).mockReturnValue({
      activeSection: 'none',
    });

    const { result } = renderHook(() => useCameraUIAnimations());
    
    expect(result.current.drawerAnimation.value).toBe(0);
    expect(result.current.footerTranslateY.value).toBe(0);
    expect(result.current.viewfinderTranslateY.value).toBe(0);
  });

  it('initializes drawerAnimation and footerTranslateY correctly when activeSection is not none', () => {
    (useControlPanelStore.getState as jest.Mock).mockReturnValue({
      activeSection: 'filters',
    });

    const { result } = renderHook(() => useCameraUIAnimations());
    
    expect(result.current.drawerAnimation.value).toBe(-250);
    expect(result.current.footerTranslateY.value).toBe(-50);
    expect(result.current.viewfinderTranslateY.value).toBe(0);
  });
});
