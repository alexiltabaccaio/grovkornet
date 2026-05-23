import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@widgets/header';
import { ShareButton } from './ShareButton';
import { useGalleryPhotos } from '../lib/useGalleryPhotos';
import { useImageVerification } from '../lib/useImageVerification';
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
    if (!loading && photos.length > 0 && !selectedPhoto) {
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
  }, [loading, photos, initialUri, verifyPhoto, selectedPhoto]);

  return (
    <View style={styles.absoluteContainer}>
      <Header />
      <View style={styles.safeArea}>
        
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
              
              {/* Share Instagram Action */}
              {selectedPhoto && (
                <View style={styles.shareContainer}>
                  <ShareButton
                    id={selectedPhoto.id}
                    uri={selectedPhoto.uri}
                    isVerified={selectedPhoto.isVerified ?? false}
                  />
                </View>
              )}
            </View>

            {/* Media Gallery Strip */}
            <GalleryStrip
              photos={permissionGranted ? photos : []}
              selectedPhoto={selectedPhoto}
              onSelectPhoto={(item) => void verifyPhoto(item)}
              onClose={onClose}
            />
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
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 10,
  },
});
