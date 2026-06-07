import { useEffect } from 'react';
import { logger } from '@shared/lib/logger';
import { useGalleryPhotos } from './useGalleryPhotos';
import { useImageVerification } from './useImageVerification';
import { GalleryItem } from './types';

/**
 * Orchestration hook for GalleryViewer.
 * Combines photo loading (useGalleryPhotos) with image
 * verification logic (useImageVerification) and handles
 * automatic selection of the initial photo.
 *
 * Used by GalleryViewer.tsx as the single source of truth for
 * gallery state, allowing the component to focus solely on layout.
 */
export const useGalleryViewer = (initialUri?: string | null) => {
  const { photos, setPhotos, loading, permissionGranted } = useGalleryPhotos(initialUri);
  const { selectedPhoto, verifyPhoto } = useImageVerification();

  // Auto-select the initial photo once loading is complete
  useEffect(() => {
    logger.debug('useGalleryViewer', `Auto-select effect: loading=${loading}, photosCount=${photos.length}, selectedPhoto=${selectedPhoto?.uri}, initialUri=${initialUri}`);
    if (!loading && photos.length > 0 && !selectedPhoto) {
      if (initialUri) {
        const initialFilenameOrId = initialUri.split('/').pop();
        const found = photos.find(
          item =>
            item.uri === initialUri ||
            (initialFilenameOrId &&
              (item.filename === initialFilenameOrId || item.id === initialFilenameOrId))
        );
        logger.debug('useGalleryViewer', `Auto-select: initialUri=${initialUri}, found=${found?.uri}`);
        if (found) {
          void verifyPhoto(found);
        } else {
          logger.debug('useGalleryViewer', `Auto-select: initialUri not found in list, selecting temp fallback`);
          void verifyPhoto({ id: 'initial', uri: initialUri, filename: initialFilenameOrId });
        }
      } else {
        logger.debug('useGalleryViewer', `Auto-select: selecting first photo ${photos[0].uri}`);
        void verifyPhoto(photos[0]);
      }
    }
  }, [loading, photos, initialUri, verifyPhoto, selectedPhoto]);

  // Synchronously migrate selection and photos array when initialUri updates from preview to processed
  useEffect(() => {
    const isTempSelected = 
      selectedPhoto && (
        selectedPhoto.id === 'preview-temp' || 
        selectedPhoto.id === 'initial' || 
        selectedPhoto.uri.startsWith('file:///data/') || 
        selectedPhoto.uri.includes('preview')
      );

    if (initialUri && isTempSelected && selectedPhoto.uri !== initialUri) {
      logger.debug('useGalleryViewer', `Synchronous migration of temp preview to final capture: ${selectedPhoto.uri} -> ${initialUri}`);
      
      const newPhotoItem: GalleryItem = {
        id: initialUri.split('/').pop() || 'processed',
        uri: initialUri,
        filename: initialUri.split('/').pop()
      };
      
      // Update photos list in state immediately to replace the temp preview
      setPhotos(prevPhotos => {
        const index = prevPhotos.findIndex(p => p.uri === selectedPhoto.uri);
        if (index !== -1) {
          const updated = [...prevPhotos];
          updated[index] = newPhotoItem;
          return updated;
        }
        return prevPhotos;
      });
      
      // Update selected photo selection immediately
      void verifyPhoto(newPhotoItem);
    }
  }, [initialUri, selectedPhoto, verifyPhoto, setPhotos]);

  // Re-sync selection if the currently selected photo is replaced by its processed version
  useEffect(() => {
    logger.debug('useGalleryViewer', `Re-sync effect: selectedPhoto=${selectedPhoto?.uri}, photosCount=${photos.length}`);
    if (selectedPhoto && photos.length > 0) {
      const isExactMatch = photos.some(p => p.id === selectedPhoto.id && p.uri === selectedPhoto.uri);
      logger.debug('useGalleryViewer', `Re-sync check: isExactMatch=${isExactMatch}`);
      
      if (!isExactMatch) {
        const selectedFilenameOrId = selectedPhoto.filename || selectedPhoto.uri.split('/').pop();
        const found = photos.find(
          item =>
            item.uri === selectedPhoto.uri ||
            (selectedFilenameOrId &&
              (item.filename === selectedFilenameOrId || item.id === selectedFilenameOrId)) ||
            (initialUri && item.uri === initialUri)
        );
        logger.debug('useGalleryViewer', `Re-sync: searching selectedPhoto uri/filename/initialUri, found=${found?.uri}`);
        if (found) {
          void verifyPhoto(found);
        } else {
          logger.debug('useGalleryViewer', `Re-sync: selectedPhoto not found in photos! selection might be lost.`);
        }
      }
    }
  }, [photos, selectedPhoto, verifyPhoto, initialUri]);

  /**
   * Called by PhotoPreview when the user swipes/scrolls to a new photo.
   * Initiates authenticity verification only if the photo is not already selected.
   */
  const onPhotoVisible = (photo: GalleryItem) => {
    if (selectedPhoto?.uri !== photo.uri) {
      void verifyPhoto(photo);
    }
  };

  /**
   * Called by GalleryStrip when a thumbnail is selected.
   */
  const onSelectPhoto = (photo: GalleryItem) => {
    void verifyPhoto(photo);
  };

  return {
    photos: permissionGranted ? photos : [],
    selectedPhoto,
    loading: loading || (photos.length > 0 && !selectedPhoto),
    onPhotoVisible,
    onSelectPhoto,
  };
};
