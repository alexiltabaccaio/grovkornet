import React from 'react';
import { StyleSheet, View, FlatList, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GalleryItem } from '@features/gallery/lib/types';

interface GalleryStripProps {
  photos: GalleryItem[];
  selectedPhoto: GalleryItem | null;
  onSelectPhoto: (item: GalleryItem) => void;
}

export const GalleryStrip = ({ photos, selectedPhoto, onSelectPhoto }: GalleryStripProps) => {
  return (
    <View style={styles.gridContainer}>
      <FlatList
        horizontal
        data={photos}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.thumbnailWrapper,
              selectedPhoto?.uri === item.uri && styles.thumbnailSelected
            ]}
            onPress={() => onSelectPhoto(item)}
          >
            <Image source={{ uri: item.uri }} style={styles.thumbnailImage} />
            {item.isVerified === true && (
              <View style={styles.miniBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#34C759" />
              </View>
            )}
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    height: 100,
    borderTopWidth: 1,
    borderTopColor: '#222',
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
  },
  gridContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  thumbnailWrapper: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: '#FF9500',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  miniBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    padding: 2,
  },
});
