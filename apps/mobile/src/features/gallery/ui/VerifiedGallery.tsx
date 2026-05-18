import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Image, Pressable, ActivityIndicator, SafeAreaView, Modal } from 'react-native';
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

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          setLoading(false);
          return;
        }
        setPermissionGranted(true);

        const album = await MediaLibrary.getAlbumAsync('Grovkornet');
        let media: MediaLibrary.Asset[] = [];

        if (album) {
          const result = await MediaLibrary.getAssetsAsync({
            album,
            first: 50,
            sortBy: [[MediaLibrary.SortBy.creationTime, false]],
            mediaType: MediaLibrary.MediaType.photo,
          });
          media = result.assets;
        } else {
          const result = await MediaLibrary.getAssetsAsync({
            first: 50,
            sortBy: [[MediaLibrary.SortBy.creationTime, false]],
            mediaType: MediaLibrary.MediaType.photo,
          });
          media = result.assets;
        }

        const items = media.map(asset => ({ id: asset.id, uri: asset.uri }));
        setPhotos(items);
        setLoading(false);

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
        console.error('Failed to load photos:', error);
        setLoading(false);
        if (initialUri) {
          void handleSelectPhoto({ id: 'initial', uri: initialUri });
        }
      }
    };

    void loadPhotos();
  }, [initialUri]);

  const handleSelectPhoto = async (item: GalleryItem) => {
    setSelectedPhoto(item);
    if (item.isVerified !== undefined) return;

    setVerifying(true);
    try {
      const verified = await verifyGrovkornetAuthenticity(item.uri);
      setSelectedPhoto(prev => prev?.uri === item.uri ? { ...prev, isVerified: verified } : prev);
      setPhotos(prev => prev.map(p => p.uri === item.uri ? { ...p, isVerified: verified } : p));
    } catch (error) {
      console.log('Verification error:', error);
      setSelectedPhoto(prev => prev?.uri === item.uri ? { ...prev, isVerified: false } : prev);
    } finally {
      setVerifying(false);
    }
  };

  if (!permissionGranted && !loading) {
    return (
      <Modal visible={true} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFF" />
            </Pressable>
          </View>
          <View style={styles.center}>
            <Text style={styles.title}>{t('gallery.permission_denied', 'Storage Permission Required')}</Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={true} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#FFF" />
          </Pressable>
          <Text style={styles.headerTitle}>{t('gallery.title', 'Grovkornet Gallery')}</Text>
          <View style={styles.placeholder} />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FF9500" />
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.previewContainer}>
              {selectedPhoto ? (
                <View style={styles.previewWrapper}>
                  <Image source={{ uri: selectedPhoto.uri }} style={styles.previewImage} resizeMethod="resize" />
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

            {selectedPhoto && (
              <View style={styles.shareContainer}>
                <ShareButton uri={selectedPhoto.uri} isVerified={selectedPhoto.isVerified ?? false} />
              </View>
            )}

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
                    <Image source={{ uri: item.uri }} style={styles.thumbnailImage} resizeMethod="resize" />
                    {item.isVerified === true && (
                      <View style={styles.miniBadge}>
                        <Ionicons name="checkmark-circle" size={12} color="#34C759" />
                      </View>
                    )}
                  </Pressable>
                )}
              />
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
