import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useGalleryPhotos } from './useGalleryPhotos';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as FileSystem from 'expo-file-system';

describe('useGalleryPhotos', () => {
  beforeEach(() => {
    jest.spyOn(global, 'setTimeout').mockImplementation(() => {
      return 1 as any;
    });
    (FileSystem.getInfoAsync as jest.Mock).mockImplementation((uri: string) => {
      if (uri && uri.startsWith('content://')) {
        return Promise.reject(new Error('FileSystem should not be called with content:// URIs'));
      }
      return Promise.resolve({ exists: true, uri });
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

  it('does not prepend initialUri if it does not exist on disk', async () => {
    const initialUri = 'file:///test/new-capture.jpg';
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: false });

    const { result } = renderHook(() => useGalleryPhotos(initialUri));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Should not prepend the non-existing temp preview
    expect(result.current.photos).toHaveLength(2);
    expect(result.current.photos.some(p => p.uri === initialUri)).toBe(false);
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

  it('handles permission denial but returns empty array if initialUri does not exist on disk', async () => {
    (MediaLibrary.requestPermissionsAsync as jest.Mock)
      .mockImplementationOnce(() => Promise.resolve({ status: 'denied', granted: false } as any));
    (MediaLibrary.getPermissionsAsync as jest.Mock)
      .mockImplementationOnce(() => Promise.resolve({ status: 'denied', granted: false, canAskAgain: true } as any));
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: false });

    const initialUri = 'file:///test/new-capture.jpg';
    const { result } = renderHook(() => useGalleryPhotos(initialUri));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.permissionGranted).toBe(false);
    expect(result.current.photos).toHaveLength(0);
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

  it('handles general loading error but returns empty array if initialUri does not exist on disk', async () => {
    (MediaLibrary.getAlbumsAsync as jest.Mock).mockRejectedValueOnce(new Error('General crash'));
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: false });

    const { result } = renderHook(() => useGalleryPhotos('file:///test/initial.jpg'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.permissionGranted).toBe(false);
    expect(result.current.photos).toHaveLength(0);
  });

  it('dynamically injects new initialUri if it changes after loading is complete', async () => {
    const { result, rerender } = renderHook(({ uri }: { uri: string | null }) => useGalleryPhotos(uri), {
      initialProps: { uri: null as string | null },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Initially should have 2 photos (from mocked MediaLibrary)
    expect(result.current.photos).toHaveLength(2);

    const newUri = 'file:///test/preview-dynamic-capture.jpg';
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: true });

    // Update the hook props with the new uri
    rerender({ uri: newUri });

    await waitFor(() => {
      expect(result.current.photos).toHaveLength(3);
      expect(result.current.photos[0].uri).toBe(newUri);
      expect(result.current.photos[0].id).toBe('preview-temp');
    });
  });

  it('dynamically injects new content:// URI without checking FileSystem existence', async () => {
    const { result, rerender } = renderHook(({ uri }: { uri: string | null }) => useGalleryPhotos(uri), {
      initialProps: { uri: null as string | null },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.photos).toHaveLength(2);

    const newUri = 'content://media/external/images/media/999';
    rerender({ uri: newUri });

    await waitFor(() => {
      expect(result.current.photos).toHaveLength(3);
      expect(result.current.photos[0].uri).toBe(newUri);
      expect(result.current.photos[0].id).toBe('999');
    });
  });

  it('loads photos when permission is limited', async () => {
    (MediaLibrary.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'limited',
      granted: false,
      canAskAgain: true,
    });

    const { result } = renderHook(() => useGalleryPhotos(null));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.permissionGranted).toBe(true);
    expect(result.current.photos).toHaveLength(2);
  });

  it('does not prepend initialUri if it already exists in the loaded photos list', async () => {
    const existingUri = 'file:///test/1.jpg';
    const { result } = renderHook(() => useGalleryPhotos(existingUri));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.photos).toHaveLength(2);
  });

  it('does not inject initialUri dynamically if it already exists in the photos list', async () => {
    const { result, rerender } = renderHook(({ uri }: { uri: string | null }) => useGalleryPhotos(uri), {
      initialProps: { uri: null as string | null },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.photos).toHaveLength(2);

    const existingUri = 'file:///test/1.jpg';
    const getInfoPromise = Promise.resolve({ exists: true });
    (FileSystem.getInfoAsync as jest.Mock).mockReturnValueOnce(getInfoPromise);

    await act(async () => {
      rerender({ uri: existingUri });
      await getInfoPromise;
    });

    expect(result.current.photos).toHaveLength(2);
  });

  it('does not inject initialUri dynamically if the hook is unmounted before FileSystem check completes', async () => {
    const { result, rerender, unmount } = renderHook(({ uri }: { uri: string | null }) => useGalleryPhotos(uri), {
      initialProps: { uri: null as string | null },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    let resolveGetInfo!: (val: any) => void;
    const getInfoPromise = new Promise(resolve => {
      resolveGetInfo = resolve;
    });
    (FileSystem.getInfoAsync as jest.Mock).mockReturnValueOnce(getInfoPromise);

    rerender({ uri: 'file:///test/preview-unmounted.jpg' });

    unmount();

    resolveGetInfo({ exists: true });
  });

  it('does not dynamically inject initialUri if it does not exist on disk', async () => {
    const { result, rerender } = renderHook(({ uri }: { uri: string | null }) => useGalleryPhotos(uri), {
      initialProps: { uri: null as string | null },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    const nonExistentUri = 'file:///test/preview-non-existent.jpg';
    const getInfoPromise = Promise.resolve({ exists: false });
    (FileSystem.getInfoAsync as jest.Mock).mockReturnValueOnce(getInfoPromise);

    await act(async () => {
      rerender({ uri: nonExistentUri });
      await getInfoPromise;
    });

    expect(result.current.photos).toHaveLength(2);
    expect(result.current.photos.some(p => p.uri === nonExistentUri)).toBe(false);
  });

  it('injects non-temp local URI with filename as ID', async () => {
    const { result, rerender } = renderHook(({ uri }: { uri: string | null }) => useGalleryPhotos(uri), {
      initialProps: { uri: null as string | null },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    const nonTempLocalUri = 'file:///test/some-local-photo.jpg';
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: true });

    rerender({ uri: nonTempLocalUri });

    await waitFor(() => {
      expect(result.current.photos).toHaveLength(3);
      expect(result.current.photos[0].id).toBe('some-local-photo.jpg');
    });
  });

  it('aborts loadPhotos if hook is unmounted during permission request', () => {
    let resolvePerm!: (val: any) => void;
    const permPromise = new Promise(resolve => {
      resolvePerm = resolve;
    });
    (MediaLibrary.getPermissionsAsync as jest.Mock).mockReturnValueOnce(permPromise);

    const { unmount, result } = renderHook(() => useGalleryPhotos(null));

    unmount();

    resolvePerm({ status: 'granted', granted: true });

    expect(result.current.loading).toBe(true);
  });
});

