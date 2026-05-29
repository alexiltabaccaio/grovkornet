import { useEffect } from 'react';
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
    if (!loading && photos.length > 0 && !selectedPhoto) {
      if (initialUri) {
        const initialFilenameOrId = initialUri.split('/').pop();
        const found = photos.find(
          item =>
            item.uri === initialUri ||
            (initialFilenameOrId &&
              (item.filename === initialFilenameOrId || item.id === initialFilenameOrId))
        );
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
    loading,
    onPhotoVisible,
    onSelectPhoto,
  };
};
