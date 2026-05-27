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

  it('runs background verification loop for unverified photos and updates them', async () => {
    (verifyGrovkornetAuthenticity as jest.Mock)
      .mockResolvedValueOnce(true)   // photo 1 passes
      .mockResolvedValueOnce(false); // photo 2 fails

    const photos: GalleryItem[] = [
      { id: '1', uri: 'file:///test/1.jpg' },
      { id: '2', uri: 'file:///test/2.jpg' },
    ];

    renderHook(() => useImageVerification(photos, mockSetPhotos));

    await waitFor(() => {
      expect(verifyGrovkornetAuthenticity).toHaveBeenCalledWith('file:///test/1.jpg');
      expect(verifyGrovkornetAuthenticity).toHaveBeenCalledWith('file:///test/2.jpg');
    });

    expect(mockSetPhotos).toHaveBeenCalled();
  });

  it('handles background verification errors gracefully', async () => {
    (verifyGrovkornetAuthenticity as jest.Mock)
      .mockRejectedValueOnce(new Error('Verify error'));

    const photos: GalleryItem[] = [
      { id: '1', uri: 'file:///test/1.jpg' },
    ];

    renderHook(() => useImageVerification(photos, mockSetPhotos));

    await waitFor(() => {
      expect(verifyGrovkornetAuthenticity).toHaveBeenCalledWith('file:///test/1.jpg');
    });

    expect(mockSetPhotos).toHaveBeenCalled();
  });

  it('skips background verification if photo is already verified or currently in queue', async () => {
    const photos: GalleryItem[] = [
      { id: '1', uri: 'file:///test/1.jpg', isVerified: true },
    ];

    renderHook(() => useImageVerification(photos, mockSetPhotos));

    // Wait a tiny bit to check that it is not called
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(verifyGrovkornetAuthenticity).not.toHaveBeenCalled();
  });
});
