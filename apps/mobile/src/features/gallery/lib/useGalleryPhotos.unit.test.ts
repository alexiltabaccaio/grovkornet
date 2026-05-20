import { renderHook, waitFor } from '@testing-library/react-native';
import { useGalleryPhotos } from './useGalleryPhotos';
import * as MediaLibrary from 'expo-media-library';

describe('useGalleryPhotos', () => {
  it('loads photos from the Grovkornet album successfully when permission is granted', async () => {
    const { result } = renderHook(() => useGalleryPhotos(null));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.permissionGranted).toBe(true);
    expect(result.current.photos).toHaveLength(2);
    expect(result.current.photos[0].uri).toBe('file:///test/1.jpg');
  });

  it('prepends initialUri if not already in the loaded photo list', async () => {
    const initialUri = 'file:///test/new-capture.jpg';
    const { result } = renderHook(() => useGalleryPhotos(initialUri));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.photos).toHaveLength(3);
    expect(result.current.photos[0].uri).toBe(initialUri);
  });

  it('handles permission denial gracefully by falling back to initialUri only', async () => {
    const mockRequestPermissions = jest.spyOn(MediaLibrary, 'requestPermissionsAsync')
      .mockImplementationOnce(() => Promise.resolve({ status: 'denied', granted: false } as any));
    const mockGetPermissions = jest.spyOn(MediaLibrary, 'getPermissionsAsync')
      .mockImplementationOnce(() => Promise.resolve({ status: 'denied', granted: false, canAskAgain: true } as any));

    const initialUri = 'file:///test/new-capture.jpg';
    const { result } = renderHook(() => useGalleryPhotos(initialUri));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.permissionGranted).toBe(false);
    expect(result.current.photos).toHaveLength(1);
    expect(result.current.photos[0].uri).toBe(initialUri);

    mockRequestPermissions.mockRestore();
    mockGetPermissions.mockRestore();
  });
});
