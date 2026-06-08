import React from 'react';
import { StyleSheet, Pressable, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { GalleryItem } from '../../lib/types';
import { useVerificationStore } from '@entities/verification';
import * as Haptics from '@shared/lib/haptics';

interface GalleryStripItemProps {
  item: GalleryItem;
  isSelected: boolean;
  onSelect: (item: GalleryItem) => void;
}

export const GalleryStripItem = React.memo(({ item, isSelected, onSelect }: GalleryStripItemProps) => {
  const isVerified = useVerificationStore(state => state.verifiedMap[item.uri]);

  const badgeStyle = useAnimatedStyle(() => {
    const show = isVerified === true;
    return {
      opacity: withTiming(show ? 1 : 0, { duration: 250 }),
      transform: [{ scale: withTiming(show ? 1 : 0.8, { duration: 250 }) }],
    };
  }, [isVerified]);

  return (
    <Pressable
      testID={`gallery-strip-item-${item.id}`}
      style={[
        styles.thumbnailWrapper,
        isSelected && styles.thumbnailSelected
      ]}
      onPress={() => {
        void Haptics.selectionAsync();
        onSelect(item);
      }}
    >
      <Image
        source={{ uri: item.uri }}
        style={styles.thumbnailImage}
        contentFit="cover"
        recyclingKey={item.uri}
      />
      <Animated.View style={[styles.miniBadge, { backgroundColor: 'transparent' }, badgeStyle]}>
        {/* eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment */}
        <RNImage source={require('../../../../../assets/logo-badge.png')} style={{ width: 10, height: 10, resizeMode: 'contain', opacity: 0.85 }} />
      </Animated.View>
    </Pressable>
  );
});

GalleryStripItem.displayName = 'GalleryStripItem';

const styles = StyleSheet.create({
  thumbnailWrapper: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: '#FF5722',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  miniBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    padding: 1,
  },
});
