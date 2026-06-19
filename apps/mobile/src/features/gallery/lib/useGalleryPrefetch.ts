import { useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library/legacy';
import { logger } from '@shared/lib/logger';
import { useImageVerification } from './useImageVerification';

export const useGalleryPrefetch = () => {
  const { verifyPhotosBatch } = useImageVerification();

  useEffect(() => {
    let active = true;
    let timer: NodeJS.Timeout;
    let idleHandle: number;

    const runPrefetch = () => {
      timer = setTimeout(() => {
        void (async () => {
          try {
            const currentPerm = await MediaLibrary.getPermissionsAsync();
            if (!active || (!currentPerm.granted && currentPerm.status !== ('limited' as unknown as typeof currentPerm.status))) return;

            logger.debug('GalleryPrefetch', 'Startup pre-fetch: permissions granted. Fetching recent photos...');

            const allAlbums = await MediaLibrary.getAlbumsAsync();
            if (!active) return;

            const grovkornetAlbums = allAlbums.filter(
              (a) => a.title.toLowerCase() === 'grovkornet'
            );

            let assets: MediaLibrary.Asset[] = [];
            if (grovkornetAlbums.length > 0) {
              const fetchPromises = grovkornetAlbums.map((album) =>
                MediaLibrary.getAssetsAsync({
                  album: album.id,
                  first: 15,
                  sortBy: [[MediaLibrary.SortBy.creationTime, false]],
                  mediaType: MediaLibrary.MediaType.photo,
                })
              );
              const results = await Promise.all(fetchPromises);
              assets = results.flatMap((r) => r.assets).slice(0, 15);
            } else {
              const recent = await MediaLibrary.getAssetsAsync({
                first: 100,
                sortBy: [[MediaLibrary.SortBy.creationTime, false]],
                mediaType: MediaLibrary.MediaType.photo,
              });
              assets = recent.assets
                .filter(
                  (a) =>
                    a.uri.includes('Grovkornet') ||
                    a.filename.includes('Grovkornet') ||
                    a.filename.startsWith('Grovkornet_') ||
                    a.filename.startsWith('GVK_')
                )
                .slice(0, 15);
            }

            if (!active || assets.length === 0) return;

            const uris = assets.map((a) => a.uri).filter(Boolean);
            logger.debug('GalleryPrefetch', `Startup pre-fetch: starting validation for ${uris.length} photos`);
            void verifyPhotosBatch(uris);
          } catch (error) {
            logger.error('GalleryPrefetch', 'Startup pre-fetch verification failed', error);
          }
        })();
      }, 3000);
    };

    const reqIdle = (globalThis as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const cancelIdle = (globalThis as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;

    if (reqIdle) {
      idleHandle = reqIdle(runPrefetch);
    } else {
      runPrefetch();
    }

    return () => {
      active = false;
      if (timer) {
        clearTimeout(timer);
      }
      if (idleHandle && cancelIdle) {
        cancelIdle(idleHandle);
      }
    };
  }, [verifyPhotosBatch]);
};
