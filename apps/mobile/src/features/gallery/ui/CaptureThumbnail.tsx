import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withSpring } from 'react-native-reanimated';
import { useState } from 'react';
import { useCameraStore } from '@entities/camera';
import { useGalleryStore } from '@entities/gallery';
import { useShallow } from 'zustand/shallow';
import * as Haptics from '@shared/lib/haptics';
import { useRecentMediaThumbnail } from '../lib/useRecentMediaThumbnail';

interface CaptureThumbnailProps {
  onPress: () => void;
}

export const CaptureThumbnail = React.memo(({ onPress }: CaptureThumbnailProps) => {
  const isCapturing = useCameraStore(state => state.isCapturing);
  const { latestPreviewUri, latestCapturedUri } = useGalleryStore(useShallow(state => ({
    latestPreviewUri: state.latestPreviewUri,
    latestCapturedUri: state.latestCapturedUri,
  })));

  useRecentMediaThumbnail();

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
});

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
