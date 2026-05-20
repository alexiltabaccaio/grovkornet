import { useState } from 'react';
import { verifyGrovkornetAuthenticity } from '@grovkornet/engine';
import { logger } from '@shared/lib/logger';
import { GalleryItem } from './types';

export const useImageVerification = (
  setPhotos: React.Dispatch<React.SetStateAction<GalleryItem[]>>
) => {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const [verifying, setVerifying] = useState(false);

  const verifyPhoto = async (item: GalleryItem) => {
    logger.debug('Gallery', `verifyPhoto for: ${item.uri}`);
    setSelectedPhoto(item);
    if (item.isVerified !== undefined) {
      return;
    }

    setVerifying(true);
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
  };

  return {
    selectedPhoto,
    setSelectedPhoto,
    verifying,
    verifyPhoto,
  };
};
