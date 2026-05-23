import React from 'react';
import { StyleSheet, View, FlatList, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GalleryItem } from '../../lib/types';
import { BottomFooter } from '@shared/ui';

interface GalleryStripProps {
  photos: GalleryItem[];
  selectedPhoto: GalleryItem | null;
  onSelectPhoto: (item: GalleryItem) => void;
  onClose: () => void;
}

export const GalleryStrip = ({ photos, selectedPhoto, onSelectPhoto, onClose }: GalleryStripProps) => {
  return (
    <BottomFooter style={styles.footerContainer}>
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
                  <Ionicons name="checkmark-circle" size={10} color="#34C759" />
                </View>
              )}
            </Pressable>
          )}
        />
      </View>
    </BottomFooter>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
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
    resizeMode: 'cover',
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

