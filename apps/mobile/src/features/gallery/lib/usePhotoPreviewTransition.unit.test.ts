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
      // eslint-disable-next-line react-hooks/rules-of-hooks
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

    // Since the mocked withTiming animation completes synchronously in this test environment,
    // the teleport has already completed and slotOverrides is cleared.
    expect(result.current.slotOverrides).toEqual({});
    expect(result.current.currentIndex.value).toBe(2);
  });
});
