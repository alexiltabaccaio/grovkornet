import { useEffect, useCallback } from 'react';
import { logger } from '@shared/lib/logger';
import { useGalleryPhotos } from './useGalleryPhotos';
import { useImageVerification } from './useImageVerification';
import { GalleryItem } from './types';
import { useVerificationStore } from '@entities/verification';

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
          // If the found photo has a different URI (e.g. file:/// vs content://),
          // migrate the verified status to avoid redundant heavy C++ checks.
          if (found.uri !== initialUri) {
            const { verifiedMap, setVerified } = useVerificationStore.getState();
            if (verifiedMap[initialUri] !== undefined) {
              logger.debug('useGalleryViewer', `Auto-select: migrating verified state from ${initialUri} to ${found.uri}`);
              setVerified(found.uri, verifiedMap[initialUri]);
            }
          }
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
    if (!initialUri) return;

    const isFinalUri = !(
      initialUri.startsWith('file:///data/') || 
      initialUri.includes('preview') ||
      initialUri.includes('temp')
    );

    if (isFinalUri) {
      const newPhotoItem: GalleryItem = {
        id: initialUri.split('/').pop() || 'processed',
        uri: initialUri,
        filename: initialUri.split('/').pop()
      };

      setPhotos(prevPhotos => {
        // Find if there is a temp preview in the list
        const tempIndex = prevPhotos.findIndex(p => 
          p.id === 'preview-temp' || 
          p.id === 'initial' || 
          p.uri.startsWith('file:///data/') || 
          p.uri.includes('preview')
        );

        if (tempIndex === -1) return prevPhotos;

        // Check if the final photo already exists in the rest of the list
        const alreadyExists = prevPhotos.some((p, idx) => 
          idx !== tempIndex && (
            p.id === newPhotoItem.id ||
            p.uri === newPhotoItem.uri ||
            (p.filename && newPhotoItem.filename && p.filename === newPhotoItem.filename)
          )
        );

        const updated = [...prevPhotos];
        if (alreadyExists) {
          logger.debug('useGalleryViewer', `Migration: removing temp preview since final photo already exists in list`);
          updated.splice(tempIndex, 1);
        } else {
          logger.debug('useGalleryViewer', `Migration: replacing temp preview with final photo`);
          newPhotoItem.fallbackUri = prevPhotos[tempIndex].uri;
          newPhotoItem.key = prevPhotos[tempIndex].key || prevPhotos[tempIndex].id;
          updated[tempIndex] = newPhotoItem;
        }
        return updated;
      });

      // Also migrate the selectedPhoto selection if it is currently pointing to a temp preview
      const isTempSelected = 
        selectedPhoto && (
          selectedPhoto.id === 'preview-temp' || 
          selectedPhoto.id === 'initial' || 
          selectedPhoto.uri.startsWith('file:///data/') || 
          selectedPhoto.uri.includes('preview')
        );

      if (isTempSelected && selectedPhoto.uri !== initialUri) {
        logger.debug('useGalleryViewer', `Migration: updating selection from temp preview to final URI: ${selectedPhoto.uri} -> ${initialUri}`);
        void verifyPhoto(newPhotoItem);
      }
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
          // Prevent verification flicker when switching from content:// (MediaStore) to file:/// (MediaLibrary)
          if (found.uri !== selectedPhoto.uri) {
            const { verifiedMap, setVerified } = useVerificationStore.getState();
            if (verifiedMap[selectedPhoto.uri] !== undefined) {
              logger.debug('useGalleryViewer', `Re-sync: migrating verified state from ${selectedPhoto.uri} to ${found.uri}`);
              setVerified(found.uri, verifiedMap[selectedPhoto.uri]);
            }
          }
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
  const onPhotoVisible = useCallback((photo: GalleryItem) => {
    if (selectedPhoto?.uri !== photo.uri && selectedPhoto?.id !== photo.id) {
      void verifyPhoto(photo);
    }
  }, [verifyPhoto, selectedPhoto]);

  /**
   * Called by GalleryStrip when a thumbnail is selected.
   */
  const onSelectPhoto = useCallback((photo: GalleryItem) => {
    void verifyPhoto(photo);
  }, [verifyPhoto]);

  return {
    photos,
    selectedPhoto,
    loading: loading || (photos.length > 0 && !selectedPhoto),
    onPhotoVisible,
    onSelectPhoto,
    permissionGranted,
  };
};
