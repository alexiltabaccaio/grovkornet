import { renderHook, waitFor } from '@testing-library/react-native';
import { useGalleryPhotos } from './useGalleryPhotos';
import * as MediaLibrary from 'expo-media-library';

describe('useGalleryPhotos', () => {
  beforeEach(() => {
    jest.spyOn(global, 'setTimeout').mockImplementation(() => {
      return 1 as any;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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
    (MediaLibrary.requestPermissionsAsync as jest.Mock)
      .mockImplementationOnce(() => Promise.resolve({ status: 'denied', granted: false } as any));
    (MediaLibrary.getPermissionsAsync as jest.Mock)
      .mockImplementationOnce(() => Promise.resolve({ status: 'denied', granted: false, canAskAgain: true } as any));

    const initialUri = 'file:///test/new-capture.jpg';
    const { result } = renderHook(() => useGalleryPhotos(initialUri));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.permissionGranted).toBe(false);
    expect(result.current.photos).toHaveLength(1);
    expect(result.current.photos[0].uri).toBe(initialUri);
  });

  it('handles permission retrieval crash gracefully', async () => {
    (MediaLibrary.getPermissionsAsync as jest.Mock)
      .mockRejectedValueOnce(new Error('Perm crash'));

    const { result } = renderHook(() => useGalleryPhotos('file:///test/new.jpg'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.permissionGranted).toBe(false);
    expect(result.current.photos[0].uri).toBe('file:///test/new.jpg');
  });

  it('uses global fallback if Grovkornet album is not found', async () => {
    (MediaLibrary.getAlbumsAsync as jest.Mock).mockResolvedValueOnce([]);
    (MediaLibrary.getAssetsAsync as jest.Mock).mockResolvedValueOnce({
      assets: [
        { id: '3', uri: 'file:///test/Grovkornet_1.jpg', filename: 'Grovkornet_1.jpg' } as any,
        { id: '4', uri: 'file:///test/other.jpg', filename: 'other.jpg' } as any,
      ],
    } as any);

    const { result } = renderHook(() => useGalleryPhotos(null));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.permissionGranted).toBe(true);
    expect(result.current.photos).toHaveLength(1);
    expect(result.current.photos[0].id).toBe('3');
  });

  it('handles error in global fallback gracefully', async () => {
    (MediaLibrary.getAlbumsAsync as jest.Mock).mockResolvedValueOnce([]);
    (MediaLibrary.getAssetsAsync as jest.Mock).mockRejectedValueOnce(new Error('Fallback get assets error'));

    const { result } = renderHook(() => useGalleryPhotos(null));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.permissionGranted).toBe(true);
    expect(result.current.photos).toHaveLength(0);
  });

  it('handles general loading error and falls back gracefully', async () => {
    (MediaLibrary.getAlbumsAsync as jest.Mock).mockRejectedValueOnce(new Error('General crash'));

    const { result } = renderHook(() => useGalleryPhotos('file:///test/initial.jpg'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.permissionGranted).toBe(false);
    expect(result.current.photos).toHaveLength(1);
    expect(result.current.photos[0].uri).toBe('file:///test/initial.jpg');
  });
});
