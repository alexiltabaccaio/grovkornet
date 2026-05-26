import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { useTranslation } from 'react-i18next';
import { GalleryItem } from '../../lib/types';

interface PhotoPreviewProps {
  selectedPhoto: GalleryItem | null;
  photos: GalleryItem[];
  onPhotoVisible?: (photo: GalleryItem) => void;
}

import { AnimatedSlot } from './AnimatedSlot';

export const PhotoPreview = ({ selectedPhoto, photos, onPhotoVisible }: PhotoPreviewProps) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const GAP = 20;
  const slotWidth = width + GAP;

  const initialIndex = photos.length > 0
    ? Math.max(0, photos.findIndex(p => p.uri === selectedPhoto?.uri))
    : 0;

  // SharedValue so it's safely readable/writable from worklets without stale-closure issues
  const currentIndex = useSharedValue(initialIndex);

  const pendingTeleportRef = useRef<number | null>(null);
  const animatingToIndexRef = useRef<number | null>(null);
  
  const [renderIndices, setRenderIndices] = useState<number[]>([
    initialIndex - 1,
    initialIndex,
    initialIndex + 1,
  ]);

  const [slotOverrides, setSlotOverrides] = useState<Record<number, GalleryItem>>({});

  const translateX = useSharedValue(-initialIndex * slotWidth);
  const dragOffset = useSharedValue(0);

  useLayoutEffect(() => {
    if (pendingTeleportRef.current !== null) {
      const targetIndex = pendingTeleportRef.current;
      pendingTeleportRef.current = null;
      translateX.value = -targetIndex * slotWidth;
    }
  });

  const finalizeTransition = (newIndex: number, isManualSwipe: boolean) => {
    currentIndex.value = newIndex;
    animatingToIndexRef.current = null;
    setRenderIndices([newIndex - 1, newIndex, newIndex + 1]);

    if (isManualSwipe && onPhotoVisible && photos[newIndex]) {
      onPhotoVisible(photos[newIndex]);
    }
  };

  const finalizeTeleport = (targetIndex: number) => {
    currentIndex.value = targetIndex;
    animatingToIndexRef.current = null;
    pendingTeleportRef.current = targetIndex;
    setSlotOverrides({});
    setRenderIndices([targetIndex - 1, targetIndex, targetIndex + 1]);
  };

  useEffect(() => {
    if (!selectedPhoto || photos.length === 0) return;
    const idx = photos.findIndex(p => p.uri === selectedPhoto.uri);
    if (idx === -1 || idx === currentIndex.value || idx === animatingToIndexRef.current) return;

    const diff = idx - currentIndex.value;
    animatingToIndexRef.current = idx;

    if (Math.abs(diff) === 1) {
      const targetVal = -idx * slotWidth;
      translateX.value = withTiming(targetVal, { duration: 250 }, (finished) => {
        if (finished) runOnJS(finalizeTransition)(idx, false);
      });
    } else {
      // Distant jump: simulate adjacent scroll then teleport
      const mockAdjacentIndex = diff > 0 ? currentIndex.value + 1 : currentIndex.value - 1;
      
      setSlotOverrides({ [mockAdjacentIndex]: photos[idx] });
      setRenderIndices([currentIndex.value - 1, currentIndex.value, currentIndex.value + 1, mockAdjacentIndex]);

      const targetVal = -mockAdjacentIndex * slotWidth;
      translateX.value = withTiming(targetVal, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(finalizeTeleport)(idx);
        }
      });
    }
  }, [selectedPhoto, photos, slotWidth]);

  // Capture photos.length as a plain number for the worklet closure
  const photosLength = photos.length;

  const logSwipeDecision = (
    idx: number,
    shiftX: number,
    velocity: number,
    targetIndex: number,
    dragThreshold: number,
  ) => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(
        `[PhotoPreview] onEnd | currentIdx=${idx} shiftX=${shiftX.toFixed(1)} vel=${velocity.toFixed(0)} threshold=${dragThreshold.toFixed(0)} → targetIdx=${targetIndex}`,
      );
    }
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      // Cancel any in-progress spring so it doesn't fight the new drag
      cancelAnimation(translateX);
      dragOffset.value = translateX.value;
    })
    .onUpdate((event) => {
      'worklet';
      const proposedVal = dragOffset.value + event.translationX;

      const maxTranslateX = 0;
      const minTranslateX = -(photosLength - 1) * slotWidth;

      if (proposedVal > maxTranslateX) {
        const overscroll = proposedVal - maxTranslateX;
        translateX.value = maxTranslateX + overscroll * 0.35;
      } else if (proposedVal < minTranslateX) {
        const overscroll = proposedVal - minTranslateX;
        translateX.value = minTranslateX + overscroll * 0.35;
      } else {
        translateX.value = proposedVal;
      }
    })
    .onEnd((event) => {
      'worklet';
      const dragThreshold = width / 2;
      const velocityThreshold = 500;
      // Read from SharedValue — always up-to-date on the UI thread
      const idx = currentIndex.value;
      const currentBaseX = -idx * slotWidth;
      const shiftX = translateX.value - currentBaseX; // positive = dragged right (previous photo)
      const velocity = event.velocityX;

      let targetIndex = idx;

      if (shiftX > dragThreshold || velocity > velocityThreshold) {
        if (idx > 0) targetIndex = idx - 1;
      } else if (shiftX < -dragThreshold || velocity < -velocityThreshold) {
        if (idx < photosLength - 1) targetIndex = idx + 1;
      }

      // Log decision variables for debugging — remove once stable
      runOnJS(logSwipeDecision)(idx, shiftX, velocity, targetIndex, dragThreshold);

      const targetTranslateX = -targetIndex * slotWidth;

      if (targetIndex !== idx) {
        translateX.value = withSpring(
          targetTranslateX,
          {
            velocity: velocity,
            overshootClamping: true,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 0.01,
          },
          (finished) => {
            if (finished) runOnJS(finalizeTransition)(targetIndex, true);
          }
        );
      } else {
        translateX.value = withSpring(targetTranslateX, {
          velocity: velocity,
          overshootClamping: true,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        });
      }
    });

  if (!selectedPhoto || photos.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>{t('gallery.no_photos', 'No photos found')}</Text>
      </View>
    );
  }

  // Create a unique Set of renderIndices
  const uniqueIndices = Array.from(new Set(renderIndices)).filter(i => i >= 0 && i < photos.length);

  return (
    <View style={styles.previewWrapper}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={StyleSheet.absoluteFill}>
          {uniqueIndices.map(index => {
            const photo = slotOverrides[index] || photos[index];
            if (!photo) return null;
            return (
              <AnimatedSlot
                key={photo.id}
                photo={photo}
                index={index}
                translateX={translateX}
                slotWidth={slotWidth}
                gap={GAP}
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
    backgroundColor: '#111',
    position: 'relative',
  },
});
