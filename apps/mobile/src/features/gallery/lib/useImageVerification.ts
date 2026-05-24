import { useState, useRef, useEffect, useCallback } from 'react';
import { verifyGrovkornetAuthenticity } from '@grovkornet/engine';
import { logger } from '@shared/lib/logger';
import { GalleryItem } from './types';

export const useImageVerification = (
  photos: GalleryItem[],
  setPhotos: React.Dispatch<React.SetStateAction<GalleryItem[]>>
) => {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const [verifying, setVerifying] = useState(false);
  const verifyingQueue = useRef<Set<string>>(new Set());

  const verifyPhoto = useCallback(async (item: GalleryItem) => {
    logger.debug('Gallery', `verifyPhoto for: ${item.uri}`);
    setSelectedPhoto(item);
    if (item.isVerified !== undefined) {
      return;
    }

    setVerifying(true);
    verifyingQueue.current.add(item.uri);
    try {
      logger.debug('Gallery', 'Running real verifyGrovkornetAuthenticity with 5s timeout...');
      const verifyTimeout = new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error('VERIFY_TIMEOUT')), 5000)
      );

      const verified = await Promise.race([
        verifyGrovkornetAuthenticity(item.uri),
        verifyTimeout
      ]);

      logger.debug('Gallery', `Verification result: ${verified}`);
      setSelectedPhoto(prev => prev?.uri === item.uri ? { ...prev, isVerified: verified } : prev);
      setPhotos(prev => prev.map(p => p.uri === item.uri ? { ...p, isVerified: verified } : p));
    } catch (error) {
      logger.error('Gallery', 'Verification error or timeout', error);
      setSelectedPhoto(prev => prev?.uri === item.uri ? { ...prev, isVerified: false } : prev);
      setPhotos(prev => prev.map(p => p.uri === item.uri ? { ...p, isVerified: false } : p));
    } finally {
      setVerifying(false);
    }
  }, [setPhotos]);

  const photosArray = Array.isArray(photos) ? photos : [];
  const photosUris = photosArray.map(p => p.uri).join(',');

  // Background verification loop
  useEffect(() => {
    let active = true;

    const runBackgroundVerification = async () => {
      // Find all photos that haven't been verified and aren't currently verifying
      const toVerify = photosArray.filter(
        p => p.isVerified === undefined && !verifyingQueue.current.has(p.uri)
      );

      for (const item of toVerify) {
        if (!active) break;

        verifyingQueue.current.add(item.uri);
        try {
          logger.debug('Gallery', `Background verifying: ${item.uri}`);
          const verifyTimeout = new Promise<boolean>((_, reject) =>
            setTimeout(() => reject(new Error('VERIFY_TIMEOUT')), 5000)
          );

          const verified = await Promise.race([
            verifyGrovkornetAuthenticity(item.uri),
            verifyTimeout
          ]);

          setPhotos(prev => prev.map(p => p.uri === item.uri ? { ...p, isVerified: verified } : p));
          setSelectedPhoto(prev => prev?.uri === item.uri ? { ...prev, isVerified: verified } : prev);
        } catch (error) {
          logger.error('Gallery', `Background verification failed for ${item.uri}`, error);
          setPhotos(prev => prev.map(p => p.uri === item.uri ? { ...p, isVerified: false } : p));
          setSelectedPhoto(prev => prev?.uri === item.uri ? { ...prev, isVerified: false } : prev);
        }
      }
    };

    void runBackgroundVerification();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photosUris]);

  return {
    selectedPhoto,
    setSelectedPhoto,
    verifying,
    verifyPhoto,
  };
};
