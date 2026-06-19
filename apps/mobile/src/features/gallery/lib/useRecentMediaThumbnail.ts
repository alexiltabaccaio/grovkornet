import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useGalleryStore } from '@entities/gallery';
import { useShallow } from 'zustand/shallow';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as FileSystem from 'expo-file-system';
import { logger } from '@shared/lib/logger';

export const useRecentMediaThumbnail = () => {
  const { setLatestCapturedUri } = useGalleryStore(useShallow(state => ({
    setLatestCapturedUri: state.setLatestCapturedUri,
  })));

  useEffect(() => {
    const loadInitialThumbnail = async () => {
      try {
        const perms = await MediaLibrary.getPermissionsAsync();
        if (perms.granted || perms.status === ('limited' as unknown as typeof perms.status)) {
          const allAlbums = await MediaLibrary.getAlbumsAsync();
          const grovkornetAlbums = allAlbums.filter(a => a.title.toLowerCase() === 'grovkornet');

          let foundUri: string | null = null;
          let foundFilename: string | null = null;
          let foundId: string | null = null;

          if (grovkornetAlbums.length > 0) {
            const fetchPromises = grovkornetAlbums.map(album => 
              MediaLibrary.getAssetsAsync({
                album: album.id,
                first: 1,
                sortBy: [[MediaLibrary.SortBy.creationTime, false]],
                mediaType: MediaLibrary.MediaType.photo,
              })
            );
            
            const results = await Promise.all(fetchPromises);
            const combinedAssets = results.flatMap(r => r.assets);
            combinedAssets.sort((a, b) => b.creationTime - a.creationTime);
            
            if (combinedAssets.length > 0) {
              foundUri = combinedAssets[0].uri;
              foundFilename = combinedAssets[0].filename;
              foundId = combinedAssets[0].id;
            }
          }
          
          if (!foundUri) {
            const recent = await MediaLibrary.getAssetsAsync({
              first: 200,
              sortBy: [[MediaLibrary.SortBy.creationTime, false]],
              mediaType: MediaLibrary.MediaType.photo,
            });
            
            const latestGrovkornet = recent.assets.find(a => 
              a.uri.includes('Grovkornet') || 
              a.filename.includes('Grovkornet') || 
              a.filename.startsWith('Grovkornet_') ||
              a.filename.startsWith('GVK_')
            );
            
            if (latestGrovkornet) {
              foundUri = latestGrovkornet.uri;
              foundFilename = latestGrovkornet.filename;
              foundId = latestGrovkornet.id;
            }
          }

          if (foundUri) {
            try {
              const info = await FileSystem.getInfoAsync(foundUri);
              if (!info.exists) {
                logger.debug('useRecentMediaThumbnail', `Found URI ${foundUri} does not exist on disk, invalidating latest captured URI.`);
                foundUri = null;
              }
            } catch (e) {
              logger.warn('useRecentMediaThumbnail', `Failed to check existence for foundUri: ${foundUri}`, e);
              foundUri = null;
            }
          }

          const currentUri = useGalleryStore.getState().latestCapturedUri;

          if (foundUri) {
            // Prevent state updates and UI flickers if it's the exact same file
            if (currentUri === foundUri) return;
            if (currentUri && foundFilename && currentUri.includes(foundFilename)) return;
            if (currentUri && foundId && currentUri.endsWith(foundId)) return;

            setLatestCapturedUri(foundUri);
          } else {
            if (currentUri) {
              try {
                const info = await FileSystem.getInfoAsync(currentUri);
                if (!info.exists) {
                  logger.debug('useRecentMediaThumbnail', `Current URI ${currentUri} no longer exists, clearing store.`);
                  setLatestCapturedUri(null);
                }
              } catch (e) {
                logger.warn('useRecentMediaThumbnail', `Failed to check existence for currentUri: ${currentUri}`, e);
                setLatestCapturedUri(null);
              }
            }
          }
        }
      } catch (e) {
        logger.warn('useRecentMediaThumbnail', 'Failed to load initial thumbnail', e);
      }
    };

    void loadInitialThumbnail();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        void loadInitialThumbnail();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [setLatestCapturedUri]);
};
