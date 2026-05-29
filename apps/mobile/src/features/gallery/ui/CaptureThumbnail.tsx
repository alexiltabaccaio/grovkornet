import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable, AppState } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withSpring } from 'react-native-reanimated';
import { useState } from 'react';
import { useSystemStore } from '@entities/system';
import { useShallow } from 'zustand/react/shallow';
import * as MediaLibrary from 'expo-media-library';
import { logger } from '@shared/lib/logger';
import * as Haptics from '@shared/lib/haptics';

interface CaptureThumbnailProps {
  onPress: () => void;
}

export const CaptureThumbnail = ({ onPress }: CaptureThumbnailProps) => {
  const { isCapturing, latestPreviewUri, latestCapturedUri, setLatestCapturedUri } = useSystemStore(useShallow(state => ({
    isCapturing: state.isCapturing,
    latestPreviewUri: state.latestPreviewUri,
    latestCapturedUri: state.latestCapturedUri,
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
              // Robust fallback for thumbnail: get recent photos and find the first Grovkornet one
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

            // Always update to keep in sync with external deletions
            if (foundUri) {
              setLatestCapturedUri(foundUri);
            } else {
              setLatestCapturedUri(null); // No photos left
            }
          }
        } catch (e) {
          logger.warn('CaptureThumbnail', 'Failed to load initial thumbnail', e);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [prevUri, setPrevUri] = useState<string | null>(null);
  const [currentUri, setCurrentUri] = useState<string | null>(latestPreviewUri ?? latestCapturedUri ?? null);
  const animationProgress = useSharedValue(1);
  const lastSourceRef = React.useRef<'preview' | 'captured' | null>(
    latestPreviewUri ? 'preview' : (latestCapturedUri ? 'captured' : null)
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const isPreview = latestPreviewUri !== null;
    const newUri = latestPreviewUri ?? latestCapturedUri ?? null;
    const currentSource = isPreview ? 'preview' : (newUri ? 'captured' : null);

    if (newUri && newUri !== currentUri) {
      if (lastSourceRef.current === 'preview' && currentSource === 'captured') {
        // Transition from preview to final capture: same photo, don't animate twice
        setCurrentUri(newUri);
      } else {
        // New photo preview or first image: animate!
        setPrevUri(currentUri);
        setCurrentUri(newUri);
        animationProgress.value = 0;
        animationProgress.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
      }
    } else if (newUri && !currentUri) {
      setCurrentUri(newUri);
    } else if (!newUri && currentUri) {
      setCurrentUri(null);
      setPrevUri(null);
    }

    lastSourceRef.current = currentSource;
  }, [latestPreviewUri, latestCapturedUri, currentUri, animationProgress]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const scale = useSharedValue(1);

  useEffect(() => {
    if (isCapturing) {
      scale.value = withSpring(0.95);
    } else {
      scale.value = withSpring(1);
    }
  }, [isCapturing, scale]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const oldImageStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    transform: [{ translateX: animationProgress.value * 50 }],
  }));

  const newImageStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    transform: [{ translateX: (animationProgress.value - 1) * 50 }],
  }));

  const handlePress = () => {
    void Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable testID="capture-thumbnail" onPress={handlePress} style={styles.wrapper}>
      {!currentUri ? (
        <View style={styles.placeholder} />
      ) : (
        <Animated.View style={[styles.container, animatedContainerStyle]}>
          {prevUri && (
            <Animated.View style={oldImageStyle}>
              <Image
                source={{ uri: prevUri }}
                style={styles.image}
                contentFit="cover"
                transition={0}
                cachePolicy="memory-disk"
              />
            </Animated.View>
          )}
          {currentUri && (
            <Animated.View style={newImageStyle}>
              <Image
                source={{ uri: currentUri }}
                style={styles.image}
                contentFit="cover"
                transition={0}
                cachePolicy="memory-disk"
              />
            </Animated.View>
          )}
        </Animated.View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  container: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: '#FFF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
