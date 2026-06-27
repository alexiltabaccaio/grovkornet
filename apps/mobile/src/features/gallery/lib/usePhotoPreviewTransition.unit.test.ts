import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { usePhotoPreviewTransition } from './usePhotoPreviewTransition';
import { GalleryItem } from './types';
import * as reanimatedModule from 'react-native-reanimated';

jest.mock('@shared/lib/haptics', () => ({
  selectionAsync: jest.fn(),
}));

const mockPhotos: GalleryItem[] = [
  { uri: 'file:///test/1.jpg', id: '1' },
  { uri: 'file:///test/2.jpg', id: '2' },
  { uri: 'file:///test/3.jpg', id: '3' },
];

describe('usePhotoPreviewTransition', () => {
  let originalTiming: any;
  let originalUseSharedValue: any;

  beforeAll(() => {
    originalTiming = reanimatedModule.withTiming;
    originalUseSharedValue = reanimatedModule.useSharedValue;

    (reanimatedModule as any).withTiming = (value: any, config: any, callback: any) => {
      if (typeof callback === 'function') {
        callback(true);
      }
      return value;
    };

    const useMockSharedValue = (initialVal: any) => {
      // Use useRef to preserve the shared value object across re-renders
       
      return React.useRef({ value: initialVal }).current;
    };

    (reanimatedModule as any).useSharedValue = useMockSharedValue;
  });

  afterAll(() => {
    (reanimatedModule as any).withTiming = originalTiming;
    (reanimatedModule as any).useSharedValue = originalUseSharedValue;
  });

  it('initializes with correct index and offsets', () => {
    const { result } = renderHook(() =>
      usePhotoPreviewTransition({
        selectedPhoto: mockPhotos[1],
        photos: mockPhotos,
        onPhotoVisible: jest.fn(),
        slotWidth: 400,
      })
    );

    expect(result.current.currentIndex.value).toBe(1);
    expect(result.current.renderIndices).toEqual([0, 1, 2]);
    expect(result.current.translateX.value).toBe(-400);
  });

  it('handles programmatic jump to adjacent photo', () => {
    const onPhotoVisibleMock = jest.fn();
    const { result, rerender } = renderHook(
      (props: { selectedPhoto: GalleryItem | null }) =>
        usePhotoPreviewTransition({
          selectedPhoto: props.selectedPhoto,
          photos: mockPhotos,
          onPhotoVisible: onPhotoVisibleMock,
          slotWidth: 400,
        }),
      {
        initialProps: { selectedPhoto: mockPhotos[0] },
      }
    );

    expect(result.current.currentIndex.value).toBe(0);

    act(() => {
      rerender({ selectedPhoto: mockPhotos[1] });
    });

    // adjacent jump updates translateX directly
    expect(result.current.translateX.value).toBe(-400);
    // index is updated after transition completes
    expect(result.current.currentIndex.value).toBe(1);
  });

  it('handles programmatic jump to distant photo (teleport)', () => {
    jest.useFakeTimers();
    const { result, rerender } = renderHook(
      (props: { selectedPhoto: GalleryItem | null }) =>
        usePhotoPreviewTransition({
          selectedPhoto: props.selectedPhoto,
          photos: mockPhotos,
          onPhotoVisible: jest.fn(),
          slotWidth: 400,
        }),
      {
        initialProps: { selectedPhoto: mockPhotos[0] },
      }
    );

    act(() => {
      rerender({ selectedPhoto: mockPhotos[2] });
    });

    // Advance the timers used to delay the teleport animation
    act(() => {
      jest.runAllTimers();
    });
    jest.useRealTimers();

    // Since the mocked withTiming animation completes synchronously in this test environment,
    // the teleport has already completed and isTeleporting is cleared.
    expect(result.current.isTeleporting.value).toBe(false);
    expect(result.current.currentIndex.value).toBe(2);
  });

  it('preserves zoom state when photos list updates but index is unchanged', () => {
    const resetZoomSignalMock = { value: 0 };
    const { result, rerender } = renderHook(
      (props: { selectedPhoto: GalleryItem | null; photos: GalleryItem[] }) =>
        usePhotoPreviewTransition({
          selectedPhoto: props.selectedPhoto,
          photos: props.photos,
          onPhotoVisible: jest.fn(),
          slotWidth: 400,
          resetZoomSignal: resetZoomSignalMock as any,
        }),
      {
        initialProps: {
          selectedPhoto: mockPhotos[1],
          photos: mockPhotos,
        },
      }
    );

    expect(resetZoomSignalMock.value).toBe(0);

    // Rerender with a shallow copy of photos (same item, different array ref)
    act(() => {
      rerender({
        selectedPhoto: { ...mockPhotos[1] },
        photos: [...mockPhotos],
      });
    });

    // resetZoomSignal should NOT have changed because index remained 1
    expect(resetZoomSignalMock.value).toBe(0);

    // Rerender with a different selected photo
    act(() => {
      rerender({
        selectedPhoto: mockPhotos[0],
        photos: mockPhotos,
      });
    });

    // resetZoomSignal SHOULD increment because index changed
    expect(resetZoomSignalMock.value).toBe(1);
  });

  it('locks and unlocks screen state on AppState change to active', () => {
    const { AppState } = require('react-native');
    let appStateCallback: ((state: string) => void) | null = null;
    const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener').mockImplementation(
      (event, cb: any) => {
        appStateCallback = cb;
        return { remove: jest.fn() };
      }
    );

    jest.useFakeTimers();

    const { result } = renderHook(() =>
      usePhotoPreviewTransition({
        selectedPhoto: mockPhotos[1],
        photos: mockPhotos,
        onPhotoVisible: jest.fn(),
        slotWidth: 400,
      })
    );

    // Initial state is unlocked (-1)
    expect(result.current.teleportMockIndex.value).toBe(-1);

    // Trigger AppState change to active
    act(() => {
      if (appStateCallback) {
        appStateCallback('active');
      }
    });

    // Should immediately lock screen state: mock=-2, real=1
    expect(result.current.teleportMockIndex.value).toBe(-2);
    expect(result.current.teleportRealIndex.value).toBe(1);

    // Run all timers to trigger the deferred unlock
    act(() => {
      jest.runAllTimers();
    });
    expect(result.current.teleportMockIndex.value).toBe(-1);

    addEventListenerSpy.mockRestore();
    jest.useRealTimers();
  });
});

