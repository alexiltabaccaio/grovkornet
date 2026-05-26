import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList, Pressable, Image as RNImage, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { GalleryItem } from '../../lib/types';
import { BottomFooter } from '@shared/ui';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const ITEM_SIZE = 56 + 10; // thumbnailWidth (56) + marginRight (10) = 66px

interface GalleryStripItemProps {
  item: GalleryItem;
  isSelected: boolean;
  onSelect: (item: GalleryItem) => void;
}

const GalleryStripItem = React.memo(({ item, isSelected, onSelect }: GalleryStripItemProps) => {
  return (
    <Pressable
      style={[
        styles.thumbnailWrapper,
        isSelected && styles.thumbnailSelected
      ]}
      onPress={() => onSelect(item)}
    >
      <Image
        source={{ uri: item.uri }}
        style={styles.thumbnailImage}
        contentFit="cover"
        recyclingKey={item.uri}
      />
      {item.isVerified === true && (
        <View style={[styles.miniBadge, { backgroundColor: 'transparent' }]}>
          {/* eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment */}
          <RNImage source={require('../../../../../assets/logo-badge.png')} style={{ width: 10, height: 10, resizeMode: 'contain', opacity: 0.85 }} />
        </View>
      )}
    </Pressable>
  );
});
GalleryStripItem.displayName = 'GalleryStripItem';

interface GalleryStripProps {
  photos: GalleryItem[];
  selectedPhoto: GalleryItem | null;
  onSelectPhoto: (item: GalleryItem) => void;
  onClose: () => void;
  galleryTransition?: SharedValue<number>;
}

export const GalleryStrip = ({ photos, selectedPhoto, onSelectPhoto, onClose, galleryTransition }: GalleryStripProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    if (!galleryTransition) return {};
    const translateX = interpolate(galleryTransition.value, [0, 1], [-width, 0]);
    return {
      transform: [{ translateX }],
    };
  });

  const renderItem = useCallback(({ item }: { item: GalleryItem }) => (
    <GalleryStripItem
      item={item}
      isSelected={selectedPhoto?.uri === item.uri}
      onSelect={onSelectPhoto}
    />
  ), [selectedPhoto?.uri, onSelectPhoto]);

  return (
    <BottomFooter style={styles.footerContainer}>
      <Animated.View style={[styles.innerAnimatedContainer, animatedStyle]}>
        <Pressable 
        onPress={onClose} 
        style={styles.backButton} 
        accessibilityLabel="Go back" 
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={24} color="#FFF" />
      </Pressable>
      
      <View style={styles.listContainer}>
        <FlatList
          horizontal
          data={photos}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
          renderItem={renderItem}
          windowSize={5}
          maxToRenderPerBatch={5}
          initialNumToRender={8}
          removeClippedSubviews
          getItemLayout={(_data, index) => ({
            length: ITEM_SIZE,
            offset: ITEM_SIZE * index,
            index,
          })}
        />
      </View>
      </Animated.View>
    </BottomFooter>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    paddingHorizontal: 0,
  },
  innerAnimatedContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backButton: {
    width: 48,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  gridContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
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
    borderColor: '#FF9500',
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

