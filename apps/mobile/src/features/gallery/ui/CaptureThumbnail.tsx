import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSpring } from 'react-native-reanimated';
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
    if (!latestCapturedUri) {
      const loadInitialThumbnail = async () => {
        try {
          const perms = await MediaLibrary.getPermissionsAsync();
          if (perms.granted) {
            const allAlbums = await MediaLibrary.getAlbumsAsync();
            const grovkornetAlbums = allAlbums.filter(a => a.title.toLowerCase() === 'grovkornet');

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
                setLatestCapturedUri(combinedAssets[0].uri);
              }
            } else {
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
                setLatestCapturedUri(latestGrovkornet.uri);
              }
            }
          }
        } catch (e) {
          logger.warn('CaptureThumbnail', 'Failed to load initial thumbnail', e);
        }
      };
      void loadInitialThumbnail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isCapturing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
      scale.value = withSpring(0.95);
    } else {
      rotation.value = 0;
      scale.value = withSpring(1);
    }
  }, [isCapturing, rotation, scale]);

  const animatedSpinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    void Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable testID="capture-thumbnail" onPress={handlePress} style={styles.wrapper}>
      {!isCapturing && !latestCapturedUri && !latestPreviewUri ? (
        <View style={styles.placeholder} />
      ) : (
        <Animated.View style={[styles.container, animatedContainerStyle]}>
          {isCapturing ? (
            <Animated.View style={[styles.spinnerContainer, animatedSpinnerStyle]}>
              <View style={styles.spinnerRing} />
              <ActivityIndicator size="small" color="#FF9500" />
            </Animated.View>
          ) : (latestPreviewUri ?? latestCapturedUri) ? (
            <Image
              source={{ uri: latestPreviewUri ?? latestCapturedUri! }}
              style={styles.image}
              contentFit="cover"
              transition={0}
              cachePolicy="memory-disk"
            />
          ) : null}
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
  spinnerContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 149, 0, 0.3)',
    borderTopColor: '#FF9500',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
