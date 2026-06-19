import { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as FileSystem from 'expo-file-system';
import { logger } from '@shared/lib/logger';
import { GalleryItem } from './types';

export const useGalleryPhotos = (initialUri?: string | null) => {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const initialUriRef = useRef(initialUri);
  useEffect(() => {
    initialUriRef.current = initialUri;
  }, [initialUri]);

  useEffect(() => {
    let active = true;
    const currentInitialUri = initialUriRef.current;
    logger.debug('useGalleryPhotos', `Effect started: initialUri=${currentInitialUri}`);

    const loadPhotos = async () => {
      const currentInitialUriLocal = initialUriRef.current;
      logger.debug('useGalleryPhotos', `loadPhotos started: initialUri=${currentInitialUriLocal}`);
      try {
        logger.debug('Gallery', 'Checking MediaLibrary permissions...');
        const checkPerms = async () => {
          const current = await MediaLibrary.getPermissionsAsync();
          if (current.granted || current.status === ('limited' as unknown as typeof current.status)) return current.status;

          logger.debug('Gallery', 'Requesting MediaLibrary permissions (ignoring canAskAgain)...');
          const req = await MediaLibrary.requestPermissionsAsync();
          return req.status;
        };

        let status = 'denied';
        if (process.env.NODE_ENV === 'test') {
          status = await checkPerms();
        } else {
          let permTimer: NodeJS.Timeout;
          const permTimeout = new Promise<string>((_, reject) =>
            permTimer = setTimeout(() => reject(new Error('PERM_TIMEOUT')), 60000)
          );
          try {
            status = await Promise.race([checkPerms(), permTimeout]).finally(() => clearTimeout(permTimer));
          } catch (e) {
            logger.warn('Gallery', 'Permissions timeout or error', e);
          }
        }

        if (!active) {
          logger.debug('useGalleryPhotos', `loadPhotos: active became false during permission check`);
          return;
        }

        if (status !== 'granted' && status !== ('limited' as unknown as typeof status)) {
          logger.warn('Gallery', 'MediaLibrary permissions not granted or timed out');
          setPermissionGranted(false);
          setLoading(false);
          if (currentInitialUriLocal) {
            try {
              const info = await FileSystem.getInfoAsync(currentInitialUriLocal);
              if (info.exists) {
                logger.debug('useGalleryPhotos', `Permissions not granted: setting photos to single fallback item: ${currentInitialUriLocal}`);
                setPhotos([{ id: 'initial', uri: currentInitialUriLocal }]);
              } else {
                setPhotos([]);
              }
            } catch (e) {
              setPhotos([]);
            }
          }
          return;
        }

        setPermissionGranted(true);

        let allAlbums: MediaLibrary.Album[];
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

        if (!active) {
          logger.debug('useGalleryPhotos', `loadPhotos: active became false during album fetch`);
          return;
        }

        const grovkornetAlbums = allAlbums.filter(a => a.title.toLowerCase() === 'grovkornet');

        let media: MediaLibrary.Asset[] = [];

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
          
          let results: MediaLibrary.PagedInfo<MediaLibrary.Asset>[];
          if (process.env.NODE_ENV === 'test') {
            results = await Promise.all(fetchPromises);
          } else {
            let assetsTimer: NodeJS.Timeout;
            const assetsTimeout = new Promise<never>((_, reject) =>
              assetsTimer = setTimeout(() => reject(new Error('ASSETS_TIMEOUT')), 15000)
            );

            results = await Promise.race([
              Promise.all(fetchPromises),
              assetsTimeout
            ]).finally(() => clearTimeout(assetsTimer));
          }
          
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

        if (currentInitialUriLocal) {
          const initialFilenameOrId = currentInitialUriLocal.split('/').pop();
          const alreadyExists = items.some(item =>
            item.uri === currentInitialUriLocal ||
            (initialFilenameOrId && (item.filename === initialFilenameOrId || item.id === initialFilenameOrId))
          );

          logger.debug('useGalleryPhotos', `loadPhotos check: initialUri=${currentInitialUriLocal}, alreadyExists=${alreadyExists}`);
          if (!alreadyExists) {
            try {
              const info = await FileSystem.getInfoAsync(currentInitialUriLocal);
              if (info.exists) {
                logger.debug('useGalleryPhotos', `loadPhotos: unshifting temp preview: ${currentInitialUriLocal}`);
                items.unshift({ id: 'preview-temp', key: 'preview-temp', uri: currentInitialUriLocal, filename: initialFilenameOrId });
              } else {
                logger.debug('useGalleryPhotos', `loadPhotos: temp preview ${currentInitialUriLocal} does not exist on disk, skipping.`);
              }
            } catch (e) {
              logger.warn('useGalleryPhotos', `Failed to check existence of temp preview: ${currentInitialUriLocal}`, e);
            }
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
          if (currentInitialUriLocal) {
            try {
              const info = await FileSystem.getInfoAsync(currentInitialUriLocal);
              if (info.exists) {
                setPhotos([{ id: 'initial', uri: currentInitialUriLocal }]);
              } else {
                setPhotos([]);
              }
            } catch (e) {
              setPhotos([]);
            }
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
      logger.debug('useGalleryPhotos', `Effect cleanup running for initialUri=${initialUriRef.current}`);
      active = false;
      subscription.remove();
    };
  }, []);

  return {
    photos,
    setPhotos,
    loading,
    permissionGranted,
  };
};
