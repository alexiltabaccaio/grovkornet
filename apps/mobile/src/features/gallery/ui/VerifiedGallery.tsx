import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ShareButton, StatusBarHeader } from '@features/camera-controls';
import { useGalleryPhotos } from '@features/gallery/lib/useGalleryPhotos';
import { useImageVerification } from '@features/gallery/lib/useImageVerification';
import { PhotoPreview } from './components/PhotoPreview';
import { GalleryStrip } from './components/GalleryStrip';

interface VerifiedGalleryProps {
  onClose: () => void;
  initialUri?: string | null;
}

export const VerifiedGallery = ({ onClose, initialUri }: VerifiedGalleryProps) => {
  const { t } = useTranslation();
  const { photos, setPhotos, loading, permissionGranted } = useGalleryPhotos(initialUri);
  const { selectedPhoto, verifying, verifyPhoto } = useImageVerification(setPhotos);

  // Auto-select on photos loaded
  useEffect(() => {
    if (!loading && photos.length > 0) {
      if (initialUri) {
        const found = photos.find(item => item.uri === initialUri);
        if (found) {
          void verifyPhoto(found);
        } else {
          void verifyPhoto({ id: 'initial', uri: initialUri });
        }
      } else {
        void verifyPhoto(photos[0]);
      }
    }
  }, [loading, photos, initialUri, verifyPhoto]);

  return (
    <View style={styles.absoluteContainer}>
      <StatusBarHeader />
      <View style={styles.safeArea}>
        
        {/* Close Button */}
        <Pressable onPress={onClose} style={styles.globalCloseButton}>
          <Ionicons name="close" size={28} color="#FFF" />
        </Pressable>

        {/* Loading Gallery View */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FF9500" />
            <Text style={styles.loadingText}>{t('gallery.loading', 'Loading gallery...')}</Text>
          </View>
        ) : (
          <View style={styles.content}>
            
            {/* Main Preview Area */}
            <View style={styles.previewContainer}>
              <PhotoPreview selectedPhoto={selectedPhoto} verifying={verifying} />
            </View>

            {/* Share Instagram Action */}
            {selectedPhoto && (
              <View style={styles.shareContainer}>
                <ShareButton uri={selectedPhoto.uri} isVerified={selectedPhoto.isVerified ?? false} />
              </View>
            )}

            {/* Media Gallery Strip (only if permissions allowed it) */}
            {permissionGranted && photos.length > 0 && (
              <GalleryStrip
                photos={photos}
                selectedPhoto={selectedPhoto}
                onSelectPhoto={(item) => void verifyPhoto(item)}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    zIndex: 999,
  },
  safeArea: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },
  globalCloseButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  previewContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
});
