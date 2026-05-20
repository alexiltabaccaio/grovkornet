import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GalleryItem } from '@features/gallery/lib/types';
import { AuthenticityBadge } from './AuthenticityBadge';

interface PhotoPreviewProps {
  selectedPhoto: GalleryItem | null;
  verifying: boolean;
}

export const PhotoPreview = ({ selectedPhoto, verifying }: PhotoPreviewProps) => {
  const { t } = useTranslation();

  if (!selectedPhoto) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>{t('gallery.no_photos', 'No photos found')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.previewWrapper}>
      <Image source={{ uri: selectedPhoto.uri }} style={styles.previewImage} />
      <AuthenticityBadge verifying={verifying} isVerified={selectedPhoto.isVerified} />
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
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
