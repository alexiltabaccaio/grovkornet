/* eslint-disable react-hooks/set-state-in-effect, react-hooks/refs, react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  cancelAnimation,
  SharedValue,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { useTranslation } from 'react-i18next';
import { GalleryItem } from '../../lib/types';
import * as Haptics from '@shared/lib/haptics';
import { logger } from '@shared/lib/logger';

interface PhotoPreviewProps {
  selectedPhoto: GalleryItem | null;
  photos: GalleryItem[];
  onPhotoVisible?: (photo: GalleryItem) => void;
  rotationY?: SharedValue<number>;
}

import { AnimatedSlot } from './AnimatedSlot';

export const PhotoPreview = ({ selectedPhoto, photos, onPhotoVisible, rotationY }: PhotoPreviewProps) => {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
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

  // Zoom-specific SharedValues
  const zoomScale = useSharedValue(1);
  const zoomTranslateX = useSharedValue(0);
  const zoomTranslateY = useSharedValue(0);

  const savedZoomScale = useSharedValue(1);
  const savedZoomTranslateX = useSharedValue(0);
  const savedZoomTranslateY = useSharedValue(0);
  const isZoomed = useSharedValue(false);
  const panMode = useSharedValue<'swipe' | 'pan'>('swipe');

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

    if (isManualSwipe && photos[newIndex]) {
      void Haptics.selectionAsync();
      if (onPhotoVisible) {
        onPhotoVisible(photos[newIndex]);
      }
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
    // Reset zoom whenever the active photo changes
    zoomScale.value = 1;
    zoomTranslateX.value = 0;
    zoomTranslateY.value = 0;
    savedZoomScale.value = 1;
    savedZoomTranslateX.value = 0;
    savedZoomTranslateY.value = 0;
    isZoomed.value = false;

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
    logger.debug(
      'PhotoPreview',
      `onEnd | currentIdx=${idx} shiftX=${shiftX.toFixed(1)} vel=${velocity.toFixed(0)} threshold=${dragThreshold.toFixed(0)} → targetIdx=${targetIndex}`
    );
  };

  const panGesture = Gesture.Pan()
    .maxPointers(1)
    .onStart((event) => {
      'worklet';
      if (isZoomed.value) {
        panMode.value = 'pan';
        savedZoomTranslateX.value = zoomTranslateX.value;
        savedZoomTranslateY.value = zoomTranslateY.value;
      } else {
        panMode.value = 'swipe';
        // Cancel any in-progress spring so it doesn't fight the new drag
        cancelAnimation(translateX);
        dragOffset.value = translateX.value;
      }
    })
    .onUpdate((event) => {
      'worklet';
      if (panMode.value === 'pan') {
        // Calculate the current active width and height considering device rotation
        const angle = rotationY ? rotationY.value : 0;
        const rad = (angle * Math.PI) / 180;
        const sinSq = Math.sin(rad) * Math.sin(rad);
        const cosSq = Math.cos(rad) * Math.cos(rad);
        const currentWidth = width * cosSq + height * sinSq;
        const currentHeight = height * cosSq + width * sinSq;

        // Clamp values to prevent panning outside the zoomed image borders
        const maxTx = (currentWidth * (zoomScale.value - 1)) / 2;
        const minTx = -maxTx;
        const maxTy = (currentHeight * (zoomScale.value - 1)) / 2;
        const minTy = -maxTy;

        zoomTranslateX.value = Math.max(minTx, Math.min(maxTx, savedZoomTranslateX.value + event.translationX));
        zoomTranslateY.value = Math.max(minTy, Math.min(maxTy, savedZoomTranslateY.value + event.translationY));
      } else {
        const proposedVal = dragOffset.value + event.translationX;
        const maxTranslateX = 0;
        const minTranslateX = -(photosLength - 1) * slotWidth;
        translateX.value = Math.max(minTranslateX, Math.min(maxTranslateX, proposedVal));
      }
    })
    .onEnd((event) => {
      'worklet';
      if (panMode.value === 'pan') {
        // Panning inside the zoomed image completed. No extra snapping needed.
      } else {
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
      }
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      'worklet';
      savedZoomScale.value = zoomScale.value;
      savedZoomTranslateX.value = zoomTranslateX.value;
      savedZoomTranslateY.value = zoomTranslateY.value;
    })
    .onUpdate((event) => {
      'worklet';
      let nextScale = savedZoomScale.value * event.scale;
      if (nextScale < 1) {
        nextScale = 1;
      } else if (nextScale > 4) {
        nextScale = 4;
      }
      zoomScale.value = nextScale;

      if (nextScale > 1.05) {
        isZoomed.value = true;
      }

      if (nextScale === 1) {
        zoomTranslateX.value = 0;
        zoomTranslateY.value = 0;
      } else {
        // Pinch zooming in progress. We keep standard scale zoom.
      }
    })
    .onEnd(() => {
      'worklet';
      if (zoomScale.value < 1.1) {
        isZoomed.value = false;
        zoomScale.value = withTiming(1);
        zoomTranslateX.value = withTiming(0);
        zoomTranslateY.value = withTiming(0);
      } else {
        isZoomed.value = true;
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((event) => {
      'worklet';
      if (isZoomed.value) {
        isZoomed.value = false;
        zoomScale.value = withTiming(1);
        zoomTranslateX.value = withTiming(0);
        zoomTranslateY.value = withTiming(0);
      } else {
        isZoomed.value = true;
        zoomScale.value = withTiming(2.5);
        
        // Calculate dimensions considering device rotation
        const angle = rotationY ? rotationY.value : 0;
        const rad = (angle * Math.PI) / 180;
        const sinSq = Math.sin(rad) * Math.sin(rad);
        const cosSq = Math.cos(rad) * Math.cos(rad);
        const currentWidth = width * cosSq + height * sinSq;
        const currentHeight = height * cosSq + width * sinSq;

        // Zoom in focused on tap point. Scale factor is 2.5, difference factor is (2.5 - 1) = 1.5
        const centerX = width / 2;
        const centerY = height / 2;
        const targetX = (centerX - event.x) * 1.5;
        const targetY = (centerY - event.y) * 1.5;

        // Clamp the zoom focus within maximum allowed bounds
        const maxTx = (currentWidth * 1.5) / 2;
        const minTx = -maxTx;
        const maxTy = (currentHeight * 1.5) / 2;
        const minTy = -maxTy;

        zoomTranslateX.value = withTiming(Math.max(minTx, Math.min(maxTx, targetX)));
        zoomTranslateY.value = withTiming(Math.max(minTy, Math.min(maxTy, targetY)));
      }
    });

  const composedGesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    doubleTapGesture
  );

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
      <GestureDetector gesture={composedGesture}>
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
                rotationY={rotationY}
                zoomScale={zoomScale}
                zoomTranslateX={zoomTranslateX}
                zoomTranslateY={zoomTranslateY}
                currentIndex={currentIndex}
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
