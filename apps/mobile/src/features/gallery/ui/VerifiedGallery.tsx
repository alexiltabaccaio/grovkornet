import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Image, Pressable, ActivityIndicator, SafeAreaView } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { verifyGrovkornetAuthenticity } from '@grovkornet/engine';
import { ShareButton } from '../../camera-controls/ui/ShareButton';

interface VerifiedGalleryProps {
  onClose: () => void;
  initialUri?: string | null;
}

interface GalleryItem {
  id: string;
  uri: string;
  isVerified?: boolean;
}

export const VerifiedGallery = ({ onClose, initialUri }: VerifiedGalleryProps) => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Load photos from MediaLibrary safely
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        console.log('[Gallery] Checking MediaLibrary permissions...');
        const checkPerms = async () => {
          const current = await MediaLibrary.getPermissionsAsync();
          if (current.granted) return 'granted';
          if (current.canAskAgain) {
            const req = await MediaLibrary.requestPermissionsAsync();
            return req.status;
          }
          return current.status;
        };

        // Fallback timeout just in case it hangs natively
        const permTimeout = new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error('PERM_TIMEOUT')), 15000)
        );

        let status = 'denied';
        try {
          status = await Promise.race([checkPerms(), permTimeout]);
        } catch (e) {
          console.warn('[Gallery] Permissions timeout or error:', e);
        }

        if (status !== 'granted') {
          console.warn('[Gallery] MediaLibrary permissions not granted or timed out');
          setPermissionGranted(false);
          setLoading(false);
          // Fallback: show the captured photo only
          if (initialUri) {
            void handleSelectPhoto({ id: 'initial', uri: initialUri });
          }
          return;
        }

        setPermissionGranted(true);

        console.log('[Gallery] Fetching Grovkornet album with timeout...');
        const albumTimeout = new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('ALBUM_TIMEOUT')), 2500)
        );
        const album = await Promise.race([
          MediaLibrary.getAlbumAsync('Grovkornet'),
          albumTimeout
        ]) as any;

        let media: MediaLibrary.Asset[] = [];
        const assetsTimeout = new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('ASSETS_TIMEOUT')), 3000)
        );

        if (album) {
          const result = await Promise.race([
            MediaLibrary.getAssetsAsync({
              album,
              first: 50,
              sortBy: [[MediaLibrary.SortBy.creationTime, false]],
              mediaType: MediaLibrary.MediaType.photo,
            }),
            assetsTimeout
          ]) as any;
          media = result.assets;
        } else {
          const result = await Promise.race([
            MediaLibrary.getAssetsAsync({
              first: 50,
              sortBy: [[MediaLibrary.SortBy.creationTime, false]],
              mediaType: MediaLibrary.MediaType.photo,
            }),
            assetsTimeout
          ]) as any;
          media = result.assets;
        }

        const items: GalleryItem[] = media.map(asset => ({ id: asset.id, uri: asset.uri }));

        // Insert initialUri (low-res preview or recently captured photo) if not already indexed
        if (initialUri && !items.find(item => item.uri === initialUri)) {
          items.unshift({ id: 'preview-temp', uri: initialUri });
        }

        setPhotos(items);
        setLoading(false);

        // Select the initialUri if provided, otherwise the first photo
        if (initialUri) {
          const found = items.find(item => item.uri === initialUri);
          if (found) {
            void handleSelectPhoto(found);
          } else {
            void handleSelectPhoto({ id: 'initial', uri: initialUri });
          }
        } else if (items.length > 0) {
          void handleSelectPhoto(items[0]);
        }
      } catch (error) {
        console.error('[Gallery] Failed to load photos (graceful fallback):', error);
        setLoading(false);
        setPermissionGranted(false);
        if (initialUri) {
          void handleSelectPhoto({ id: 'initial', uri: initialUri });
        }
      }
    };

    void loadPhotos();
  }, [initialUri]);

  // Handle image verification using the native call
  const handleSelectPhoto = async (item: GalleryItem) => {
    console.log('[Gallery] handleSelectPhoto for:', item.uri);
    setSelectedPhoto(item);
    if (item.isVerified !== undefined) {
      return;
    }

    setVerifying(true);
    try {
      console.log('[Gallery] Running real verifyGrovkornetAuthenticity with 5s timeout...');
      const verifyTimeout = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('VERIFY_TIMEOUT')), 5000)
      );

      const verified = await Promise.race([
        verifyGrovkornetAuthenticity(item.uri),
        verifyTimeout
      ]);

      console.log('[Gallery] Verification result:', verified);
      setSelectedPhoto(prev => prev?.uri === item.uri ? { ...prev, isVerified: verified } : prev);
      setPhotos(prev => prev.map(p => p.uri === item.uri ? { ...p, isVerified: verified } : p));
    } catch (error) {
      console.error('[Gallery] Verification error or timeout:', error);
      setSelectedPhoto(prev => prev?.uri === item.uri ? { ...prev, isVerified: false } : prev);
      setPhotos(prev => prev.map(p => p.uri === item.uri ? { ...p, isVerified: false } : p));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <View style={styles.absoluteContainer}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#FFF" />
          </Pressable>
          <Text style={styles.headerTitle}>{t('gallery.title', 'Grovkornet Gallery')}</Text>
          <View style={styles.placeholder} />
        </View>

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
              {selectedPhoto ? (
                <View style={styles.previewWrapper}>
                  <Image source={{ uri: selectedPhoto.uri }} style={styles.previewImage} />
                  
                  {/* Close Button on top right of the image */}
                  <Pressable onPress={onClose} style={styles.imageCloseButton}>
                    <Ionicons name="close" size={24} color="#FFF" />
                  </Pressable>

                  {/* Authenticity Badge */}
                  {verifying ? (
                    <View style={styles.badgeContainer}>
                      <ActivityIndicator size="small" color="#FF9500" />
                      <Text style={styles.badgeText}>{t('gallery.verifying', 'Verifying...')}</Text>
                    </View>
                  ) : selectedPhoto.isVerified ? (
                    <View style={[styles.badgeContainer, styles.badgeVerified]}>
                      <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                      <Text style={[styles.badgeText, styles.badgeTextVerified]}>
                        {t('gallery.verified', 'Verified Original')}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.badgeContainer, styles.badgeUnverified]}>
                      <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                      <Text style={[styles.badgeText, styles.badgeTextUnverified]}>
                        {t('gallery.unverified', 'Unverified')}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.center}>
                  <Text style={styles.title}>{t('gallery.no_photos', 'No photos found')}</Text>
                </View>
              )}
            </View>

            {/* Share Instagram Action */}
            {selectedPhoto && (
              <View style={styles.shareContainer}>
                <ShareButton uri={selectedPhoto.uri} isVerified={selectedPhoto.isVerified ?? false} />
              </View>
            )}

            {/* Media Gallery Strip (only if permissions allowed it) */}
            {permissionGranted && photos.length > 0 && (
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
                      onPress={() => void handleSelectPhoto(item)}
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
            )}
            
          </View>
        )}
      </SafeAreaView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 36,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#666',
    fontSize: 16,
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
  badgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  imageCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  badgeVerified: {
    borderColor: 'rgba(52, 199, 89, 0.5)',
    backgroundColor: 'rgba(20, 40, 20, 0.85)',
  },
  badgeUnverified: {
    borderColor: 'rgba(255, 59, 48, 0.5)',
    backgroundColor: 'rgba(40, 20, 20, 0.85)',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  badgeTextVerified: {
    color: '#34C759',
  },
  badgeTextUnverified: {
    color: '#FF3B30',
  },
  shareContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
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
