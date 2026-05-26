import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Platform } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Header } from '@widgets/header';
import { ShareButton } from './ShareButton';
import { useGalleryPhotos } from '../lib/useGalleryPhotos';
import { useImageVerification } from '../lib/useImageVerification';
import { PhotoPreview } from './components/PhotoPreview';
import { GalleryStrip } from './components/GalleryStrip';

interface GalleryViewerProps {
  onClose: () => void;
  initialUri?: string | null;
  galleryTransition?: SharedValue<number>;
}

export const GalleryViewer = ({ onClose, initialUri, galleryTransition }: GalleryViewerProps) => {
  const { t } = useTranslation();
  const { photos, setPhotos, loading, permissionGranted } = useGalleryPhotos(initialUri);
  const { selectedPhoto, verifying, verifyPhoto } = useImageVerification(photos, setPhotos);

  // Auto-select on photos loaded
  useEffect(() => {
    if (!loading && photos.length > 0 && !selectedPhoto) {
      if (initialUri) {
        const initialFilenameOrId = initialUri.split('/').pop();
        const found = photos.find(item => item.uri === initialUri || (initialFilenameOrId && (item.filename === initialFilenameOrId || item.id === initialFilenameOrId)));
        if (found) {
          void verifyPhoto(found);
        } else {
          void verifyPhoto({ id: 'initial', uri: initialUri, filename: initialFilenameOrId });
        }
      } else {
        void verifyPhoto(photos[0]);
      }
    }
  }, [loading, photos, initialUri, verifyPhoto, selectedPhoto]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    if (!galleryTransition) return {};
    return {
      opacity: galleryTransition.value,
    };
  });

  return (
    <Animated.View style={[styles.absoluteContainer, animatedContainerStyle]} pointerEvents="box-none">
      <View style={styles.topArea} pointerEvents="box-none">
        <Header />
      </View>
      <View style={styles.safeArea} pointerEvents="box-none">
        
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
              <PhotoPreview
                selectedPhoto={selectedPhoto}
                verifying={verifying}
                photos={permissionGranted ? photos : []}
                onSwipeLeft={() => {
                  if (!selectedPhoto || !permissionGranted) return;
                  const idx = photos.findIndex(p => p.uri === selectedPhoto.uri);
                  if (idx !== -1 && idx < photos.length - 1) {
                    void verifyPhoto(photos[idx + 1]);
                  }
                }}
                onSwipeRight={() => {
                  if (!selectedPhoto || !permissionGranted) return;
                  const idx = photos.findIndex(p => p.uri === selectedPhoto.uri);
                  if (idx > 0) {
                    void verifyPhoto(photos[idx - 1]);
                  }
                }}
              />
              
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
              onSelectPhoto={(photo) => { void verifyPhoto(photo); }}
              onClose={onClose}
              galleryTransition={galleryTransition}
            />
          </View>
        )}
      </View>

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  topArea: {
    backgroundColor: '#000',
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
    backgroundColor: '#000',
  },
  shareContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 10,
  },
});
