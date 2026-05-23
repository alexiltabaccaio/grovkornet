import { useState, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { logger } from '@shared/lib/logger';
import { GalleryItem } from './types';

export const useGalleryPhotos = (initialUri?: string | null) => {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    let active = true;

    const loadPhotos = async () => {
      try {
        logger.debug('Gallery', 'Checking MediaLibrary permissions...');
        const checkPerms = async () => {
          const current = await MediaLibrary.getPermissionsAsync();
          if (current.granted) return 'granted';
          
          logger.debug('Gallery', 'Requesting MediaLibrary permissions (ignoring canAskAgain)...');
          const req = await MediaLibrary.requestPermissionsAsync();
          return req.status;
        };

        const permTimeout = new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('PERM_TIMEOUT')), 15000)
        );

        let status = 'denied';
        try {
          status = await Promise.race([checkPerms(), permTimeout]);
        } catch (e) {
          logger.warn('Gallery', 'Permissions timeout or error', e);
        }

        if (!active) return;

        if (status !== 'granted') {
          logger.warn('Gallery', 'MediaLibrary permissions not granted or timed out');
          setPermissionGranted(false);
          setLoading(false);
          if (initialUri) {
            setPhotos([{ id: 'initial', uri: initialUri }]);
          }
          return;
        }

        setPermissionGranted(true);

        logger.debug('Gallery', 'Fetching Grovkornet album with timeout...');
        const albumTimeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('ALBUM_TIMEOUT')), 10000)
        );
        const album = await Promise.race([
          MediaLibrary.getAlbumAsync('Grovkornet'),
          albumTimeout
        ]);

        if (!active) return;

        let media: MediaLibrary.Asset[] = [];
        const assetsTimeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('ASSETS_TIMEOUT')), 15000)
        );

        if (album) {
          const result = await Promise.race([
            MediaLibrary.getAssetsAsync({
              album: album.id,
              first: 50,
              sortBy: [[MediaLibrary.SortBy.creationTime, false]],
              mediaType: MediaLibrary.MediaType.photo,
            }),
            assetsTimeout
          ]);
          media = result.assets;
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
              a.filename.startsWith('Grovkornet_')
            );
            logger.debug('Gallery', `Fallback found ${media.length} photos containing 'Grovkornet'`);
          } catch (e) {
            logger.error('Gallery', 'Error in global fallback', e);
            media = [];
          }
        }

        if (!active) return;

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
          
          if (!alreadyExists) {
            items.unshift({ id: 'preview-temp', uri: initialUri, filename: initialFilenameOrId });
          }
        }

        setPhotos(items);
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

    return () => {
      active = false;
    };
  }, [initialUri]);

  return {
    photos,
    setPhotos,
    loading,
    permissionGranted,
  };
};
