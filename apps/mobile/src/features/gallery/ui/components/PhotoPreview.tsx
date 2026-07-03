import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { SharedValue, useSharedValue } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';

import { useTranslation } from 'react-i18next';
import { GalleryItem } from '../../lib/types';

import { usePhotoPreviewTransition } from '../../lib/usePhotoPreviewTransition';
import { usePhotoPreviewGestures } from '../../lib/usePhotoPreviewGestures';
import { AnimatedSlot } from './AnimatedSlot';

interface PhotoPreviewProps {
  selectedPhoto: GalleryItem | null;
  photos: GalleryItem[];
  onPhotoVisible?: (photo: GalleryItem) => void;
  rotationY?: SharedValue<number>;
  onInitialImageLoad?: () => void;
  zoomScale?: SharedValue<number>;
  zoomTranslateX?: SharedValue<number>;
  zoomTranslateY?: SharedValue<number>;
}

export const PhotoPreview = React.memo(({ selectedPhoto, photos, onPhotoVisible, rotationY, onInitialImageLoad, zoomScale: zoomScaleRef, zoomTranslateX: zoomTranslateXRef, zoomTranslateY: zoomTranslateYRef }: PhotoPreviewProps) => {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const GAP = 20;
  const slotWidth = width + GAP;
  const resetZoomSignal = useSharedValue(0);

  const {
    currentIndex,
    renderIndices,
    translateX,
    dragOffset,
    prepareTransition,
    finalizeTransition,
    isTransitioning,
    isTeleporting,
    teleportMockIndex,
    teleportRealIndex,
    finalizeTeleport,
  } = usePhotoPreviewTransition({
    selectedPhoto,
    photos,
    onPhotoVisible,
    slotWidth,
    resetZoomSignal,
  });

  const {
    zoomScale,
    zoomTranslateX,
    zoomTranslateY,
    composedGesture,
  } = usePhotoPreviewGestures({
    width,
    height,
    photosLength: photos.length,
    slotWidth,
    translateX,
    dragOffset,
    currentIndex,
    rotationY,
    selectedPhoto,
    prepareTransition,
    finalizeTransition,
    isTransitioning,
    isTeleporting,
    teleportMockIndex,
    teleportRealIndex,
    finalizeTeleport,
    zoomScaleRef,
    zoomTranslateXRef,
    zoomTranslateYRef,
    resetZoomSignal,
  });

  if (!selectedPhoto || photos.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>{t('gallery.no_photos', 'No photos found')}</Text>
      </View>
    );
  }

  const uniqueIndices = Array.from(new Set(renderIndices))
    .filter(i => i >= 0 && i < photos.length)
    .sort((a, b) => a - b);

  return (
    <View style={styles.previewWrapper}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={StyleSheet.absoluteFill}>
          {uniqueIndices.map(index => {
            const photo = photos[index];
            if (!photo) return null;
            return (
              <AnimatedSlot
                key={`${index}-${photo.id}`}
                photo={photo}
                index={index}
                translateX={translateX}
                slotWidth={slotWidth}
                gap={GAP}
                rotationY={rotationY}
                zoomScale={zoomScale}
                zoomTranslateX={zoomTranslateX}
                zoomTranslateY={zoomTranslateY}
                isTeleporting={isTeleporting}
                teleportMockIndex={teleportMockIndex}
                teleportRealIndex={teleportRealIndex}
                onLoad={onInitialImageLoad}
              />
            );
          })}
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

PhotoPreview.displayName = 'PhotoPreview';

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#666',
    fontSize: 16,
  },
  previewWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#0e0e0e',
    position: 'relative',
  },
});
