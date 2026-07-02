import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { useCameraUIAnimations } from './useCameraUIAnimations';
import { useControlPanelStore } from '@entities/system';
import { useGalleryStore } from '@entities/gallery';
import * as reanimatedModule from 'react-native-reanimated';

// Mock the system store
jest.mock('@entities/system', () => {
  const mockControlPanelStore = Object.assign(
    jest.fn((selector) => selector({ activeSection: 'none' })),
    {
      getState: jest.fn(() => ({
        activeSection: 'none',
      })),
    }
  );
  return {
    useSystemStore: {
      getState: jest.fn(() => ({})),
    },
    useControlPanelStore: mockControlPanelStore,
  };
});

// Mock the gallery store
jest.mock('@entities/gallery', () => {
  return {
    useGalleryStore: {
      getState: jest.fn(() => ({
        isOpen: false,
      })),
    },
  };
});

describe('useCameraUIAnimations', () => {
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
  });

  it('initializes shared values to 0 when activeSection is none', () => {
    (useControlPanelStore.getState as jest.Mock).mockReturnValue({
      activeSection: 'none',
    });
    // @ts-expect-error - mock function override
    useControlPanelStore.mockImplementation((selector) => selector({ activeSection: 'none' }));

    const mockGalleryTransition = { value: 0 } as any;
    const { result } = renderHook(() => useCameraUIAnimations(mockGalleryTransition, 'test-key'));
    
    expect(result.current.drawerAnimation.value).toBe(0);
    expect(result.current.footerTranslateY.value).toBe(0);
    expect(result.current.viewfinderTranslateY.value).toBe(0);
    expect(result.current.layoutSyncOffset.value).toBe(0);
  });

  it('initializes drawerAnimation and footerTranslateY correctly when activeSection is not none', () => {
    (useControlPanelStore.getState as jest.Mock).mockReturnValue({
      activeSection: 'filters',
    });
    // @ts-expect-error - mock function override
    useControlPanelStore.mockImplementation((selector) => selector({ activeSection: 'filters' }));

    const mockGalleryTransition = { value: 0 } as any;
    const { result } = renderHook(() => useCameraUIAnimations(mockGalleryTransition, 'test-key'));
    
    expect(result.current.drawerAnimation.value).toBe(-250);
    expect(result.current.footerTranslateY.value).toBe(-50);
    expect(result.current.viewfinderTranslateY.value).toBe(0);
    expect(result.current.layoutSyncOffset.value).toBe(0);
  });

  it('triggers the safety net to animate values to 0 when activeSection becomes none', () => {
    const mockControlPanelStore = require('@entities/system').useControlPanelStore;
    
    // Start with activeSection !== 'none'
    (useControlPanelStore.getState as jest.Mock).mockReturnValue({
      activeSection: 'lens',
    });
    // @ts-expect-error - mock function override
    useControlPanelStore.mockImplementation((selector) => selector({ activeSection: 'lens' }));

    const mockGalleryTransition = { value: 0 } as any;
    const { result, rerender } = renderHook(
      ({ key }: { key: string }) => useCameraUIAnimations(mockGalleryTransition, key),
      { initialProps: { key: 'test-key' } }
    );

    // Set non-zero values on hook shared values
    result.current.drawerAnimation.value = -250;
    result.current.footerTranslateY.value = -50;
    result.current.viewfinderTranslateY.value = -100;

    // Change activeSection to 'none'
    (useControlPanelStore.getState as jest.Mock).mockReturnValue({
      activeSection: 'none',
    });
    // @ts-expect-error - mock function override
    useControlPanelStore.mockImplementation((selector) => selector({ activeSection: 'none' }));

    rerender({ key: 'test-key' });

    // The effect should trigger withTiming(0) on drawerAnimation, etc.
    const reanimated = require('react-native-reanimated');
    expect(reanimated.withTiming).toHaveBeenCalledWith(0, { duration: 300 });
    expect(result.current.drawerAnimation.value).toBe(0);
    expect(result.current.footerTranslateY.value).toBe(0);
  });

  it('resets animation values when cameraKey changes if activeSection is none', () => {
    (useControlPanelStore.getState as jest.Mock).mockReturnValue({
      activeSection: 'none',
    });
    // @ts-expect-error - mock function override
    useControlPanelStore.mockImplementation((selector) => selector({ activeSection: 'none' }));

    const mockGalleryTransition = { value: 0 } as any;
    const { result, rerender } = renderHook(
      ({ key }: { key: string }) => useCameraUIAnimations(mockGalleryTransition, key),
      { initialProps: { key: 'test-key-1' } }
    );

    result.current.drawerAnimation.value = -250;
    result.current.footerTranslateY.value = -50;
    result.current.viewfinderTranslateY.value = -100;

    // Rerender with a new key to simulate foreground resume
    rerender({ key: 'test-key-2' });

    expect(result.current.drawerAnimation.value).toBe(0);
    expect(result.current.footerTranslateY.value).toBe(0);
    expect(result.current.viewfinderTranslateY.value).toBe(0);
  });

  it('toggles layoutSyncOffset wiggle based on drawer and gallery state', () => {
    (useControlPanelStore.getState as jest.Mock).mockReturnValue({
      activeSection: 'none',
    });
    // @ts-expect-error - mock function override
    useControlPanelStore.mockImplementation((selector) => selector({ activeSection: 'none' }));

    const mockGalleryTransition = { value: 0 } as any;
    const { result, rerender } = renderHook(
      ({ key }: { key: string }) => useCameraUIAnimations(mockGalleryTransition, key),
      { initialProps: { key: 'test-key' } }
    );

    // Initial state: drawer = 0, gallery = 0 => layoutSyncOffset = 0
    expect(result.current.layoutSyncOffset.value).toBe(0);

    // Open drawer
    result.current.drawerAnimation.value = -250;
    rerender({ key: 'test-key' });

    // Should call withRepeat / withSequence to animate layoutSyncOffset
    const reanimated = require('react-native-reanimated');
    expect(reanimated.withRepeat).toHaveBeenCalled();
  });
});
