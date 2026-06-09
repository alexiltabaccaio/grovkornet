import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import * as MediaLibrary from 'expo-media-library/legacy';
import { logger } from '@shared/lib/logger';
import { GalleryItem } from './types';

export const useGalleryPhotos = (initialUri?: string | null) => {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    let active = true;
    logger.debug('useGalleryPhotos', `Effect started: initialUri=${initialUri}`);

    const loadPhotos = async () => {
      logger.debug('useGalleryPhotos', `loadPhotos started: initialUri=${initialUri}`);
      try {
        logger.debug('Gallery', 'Checking MediaLibrary permissions...');
        const checkPerms = async () => {
          const current = await MediaLibrary.getPermissionsAsync();
          if (current.granted || current.status === ('limited' as any)) return current.status;

          logger.debug('Gallery', 'Requesting MediaLibrary permissions (ignoring canAskAgain)...');
          const req = await MediaLibrary.requestPermissionsAsync();
          return req.status;
        };

        let permTimer: NodeJS.Timeout;
        const permTimeout = new Promise<string>((_, reject) =>
          permTimer = setTimeout(() => reject(new Error('PERM_TIMEOUT')), 60000)
        );

        let status = 'denied';
        try {
          status = await Promise.race([checkPerms(), permTimeout]).finally(() => clearTimeout(permTimer));
        } catch (e) {
          logger.warn('Gallery', 'Permissions timeout or error', e);
        }

        if (!active) {
          logger.debug('useGalleryPhotos', `loadPhotos: active became false during permission check`);
          return;
        }

        if (status !== 'granted' && status !== ('limited' as any)) {
          logger.warn('Gallery', 'MediaLibrary permissions not granted or timed out');
          setPermissionGranted(false);
          setLoading(false);
          if (initialUri) {
            logger.debug('useGalleryPhotos', `Permissions not granted: setting photos to single fallback item: ${initialUri}`);
            setPhotos([{ id: 'initial', uri: initialUri }]);
          }
          return;
        }

        setPermissionGranted(true);

        let albumsTimer: NodeJS.Timeout;
        const albumsTimeout = new Promise<never>((_, reject) =>
          albumsTimer = setTimeout(() => reject(new Error('ALBUM_TIMEOUT')), 10000)
        );
        const allAlbums = await Promise.race([
          MediaLibrary.getAlbumsAsync(),
          albumsTimeout
        ]).finally(() => clearTimeout(albumsTimer));

        if (!active) {
          logger.debug('useGalleryPhotos', `loadPhotos: active became false during album fetch`);
          return;
        }

        const grovkornetAlbums = allAlbums.filter(a => a.title.toLowerCase() === 'grovkornet');

        let media: MediaLibrary.Asset[] = [];
        let assetsTimer: NodeJS.Timeout;

        if (grovkornetAlbums.length > 0) {
          logger.debug('Gallery', `Found ${grovkornetAlbums.length} Grovkornet albums, fetching from all...`);
          const fetchPromises = grovkornetAlbums.map(album => 
            MediaLibrary.getAssetsAsync({
              album: album.id,
              first: 50,
              sortBy: [[MediaLibrary.SortBy.creationTime, false]],
              mediaType: MediaLibrary.MediaType.photo,
            })
          );
          
          const assetsTimeout = new Promise<never>((_, reject) =>
            assetsTimer = setTimeout(() => reject(new Error('ASSETS_TIMEOUT')), 15000)
          );

          const results = await Promise.race([
            Promise.all(fetchPromises),
            assetsTimeout
          ]).finally(() => clearTimeout(assetsTimer));
          
          // Combine and sort descending by creationTime
          const combinedAssets = results.flatMap(r => r.assets);
          combinedAssets.sort((a, b) => b.creationTime - a.creationTime);
          
          // Take top 50 across all albums
          media = combinedAssets.slice(0, 50);
        } else {
          logger.debug('Gallery', 'Grovkornet album not found. Using global fallback...');
          try {
            // Fallback: get recent assets and filter by 'Grovkornet'
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
            logger.debug('Gallery', `Fallback found ${media.length} photos containing 'Grovkornet'`);
          } catch (e) {
            logger.error('Gallery', 'Error in global fallback', e);
            media = [];
          }
        }

        if (!active) {
          logger.debug('useGalleryPhotos', `loadPhotos: active became false during media resolution`);
          return;
        }

        const items: GalleryItem[] = media.map(asset => ({
          id: asset.id,
          uri: asset.uri,
          filename: asset.filename
        }));

        if (initialUri) {
          const initialFilenameOrId = initialUri.split('/').pop();
          const alreadyExists = items.some(item =>
            item.uri === initialUri ||
            (initialFilenameOrId && (item.filename === initialFilenameOrId || item.id === initialFilenameOrId))
          );

          logger.debug('useGalleryPhotos', `loadPhotos check: initialUri=${initialUri}, alreadyExists=${alreadyExists}`);
          if (!alreadyExists) {
            logger.debug('useGalleryPhotos', `loadPhotos: unshifting temp preview: ${initialUri}`);
            items.unshift({ id: 'preview-temp', uri: initialUri, filename: initialFilenameOrId });
          }
        }

        // Deduplicate items by ID to prevent React "Encountered two children with the same key" crashes
        const uniqueItems: GalleryItem[] = [];
        const seenIds = new Set<string>();
        for (const item of items) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            uniqueItems.push(item);
          }
        }

        logger.debug('useGalleryPhotos', `loadPhotos complete: setting ${uniqueItems.length} photos`);
        setPhotos(uniqueItems);
        setLoading(false);
      } catch (error) {
        logger.error('Gallery', 'Failed to load photos (graceful fallback)', error);
        if (active) {
          setLoading(false);
          setPermissionGranted(false);
          if (initialUri) {
            setPhotos([{ id: 'initial', uri: initialUri }]);
          }
        }
      }
    };

    void loadPhotos();

    const subscription = AppState.addEventListener('change', nextAppState => {
      logger.debug('useGalleryPhotos', `AppState change: status=${nextAppState}, active=${active}`);
      if (nextAppState === 'active' && active) {
        void loadPhotos();
      }
    });

    return () => {
      logger.debug('useGalleryPhotos', `Effect cleanup running for initialUri=${initialUri}`);
      active = false;
      subscription.remove();
    };
  }, [initialUri]);

  return {
    photos,
    setPhotos,
    loading,
    permissionGranted,
  };
};
