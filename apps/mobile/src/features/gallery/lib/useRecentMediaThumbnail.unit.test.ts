import { useGalleryStore } from '@entities/gallery';
import { renderHook, act } from '@testing-library/react-native';
import { useRecentMediaThumbnail } from './useRecentMediaThumbnail';
import * as MediaLibrary from 'expo-media-library/legacy';
import { useSystemStore } from '@entities/system';

describe('useRecentMediaThumbnail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useGalleryStore.setState({
      latestCapturedUri: null,
    });
  });

  it('checks permissions and loads initial media thumbnail', async () => {
    renderHook(() => useRecentMediaThumbnail());

    // Resolve asynchronous calls to MediaLibrary inside hook
    await act(async () => {
      await Promise.resolve();
    });

    expect(MediaLibrary.getPermissionsAsync).toHaveBeenCalled();
    expect(MediaLibrary.getAlbumsAsync).toHaveBeenCalled();
    expect(MediaLibrary.getAssetsAsync).toHaveBeenCalled();
    
    // Check that state was updated with first asset from mock registry
    expect(useGalleryStore.getState().latestCapturedUri).toBe('file:///test/1.jpg');
  });
});
