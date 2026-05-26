import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { GalleryItem } from '../../lib/types';

interface AnimatedSlotProps {
  photo: GalleryItem;
  index: number;
  translateX: Animated.SharedValue<number>;
  slotWidth: number;
  gap: number;
}

export const AnimatedSlot = ({
  photo,
  index,
  translateX,
  slotWidth,
  gap,
}: AnimatedSlotProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: index * slotWidth + translateX.value }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.slotContainer,
        { width: slotWidth, paddingRight: gap },
        animatedStyle,
      ]}
    >
      <Image
        source={photo.uri}
        style={styles.previewImage}
        contentFit="contain"
        transition={200}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  slotContainer: {
    position: 'absolute',
    height: '100%',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});
