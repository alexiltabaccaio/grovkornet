import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import Animated, { SlideInRight, SlideInLeft, SlideOutRight, SlideOutLeft, runOnJS } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { GalleryItem } from '../../lib/types';

interface PhotoPreviewProps {
  selectedPhoto: GalleryItem | null;
  verifying: boolean;
  photos: GalleryItem[];
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const PhotoPreview = ({ selectedPhoto, verifying: _verifying, photos, onSwipeLeft, onSwipeRight }: PhotoPreviewProps) => {
  const { t } = useTranslation();
  const [prevUri, setPrevUri] = useState<string | null>(null);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Derive direction based on index change in photos
  if (selectedPhoto && selectedPhoto.uri !== prevUri) {
    const oldIndex = prevUri ? photos.findIndex(p => p.uri === prevUri) : -1;
    const newIndex = photos.findIndex(p => p.uri === selectedPhoto.uri);
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      setDirection(newIndex > oldIndex ? 'forward' : 'backward');
    }
    setPrevUri(selectedPhoto.uri);
  }

  if (!selectedPhoto) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>{t('gallery.no_photos', 'No photos found')}</Text>
      </View>
    );
  }

  const enteringAnimation = direction === 'forward'
    ? SlideInRight.duration(250)
    : SlideInLeft.duration(250);

  const exitingAnimation = direction === 'forward'
    ? SlideOutLeft.duration(250)
    : SlideOutRight.duration(250);

  const panGesture = Gesture.Pan()
    .onEnd((e) => {
      if (e.translationX < -50 && onSwipeLeft) {
        runOnJS(onSwipeLeft)();
      } else if (e.translationX > 50 && onSwipeRight) {
        runOnJS(onSwipeRight)();
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.previewWrapper}>
        <Animated.View
          key={selectedPhoto.uri}
          entering={enteringAnimation}
          exiting={exitingAnimation}
          style={styles.previewImageContainer}
        >
          <Image
            source={{ uri: selectedPhoto.uri }}
            style={styles.previewImage}
            contentFit="contain"
            placeholder={{ uri: selectedPhoto.uri }}
            placeholderContentFit="contain"
          />
        </Animated.View>
      </View>
    </GestureDetector>
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
    backgroundColor: '#111',
    position: 'relative',
  },
  previewImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});
