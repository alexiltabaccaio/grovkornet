import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useGalleryOverlay } from './useGalleryOverlay';
import * as reanimatedModule from 'react-native-reanimated';

// Mock system store
let mockLatestCapturedUri: string | null = null;
let mockLatestPreviewUri: string | null = null;

jest.mock('@entities/system', () => {
  const mockSystemStore = (fn: any) => {
    return fn({
      latestCapturedUri: mockLatestCapturedUri,
      latestPreviewUri: mockLatestPreviewUri,
    });
  };
  return {
    useSystemStore: mockSystemStore,
  };
});

describe('useGalleryOverlay', () => {
  let originalTiming: any;
  let originalUseSharedValue: any;
  let originalRunOnJS: any;

  beforeAll(() => {
    originalTiming = reanimatedModule.withTiming;
    originalUseSharedValue = reanimatedModule.useSharedValue;
    originalRunOnJS = reanimatedModule.runOnJS;

    // Mock withTiming to invoke callback and return target value
    (reanimatedModule as any).withTiming = (target: any, config: any, callback: any) => {
      if (typeof callback === 'function') {
        callback(true);
      }
      return target;
    };

    (reanimatedModule as any).runOnJS = (f: any) => f;

    const useMockSharedValue = (initialVal: any) => {
      // Preserve reference across re-renders
      return React.useRef({ value: initialVal }).current;
    };
    (reanimatedModule as any).useSharedValue = useMockSharedValue;
  });

  afterAll(() => {
    (reanimatedModule as any).withTiming = originalTiming;
    (reanimatedModule as any).useSharedValue = originalUseSharedValue;
    (reanimatedModule as any).runOnJS = originalRunOnJS;
  });

  beforeEach(() => {
    mockLatestCapturedUri = null;
    mockLatestPreviewUri = null;
    jest.clearAllMocks();
    jest.spyOn(global, 'requestAnimationFrame').mockImplementation((cb: any) => {
      cb();
      return 1;
    });
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useGalleryOverlay());

    expect(result.current.shouldRenderGallery).toBe(false);
    expect(result.current.galleryTransition.value).toBe(0);
  });

  it('opens and closes the gallery correctly', () => {
    const { result } = renderHook(() => useGalleryOverlay());

    act(() => {
      result.current.openGallery();
    });

    expect(result.current.shouldRenderGallery).toBe(true);
    expect(result.current.galleryTransition.value).toBe(1);

    act(() => {
      result.current.closeGallery();
    });

    expect(result.current.shouldRenderGallery).toBe(false);
    expect(result.current.galleryTransition.value).toBe(0);
  });

  it('performs Reanimated proxy jiggle when URIs change and gallery is open', () => {
    const { result, rerender } = renderHook(() => useGalleryOverlay());

    // Open first
    act(() => {
      result.current.openGallery();
    });
    expect(result.current.galleryTransition.value).toBe(1);

    // Simulate URI change
    mockLatestCapturedUri = 'file:///new-photo.jpg';
    act(() => {
      rerender({});
    });

    // Check if transition went 0.99 -> 1
    expect(result.current.galleryTransition.value).toBe(1);
  });

  it('does not perform jiggle if URIs change but gallery is closed', () => {
    const { result, rerender } = renderHook(() => useGalleryOverlay());

    expect(result.current.galleryTransition.value).toBe(0);

    mockLatestCapturedUri = 'file:///new-photo.jpg';
    act(() => {
      rerender({});
    });

    // Value should still be 0
    expect(result.current.galleryTransition.value).toBe(0);
  });
});
