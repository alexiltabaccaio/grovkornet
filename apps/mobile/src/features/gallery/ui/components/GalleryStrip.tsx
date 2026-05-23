import React from 'react';
import { StyleSheet, View, FlatList, Pressable, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GalleryItem } from '../../lib/types';
import { BottomFooter } from '@shared/ui';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

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
                <View style={[styles.miniBadge, { backgroundColor: 'transparent' }]}>
                  <Image source={require('../../../../../assets/logo-badge.png')} style={{ width: 10, height: 10, resizeMode: 'contain', opacity: 0.85 }} />
                </View>
              )}
            </Pressable>
          )}
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

