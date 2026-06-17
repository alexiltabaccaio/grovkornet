import { useGalleryStore } from '@entities/gallery';
import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useGalleryOverlay } from './useGalleryOverlay';
import * as reanimatedModule from 'react-native-reanimated';

// Mock gallery store
let mockLatestCapturedUri: string | null = null;
let mockLatestPreviewUri: string | null = null;

jest.mock('@entities/gallery', () => {
  const ReactActual = jest.requireActual('react');
  const mockGalleryStore = (fn: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [galleryOpen, setGalleryOpen] = ReactActual.useState(false);
    return fn({
      latestCapturedUri: mockLatestCapturedUri,
      latestPreviewUri: mockLatestPreviewUri,
      isOpen: galleryOpen,
      setIsOpen: setGalleryOpen,
    });
  };
  return {
    useGalleryStore: mockGalleryStore,
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
});
