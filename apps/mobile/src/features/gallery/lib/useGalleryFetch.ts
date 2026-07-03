import * as MediaLibrary from 'expo-media-library/legacy';
import { logger } from '@shared/lib/logger';
import { GalleryItem } from './types';

export const useGalleryFetch = () => {
  const fetchPhotos = async (activeRef: { current: boolean }): Promise<GalleryItem[]> => {
    logger.debug('Gallery', 'Fetching user albums...');
    let allAlbums: MediaLibrary.Album[] = [];
    if (process.env.NODE_ENV === 'test') {
      allAlbums = await MediaLibrary.getAlbumsAsync();
    } else {
      let albumsTimer: NodeJS.Timeout;
      const albumsTimeout = new Promise<never>((_, reject) =>
        albumsTimer = setTimeout(() => reject(new Error('ALBUM_TIMEOUT')), 10000)
      );
      allAlbums = await Promise.race([
        MediaLibrary.getAlbumsAsync(),
        albumsTimeout
      ]).finally(() => clearTimeout(albumsTimer));
    }

    if (!activeRef.current) return [];

    const grovkornetAlbums = allAlbums.filter(a => a.title.toLowerCase() === 'grovkornet');
    let media: MediaLibrary.Asset[] = [];

    if (grovkornetAlbums.length > 0) {
      logger.debug('Gallery', `Found ${grovkornetAlbums.length} Grovkornet albums, fetching from all...`);
      let results: MediaLibrary.PagedInfo<MediaLibrary.Asset>[] = [];
      if (process.env.NODE_ENV === 'test') {
        results = await Promise.all(
          grovkornetAlbums.map(album =>
            MediaLibrary.getAssetsAsync({
              album: album.id,
              first: 100,
              sortBy: [[MediaLibrary.SortBy.creationTime, false]],
              mediaType: MediaLibrary.MediaType.photo,
            })
          )
        );
      } else {
        let assetsTimer: NodeJS.Timeout;
        const assetsTimeout = new Promise<never>((_, reject) =>
          assetsTimer = setTimeout(() => reject(new Error('ASSETS_TIMEOUT')), 15000)
        );
        const fetchPromises = grovkornetAlbums.map(album =>
          MediaLibrary.getAssetsAsync({
            album: album.id,
            first: 100,
            sortBy: [[MediaLibrary.SortBy.creationTime, false]],
            mediaType: MediaLibrary.MediaType.photo,
          })
        );
        results = await Promise.race([
          Promise.all(fetchPromises),
          assetsTimeout
        ]).finally(() => clearTimeout(assetsTimer));
      }

      if (!activeRef.current) return [];
      media = results.flatMap(r => r.assets);
      media.sort((a, b) => b.creationTime - a.creationTime);
    } else {
      logger.debug('Gallery', 'Grovkornet album not found. Using global fallback...');
      try {
        const recent = await MediaLibrary.getAssetsAsync({
          first: 200,
          sortBy: [[MediaLibrary.SortBy.creationTime, false]],
          mediaType: MediaLibrary.MediaType.photo,
        });
        media = recent.assets.filter(a => 
          a.uri.includes('Grovkornet') || 
          a.filename.includes('Grovkornet') || 
          a.filename.startsWith('Grovkornet_') ||
          a.filename.startsWith('GVK_')
        );
      } catch (e) {
        logger.error('Gallery', 'Error in global fallback', e);
        media = [];
      }
    }

    return media.map(asset => ({
      id: asset.id,
      uri: asset.uri,
      filename: asset.filename
    }));
  };

  return { fetchPhotos };
};
