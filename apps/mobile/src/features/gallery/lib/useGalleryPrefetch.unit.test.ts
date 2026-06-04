import { renderHook, act } from '@testing-library/react-native';
import { useGalleryPrefetch } from './useGalleryPrefetch';
import * as MediaLibrary from 'expo-media-library/legacy';

const mockVerifyPhotosBatch = jest.fn();
jest.mock('./useImageVerification', () => ({
  useImageVerification: () => ({
    verifyPhotosBatch: mockVerifyPhotosBatch,
  }),
}));

describe('useGalleryPrefetch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('schedules prefetch, queries MediaLibrary, and dispatches batch verification', async () => {
    renderHook(() => useGalleryPrefetch());

    // Advance fake timers by 3000ms to trigger the timeout inside runAfterInteractions
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(MediaLibrary.getPermissionsAsync).toHaveBeenCalled();

    // Resolve internal async blocks
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockVerifyPhotosBatch).toHaveBeenCalledWith([
      'file:///test/1.jpg',
      'file:///test/2.jpg',
    ]);
  });
});
