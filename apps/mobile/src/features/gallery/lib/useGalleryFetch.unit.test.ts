import { renderHook } from '@testing-library/react-native';
import { useGalleryFetch } from './useGalleryFetch';
import * as MediaLibrary from 'expo-media-library/legacy';

describe('useGalleryFetch', () => {
  beforeEach(() => {
    jest.spyOn(global, 'setTimeout').mockImplementation(() => {
      return 1 as any;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('dovrebbe recuperare foto dal primo album Grovkornet trovato e ordinarle per data decrescente', async () => {
    (MediaLibrary.getAlbumsAsync as jest.Mock).mockResolvedValue([{ id: 'album1', title: 'Grovkornet' }]);
    (MediaLibrary.getAssetsAsync as jest.Mock).mockResolvedValue({
      assets: [
        { id: '1', uri: 'file:///test/1.jpg', filename: '1.jpg', creationTime: 100 },
        { id: '2', uri: 'file:///test/2.jpg', filename: '2.jpg', creationTime: 200 }
      ]
    });

    const { result } = renderHook(() => useGalleryFetch());
    const activeRef = { current: true };
    const photos = await result.current.fetchPhotos(activeRef);

    expect(photos).toHaveLength(2);
    expect(photos[0].id).toBe('2'); // creationTime 200 > 100, quindi deve essere prima
    expect(photos[1].id).toBe('1');
  });

  it('dovrebbe usare il fallback globale se non esiste l album Grovkornet', async () => {
    (MediaLibrary.getAlbumsAsync as jest.Mock).mockResolvedValue([]);
    (MediaLibrary.getAssetsAsync as jest.Mock).mockResolvedValue({
      assets: [
        { id: '3', uri: 'file:///test/Grovkornet_1.jpg', filename: 'Grovkornet_1.jpg', creationTime: 300 },
        { id: '4', uri: 'file:///test/other.jpg', filename: 'other.jpg', creationTime: 400 }
      ]
    });

    const { result } = renderHook(() => useGalleryFetch());
    const activeRef = { current: true };
    const photos = await result.current.fetchPhotos(activeRef);

    expect(photos).toHaveLength(1);
    expect(photos[0].id).toBe('3');
  });
});
