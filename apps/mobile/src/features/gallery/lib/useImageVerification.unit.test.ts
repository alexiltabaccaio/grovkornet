import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useImageVerification } from './useImageVerification';
import { verifyGrovkornetAuthenticity } from '@grovkornet/engine';
import { GalleryItem } from './types';

jest.mock('@grovkornet/engine', () => ({
  verifyGrovkornetAuthenticity: jest.fn(),
}));

describe('useImageVerification', () => {
  let mockSetPhotos: jest.Mock;

  beforeEach(() => {
    mockSetPhotos = jest.fn();
    jest.clearAllMocks();
  });

  it('verifies photo authenticity successfully', async () => {
    (verifyGrovkornetAuthenticity as jest.Mock).mockResolvedValueOnce(true);

    const { result } = renderHook(() => useImageVerification([], mockSetPhotos));

    const item: GalleryItem = { id: '1', uri: 'file:///test/1.jpg' };

    act(() => {
      void result.current.verifyPhoto(item);
    });

    expect(result.current.verifying).toBe(true);

    await waitFor(() => expect(result.current.verifying).toBe(false));

    expect(result.current.selectedPhoto?.isVerified).toBe(true);
    expect(mockSetPhotos).toHaveBeenCalled();
  });

  it('handles verification failure gracefully', async () => {
    (verifyGrovkornetAuthenticity as jest.Mock).mockRejectedValueOnce(new Error('Verification failed'));

    const { result } = renderHook(() => useImageVerification([], mockSetPhotos));

    const item: GalleryItem = { id: '2', uri: 'file:///test/2.jpg' };

    act(() => {
      void result.current.verifyPhoto(item);
    });

    await waitFor(() => expect(result.current.verifying).toBe(false));

    expect(result.current.selectedPhoto?.isVerified).toBe(false);
  });
});
