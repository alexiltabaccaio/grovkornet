import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useSystemStore } from '@entities/system';
import { useShallow } from 'zustand/react/shallow';
import * as MediaLibrary from 'expo-media-library/legacy';
import { logger } from '@shared/lib/logger';

export const useRecentMediaThumbnail = () => {
  const { setLatestCapturedUri } = useSystemStore(useShallow(state => ({
    setLatestCapturedUri: state.setLatestCapturedUri,
  })));

  useEffect(() => {
    const loadInitialThumbnail = async () => {
      try {
        const perms = await MediaLibrary.getPermissionsAsync();
        if (perms.granted) {
          const allAlbums = await MediaLibrary.getAlbumsAsync();
          const grovkornetAlbums = allAlbums.filter(a => a.title.toLowerCase() === 'grovkornet');

          let foundUri: string | null = null;

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
            }
          }

          if (foundUri) {
            setLatestCapturedUri(foundUri);
          } else {
            setLatestCapturedUri(null);
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
