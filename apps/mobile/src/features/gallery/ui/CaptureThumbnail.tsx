import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withSpring, useAnimatedReaction } from 'react-native-reanimated';
import { useState } from 'react';
import { useCameraStore } from '@entities/camera';
import { useGalleryStore } from '@entities/gallery';
import { useShallow } from 'zustand/shallow';
import * as Haptics from '@shared/lib/haptics';
import { useRecentMediaThumbnail } from '../lib/useRecentMediaThumbnail';
import { useDeviceRotation } from '@shared/lib/hooks/useDeviceRotation';

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
  const rotationY = useDeviceRotation();

  const [prevUri, setPrevUri] = useState<string | null>(null);
  const [placeholderUri, setPlaceholderUri] = useState<string | null>(null);
  const [currentUri, setCurrentUri] = useState<string | null>(latestPreviewUri ?? latestCapturedUri ?? null);
  const [finalOverlayUri, setFinalOverlayUri] = useState<string | null>(null);
  const animationProgress = useSharedValue(1);
  const currentImageRotation = useSharedValue(
    (latestPreviewUri ?? latestCapturedUri)
      ? (latestPreviewUri ? -rotationY.value : 0)
      : 0
  );
  const prevImageRotation = useSharedValue(0);
  const lastSourceRef = React.useRef<'preview' | 'captured' | null>(
    latestPreviewUri ? 'preview' : (latestCapturedUri ? 'captured' : null)
  );


  useEffect(() => {
    const isPreview = latestPreviewUri !== null;
    const newUri = latestPreviewUri ?? latestCapturedUri ?? null;
    const currentSource = isPreview ? 'preview' : (newUri ? 'captured' : null);

    if (newUri && newUri !== (finalOverlayUri ?? currentUri)) {
      if (lastSourceRef.current === 'preview' && currentSource === 'captured') {
        // Overlay final photo over the preview. This avoids React <Image> unmount/remount flickering.
        setFinalOverlayUri(newUri);
      } else if (currentSource === 'preview') {
        // New photo preview: animate!
        setPlaceholderUri(null); // No placeholder needed during sliding
        setPrevUri(finalOverlayUri ?? currentUri);
        setCurrentUri(newUri);
        setFinalOverlayUri(null);
        
        prevImageRotation.value = finalOverlayUri ? 0 : currentImageRotation.value;
        currentImageRotation.value = -rotationY.value;
        
        animationProgress.value = 0;
        animationProgress.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
      } else {
        // Transition from 'captured' to 'captured' (e.g. app wake up / init load sync)
        // or null to 'captured'
        // Just set the new URI without animating
        setPlaceholderUri(finalOverlayUri ?? currentUri);
        setCurrentUri(newUri);
        setFinalOverlayUri(null);
        
        prevImageRotation.value = finalOverlayUri ? 0 : currentImageRotation.value;
        currentImageRotation.value = 0;
      }
    } else if (newUri && !currentUri) {
      setPlaceholderUri(null);
      setCurrentUri(newUri);
      setFinalOverlayUri(null);
      currentImageRotation.value = currentSource === 'preview' ? -rotationY.value : 0;
    } else if (!newUri && currentUri) {
      setCurrentUri(null);
      setPrevUri(null);
      setPlaceholderUri(null);
      setFinalOverlayUri(null);
    }

    lastSourceRef.current = currentSource;
  }, [latestPreviewUri, latestCapturedUri, currentUri, finalOverlayUri, animationProgress, currentImageRotation, prevImageRotation, rotationY]);


  const scale = useSharedValue(1);
  const isCapturingSV = useSharedValue(isCapturing);

  useEffect(() => {
    isCapturingSV.value = isCapturing;
  }, [isCapturing, isCapturingSV]);

  useAnimatedReaction(
    () => isCapturingSV.value,
    (current, previous) => {
      if (current !== previous) {
        if (current) {
          scale.value = withSpring(0.95);
        } else {
          scale.value = withSpring(1);
        }
      }
    }
  );

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedInnerStyle = useAnimatedStyle(() => ({
    width: '100%',
    height: '100%',
    transform: [
      { scale: 1.5 },
      { rotate: `${rotationY.value}deg` }
    ],
  }));

  const oldImageStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    transform: [
      { translateX: animationProgress.value * 50 },
      { rotate: `${prevImageRotation.value}deg` }
    ],
  }));

  const newImageStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    transform: [
      { translateX: (animationProgress.value - 1) * 50 },
      { rotate: `${currentImageRotation.value}deg` }
    ],
  }));

  const placeholderImageStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${prevImageRotation.value}deg` }],
  }));

  const finalOverlayStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    transform: [
      { translateX: (animationProgress.value - 1) * 50 },
      { rotate: '0deg' }
    ],
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
        <Animated.View testID="capture-thumbnail-container" style={[styles.container, animatedContainerStyle]}>
          <Animated.View testID="capture-thumbnail-inner" style={animatedInnerStyle}>
            {placeholderUri && (
              <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 0 }, placeholderImageStyle]}>
                <Image source={{ uri: placeholderUri }} style={styles.image} resizeMode="cover" fadeDuration={0} />
              </Animated.View>
            )}
            {prevUri && (
              <Animated.View style={oldImageStyle}>
                <Image
                  source={{ uri: prevUri }}
                  style={styles.image}
                  resizeMode="cover"
                  fadeDuration={0}
                />
              </Animated.View>
            )}
            {currentUri && (
              <Animated.View testID="capture-thumbnail-current" style={[newImageStyle, { zIndex: 1 }]}>
                <Image
                  source={{ uri: currentUri }}
                  style={styles.image}
                  resizeMode="cover"
                  fadeDuration={0}
                />
              </Animated.View>
            )}
            {finalOverlayUri && (
              <Animated.View testID="capture-thumbnail-overlay" style={[finalOverlayStyle, { zIndex: 2 }]}>
                <Image
                  source={{ uri: finalOverlayUri }}
                  style={styles.image}
                  resizeMode="cover"
                  fadeDuration={0}
                />
              </Animated.View>
            )}
          </Animated.View>
        </Animated.View>
      )}
    </Pressable>
  );
});

CaptureThumbnail.displayName = 'CaptureThumbnail';

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
