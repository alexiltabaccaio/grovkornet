import React, { useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, FlatList, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GalleryItem } from '../../lib/types';
import { Footer } from '@shared/ui';
import * as Haptics from '@shared/lib/haptics';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';
import { useImageVerification } from '../../lib/useImageVerification';
import { GalleryStripItem } from './GalleryStripItem';

const { width } = Dimensions.get('window');
const ITEM_SIZE = 56 + 10; // thumbnailWidth (56) + marginRight (10) = 66px

const viewabilityConfig = {
  itemVisiblePercentThreshold: 50,
};



interface GalleryStripProps {
  photos: GalleryItem[];
  selectedPhoto: GalleryItem | null;
  onSelectPhoto: (item: GalleryItem) => void;
  onClose: () => void;
  galleryTransition?: SharedValue<number>;
}

export const GalleryStrip = React.memo(({ photos, selectedPhoto, onSelectPhoto, onClose, galleryTransition }: GalleryStripProps) => {
  const { verifyPhotosBatch } = useImageVerification();

  const photosRef = useRef(photos);
  const verifyBatchRef = useRef(verifyPhotosBatch);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    verifyBatchRef.current = verifyPhotosBatch;
  }, [verifyPhotosBatch]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: Array<{ item: GalleryItem, index: number | null }> }) => {
    if (viewableItems.length === 0) return;

    let minIndex = Infinity;
    let maxIndex = -Infinity;

    viewableItems.forEach(vi => {
      if (vi.index !== null) {
        if (vi.index < minIndex) minIndex = vi.index;
        if (vi.index > maxIndex) maxIndex = vi.index;
      }
    });

    if (minIndex === Infinity || maxIndex === -Infinity) {
      const uris = viewableItems.map(vi => vi.item.uri).filter(Boolean);
      void verifyBatchRef.current(uris);
      return;
    }

    const allPhotos = photosRef.current;
    const start = Math.max(0, minIndex - 5);
    const end = Math.min(allPhotos.length - 1, maxIndex + 5);

    const urisToVerify: string[] = [];
    for (let i = start; i <= end; i++) {
      if (allPhotos[i]?.uri) {
        urisToVerify.push(allPhotos[i].uri);
      }
    }
    void verifyBatchRef.current(urisToVerify);
  }, []);

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
    <Footer style={styles.footerContainer}>
      <Animated.View style={[styles.innerAnimatedContainer, animatedStyle]}>
        <Pressable 
          onPress={() => {
            void Haptics.selectionAsync();
            onClose();
          }} 
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: 0.6 }
          ]} 
          hitSlop={{ top: 20, bottom: 20, left: 24, right: 30 }}
          accessibilityLabel="Go back" 
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </Pressable>
      
      <View style={styles.listContainer}>
        <FlatList
          horizontal
          data={photos}
          keyExtractor={item => item.key || item.id}
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
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </View>
      </Animated.View>
    </Footer>
  );
});

GalleryStrip.displayName = 'GalleryStrip';

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
});

