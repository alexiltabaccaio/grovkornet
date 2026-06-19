import { useGalleryStore } from '@entities/gallery';
import { renderHook, act } from '@testing-library/react-native';
import { useRecentMediaThumbnail } from './useRecentMediaThumbnail';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as FileSystem from 'expo-file-system';

describe('useRecentMediaThumbnail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useGalleryStore.setState({
      latestCapturedUri: null,
    });
    // Default mock behavior
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
  });

  it('checks permissions and loads initial media thumbnail', async () => {
    renderHook(() => useRecentMediaThumbnail());

    // Resolve asynchronous calls inside hook
    await act(async () => {
      await Promise.resolve();
    });

    expect(MediaLibrary.getPermissionsAsync).toHaveBeenCalled();
    expect(MediaLibrary.getAlbumsAsync).toHaveBeenCalled();
    expect(MediaLibrary.getAssetsAsync).toHaveBeenCalled();
    
    // Check that state was updated with first asset from mock registry
    expect(useGalleryStore.getState().latestCapturedUri).toBe('file:///test/1.jpg');
  });

  it('invalidates latestCapturedUri if the file does not exist on disk', async () => {
    // MediaLibrary will return file:///test/1.jpg
    // Let's mock FileSystem to say it does not exist
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

    renderHook(() => useRecentMediaThumbnail());

    await act(async () => {
      await Promise.resolve();
    });

    // Should not set the latestCapturedUri since it doesn't exist
    expect(useGalleryStore.getState().latestCapturedUri).toBeNull();
  });

  it('clears state if MediaLibrary returns nothing and currentCapturedUri does not exist', async () => {
    // Set a stale uri in the store
    useGalleryStore.setState({ latestCapturedUri: 'file:///test/stale.jpg' });

    // Mock MediaLibrary to return no assets
    (MediaLibrary.getAssetsAsync as jest.Mock).mockResolvedValue({ assets: [] });
    // Mock FileSystem to say the stale file does not exist
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

    renderHook(() => useRecentMediaThumbnail());

    await act(async () => {
      await Promise.resolve();
    });

    // Should clear the stale uri
    expect(useGalleryStore.getState().latestCapturedUri).toBeNull();
  });

  it('retains currentCapturedUri if MediaLibrary returns nothing but the file still exists on disk', async () => {
    useGalleryStore.setState({ latestCapturedUri: 'file:///test/valid_local.jpg' });

    (MediaLibrary.getAssetsAsync as jest.Mock).mockResolvedValue({ assets: [] });
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });

    renderHook(() => useRecentMediaThumbnail());

    await act(async () => {
      await Promise.resolve();
    });

    // Should retain the uri
    expect(useGalleryStore.getState().latestCapturedUri).toBe('file:///test/valid_local.jpg');
  });
});

