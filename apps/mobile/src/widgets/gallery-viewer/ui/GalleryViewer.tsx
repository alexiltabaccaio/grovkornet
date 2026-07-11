import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Platform, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useAnimatedStyle, SharedValue, interpolate, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { ShareButton, DeleteButton, PhotoPreview, GalleryStrip, useGalleryViewer } from '@features/gallery';
import { useDeviceRotation } from '@shared/lib/hooks/useDeviceRotation';
import { useVerificationStore } from '@entities/verification';

interface GalleryViewerProps {
  onClose: () => void;
  initialUri?: string | null;
  galleryTransition?: SharedValue<number>;
  header?: React.ReactNode;
}

export const GalleryViewer = React.memo(({ onClose, initialUri, galleryTransition, header }: GalleryViewerProps) => {
  const { photos, selectedPhoto, loading, onPhotoVisible, onSelectPhoto, onDeletePhoto } = useGalleryViewer(initialUri, onClose);
  const rotationY = useDeviceRotation();
  const { width, height } = useWindowDimensions();

  const selectedPhotoUri = selectedPhoto?.uri;
  const isVerified = useVerificationStore(
    useCallback(state => (selectedPhotoUri ? !!state.verifiedMap[selectedPhotoUri] : false), [selectedPhotoUri])
  );

  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const placeholderOpacity = useSharedValue(1);

  const zoomScale = useSharedValue(1);
  const zoomTranslateX = useSharedValue(0);
  const zoomTranslateY = useSharedValue(0);

  const [isHighResLoaded, setIsHighResLoaded] = useState(false);
  const [isReadyToFade, setIsReadyToFade] = useState(false);

  const handleInitialImageLoad = useCallback(() => {
    // Add a small delay after onLoad to ensure the image
    // is actually rendered on the GPU before starting the fade-out.
    // This prevents the black flash during transition.
    setTimeout(() => {
      setIsHighResLoaded(true);
    }, 150);
  }, []);

  useEffect(() => {
    // Ensures we don't fade out the placeholder while it's still animating its opening scale (300ms)
    const timer = setTimeout(() => {
      setIsReadyToFade(true);
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!loading && isReadyToFade && (photos.length === 0 || isHighResLoaded)) {
      // Both the 300ms opening transition is complete AND the high-res image has finished decoding (or no photos exist).
      // Now we can safely fade out the placeholder.
      placeholderOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(setShowPlaceholder)(false);
        }
      });
    } else if (loading) {
      placeholderOpacity.value = 1;
      setShowPlaceholder(true);
      setIsHighResLoaded(false); // reset if loading state re-triggers
    }
  }, [loading, isHighResLoaded, isReadyToFade, placeholderOpacity, photos.length]);

  const onCloseRef = React.useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    if (!galleryTransition) return {};
    return {
      opacity: galleryTransition.value,
    };
  }, [galleryTransition]);

  const animatedOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: placeholderOpacity.value,
    };
  }, [placeholderOpacity]);

  const animatedPlaceholderStyle = useAnimatedStyle(() => {
    if (!galleryTransition) return {};
    const t = galleryTransition.value;

    // Animate from thumbnail approximate position (bottom left) to center screen
    const translateX = interpolate(t, [0, 1], [-80, 0]);
    const translateY = interpolate(t, [0, 1], [height / 2 - 120, 0]);
    const scale = interpolate(t, [0, 1], [50 / width, 1]);

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
        { translateX: zoomTranslateX.value },
        { translateY: zoomTranslateY.value },
        { scale: zoomScale.value }
      ],
      borderRadius: interpolate(t, [0, 1], [8, 0]),
      overflow: 'hidden',
    };
  }, [width, height, galleryTransition, zoomScale, zoomTranslateX, zoomTranslateY]);

  return (
    <Animated.View
      style={[styles.absoluteContainer, animatedContainerStyle]}
      pointerEvents="auto"
    >
      <View style={styles.topArea} pointerEvents="box-none">
        {header}
      </View>
      <View style={styles.safeArea} pointerEvents="box-none">

        {/* Main Content (Always rendered so layout is stable from frame 1) */}
        <View style={styles.content}>

          {/* Main Preview Area */}
          <View style={styles.previewContainer}>

            {/* Real Gallery Image (mounted underneath) */}
            {!loading && (
              <>
                <PhotoPreview
                  selectedPhoto={selectedPhoto}
                  photos={photos}
                  onPhotoVisible={onPhotoVisible}
                  rotationY={rotationY}
                  onInitialImageLoad={handleInitialImageLoad}
                  zoomScale={zoomScale}
                  zoomTranslateX={zoomTranslateX}
                  zoomTranslateY={zoomTranslateY}
                />

                {/* Delete Action (Left) & Share Action (Right) */}
                {selectedPhoto && (
                  <>
                    <View style={styles.deleteContainer}>
                      <DeleteButton
                        photo={selectedPhoto}
                        onDelete={onDeletePhoto}
                      />
                    </View>
                    <View style={styles.shareContainer}>
                      <ShareButton
                        id={selectedPhoto.id}
                        uri={selectedPhoto.uri}
                        isVerified={isVerified}
                      />
                    </View>
                  </>
                )}
              </>
            )}

            {/* Placeholder Overlay (sits EXACTLY over PhotoPreview) */}
            {showPlaceholder && (
              <Animated.View style={[StyleSheet.absoluteFill, styles.center, animatedOverlayStyle]} pointerEvents="none">
                {initialUri ? (
                  <Animated.View style={[StyleSheet.absoluteFill, animatedPlaceholderStyle]}>
                    <Image
                      source={{ uri: initialUri }}
                      style={StyleSheet.absoluteFill}
                      contentFit="contain"
                      transition={0}
                      cachePolicy="memory-disk"
                      testID="gallery-placeholder-image"
                    />
                  </Animated.View>
                ) : null}
              </Animated.View>
            )}

          </View>

          {/* Media Gallery Strip (Always rendered so it animates in correctly) */}
          <GalleryStrip
            photos={photos}
            selectedPhoto={selectedPhoto}
            onSelectPhoto={onSelectPhoto}
            onClose={onClose}
            galleryTransition={galleryTransition}
          />
        </View>
      </View>

    </Animated.View>
  );
});
GalleryViewer.displayName = 'GalleryViewer';

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
    elevation: 999,
  },
  topArea: {
    backgroundColor: '#0e0e0e',
  },
  safeArea: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  previewContainer: {
    flex: 1,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0e0e0e',
  },
  shareContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 10,
  },
  deleteContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 10,
  },
});
