import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { GalleryItem } from '../../lib/types';

interface AnimatedSlotProps {
  photo: GalleryItem;
  index: number;
  translateX: Animated.SharedValue<number>;
  slotWidth: number;
  gap: number;
  rotationY?: Animated.SharedValue<number>;
}

export const AnimatedSlot = ({
  photo,
  index,
  translateX,
  slotWidth,
  gap,
  rotationY,
}: AnimatedSlotProps) => {
  const { width: screenW, height: screenH } = useWindowDimensions();

  const outerStyle = useAnimatedStyle(() => {
    const currentX = index * slotWidth + translateX.value;
    const isFocused = Math.abs(currentX) < slotWidth / 2;
    
    const angle = rotationY ? rotationY.value : 0;
    const normalizedAngle = Math.abs(angle % 90);
    const isRotating = normalizedAngle > 1 && normalizedAngle < 89;

    return {
      transform: [{ translateX: currentX }],
      zIndex: isFocused ? 10 : 0,
      opacity: (!isFocused && isRotating) ? 0 : 1,
    };
  });

  const innerStyle = useAnimatedStyle(() => {
    const angle = rotationY ? rotationY.value : 0;
    
    // Convert angle to radians for smooth width/height interpolation
    const rad = (angle * Math.PI) / 180;
    const sinSq = Math.sin(rad) * Math.sin(rad);
    const cosSq = Math.cos(rad) * Math.cos(rad);

    // Smoothly interpolate width and height based on the angle
    const currentWidth = screenW * cosSq + screenH * sinSq;
    const currentHeight = screenH * cosSq + screenW * sinSq;

    return {
      width: currentWidth,
      height: currentHeight,
      transform: [{ rotate: `${angle}deg` }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.slotContainer,
        { width: slotWidth, paddingRight: gap },
        outerStyle,
      ]}
    >
      <Animated.View style={innerStyle}>
        <Image
          source={photo.uri}
          style={styles.previewImage}
          contentFit="contain"
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  slotContainer: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center', // Prevents shifting off-screen
    alignItems: 'center',     // Prevents shifting off-screen
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});

