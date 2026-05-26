import { useEffect } from 'react';
import { useGalleryPhotos } from './useGalleryPhotos';
import { useImageVerification } from './useImageVerification';
import { GalleryItem } from './types';

/**
 * Hook di orchestrazione per GalleryViewer.
 * Combina il caricamento delle foto (useGalleryPhotos) con la
 * logica di verifica (useImageVerification) e gestisce la
 * selezione automatica della foto iniziale.
 *
 * Usato da GalleryViewer.tsx come unica fonte di verità per
 * lo stato della galleria, permettendo al componente di
 * concentrarsi solo sul layout.
 */
export const useGalleryViewer = (initialUri?: string | null) => {
  const { photos, setPhotos, loading, permissionGranted } = useGalleryPhotos(initialUri);
  const { selectedPhoto, verifyPhoto } = useImageVerification(photos, setPhotos);

  // Auto-seleziona la foto iniziale una volta completato il caricamento
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
   * Chiamata da PhotoPreview quando l'utente scorre a una nuova foto.
   * Avvia la verifica di autenticità solo se la foto non è già selezionata.
   */
  const onPhotoVisible = (photo: GalleryItem) => {
    if (selectedPhoto?.uri !== photo.uri) {
      void verifyPhoto(photo);
    }
  };

  /**
   * Chiamata da GalleryStrip quando si seleziona una miniatura.
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
