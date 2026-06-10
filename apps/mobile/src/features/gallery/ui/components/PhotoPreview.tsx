import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
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
  initialUri?: string | null;
}

export const PhotoPreview = ({ selectedPhoto, photos, onPhotoVisible, rotationY, onInitialImageLoad, initialUri }: PhotoPreviewProps) => {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const GAP = 20;
  const slotWidth = width + GAP;

  const {
    currentIndex,
    renderIndices,
    slotOverrides,
    translateX,
    dragOffset,
    prepareTransition,
    finalizeTransition,
    isTransitioning,
  } = usePhotoPreviewTransition({
    selectedPhoto,
    photos,
    onPhotoVisible,
    slotWidth,
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
  });

  if (!selectedPhoto || photos.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>{t('gallery.no_photos', 'No photos found')}</Text>
      </View>
    );
  }

  const uniqueIndices = Array.from(new Set(renderIndices)).filter(i => i >= 0 && i < photos.length);

  return (
    <View style={styles.previewWrapper}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={StyleSheet.absoluteFill}>
          {uniqueIndices.map(index => {
            const photo = slotOverrides[index] || photos[index];
            if (!photo) return null;
            return (
              <AnimatedSlot
                key={index}
                photo={photo}
                index={index}
                translateX={translateX}
                slotWidth={slotWidth}
                gap={GAP}
                rotationY={rotationY}
                zoomScale={zoomScale}
                zoomTranslateX={zoomTranslateX}
                zoomTranslateY={zoomTranslateY}
                currentIndex={currentIndex}
                onLoad={photo.uri === selectedPhoto?.uri ? onInitialImageLoad : undefined}
                initialUri={photo.uri === selectedPhoto?.uri ? initialUri : undefined}
              />
            );
          })}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

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
