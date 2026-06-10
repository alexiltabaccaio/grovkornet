import { useState, useCallback } from 'react';
import { verifyGrovkornetAuthenticity } from '@grovkornet/engine';
import { logger } from '@shared/lib/logger';
import { useVerificationStore } from '@entities/verification';
import { GalleryItem } from './types';

export const useImageVerification = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const verifyingUris = useVerificationStore((state) => state.verifyingUris || {});
  const verifying = selectedPhoto ? !!verifyingUris[selectedPhoto.uri] : false;

  const verifyPhoto = useCallback(async (item: GalleryItem) => {
    logger.debug('Gallery', `verifyPhoto for: ${item.uri}`);
    setSelectedPhoto(item);

    const { verifiedMap, verifyingUris: activeVerifying, setVerifying, setVerified } = useVerificationStore.getState();
    if (verifiedMap[item.uri] !== undefined || activeVerifying[item.uri]) {
      return;
    }

    setVerifying(item.uri, true);
    let timeoutId: NodeJS.Timeout | undefined;
    try {
      logger.debug('Gallery', `Running verifyGrovkornetAuthenticity for selected photo: ${item.uri}`);
      const verifyTimeout = new Promise<boolean>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('VERIFY_TIMEOUT')), 5000);
      });

      const verified = await Promise.race([
        verifyGrovkornetAuthenticity(item.uri),
        verifyTimeout
      ]);

      logger.debug('Gallery', `Verification result for ${item.uri}: ${verified}`);
      setVerified(item.uri, verified);
    } catch (error) {
      logger.error('Gallery', `Verification error or timeout for ${item.uri}`, error);
      setVerified(item.uri, false);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setVerifying(item.uri, false);
    }
  }, []);

  const verifyPhotosBatch = useCallback(async (uris: string[]) => {
    const { verifiedMap, verifyingUris: activeVerifying, setVerifying, setVerifyingBatch, setVerified } = useVerificationStore.getState();
    // Filter out URIs that are already verified or currently verifying
    const toVerify = uris.filter(
      (uri) => verifiedMap[uri] === undefined && !activeVerifying[uri]
    );

    if (toVerify.length === 0) {
      return;
    }

    logger.debug('Gallery', `Starting batch verification for ${toVerify.length} photos`);

    // Set all to verifying immediately to prevent other calls from verifying them
    setVerifyingBatch(toVerify, true);

    const chunkSize = 3;
    for (let i = 0; i < toVerify.length; i += chunkSize) {
      const chunk = toVerify.slice(i, i + chunkSize);

      await Promise.all(
        chunk.map(async (uri) => {
          let timeoutId: NodeJS.Timeout | undefined;
          try {
            logger.debug('Gallery', `Background verifying: ${uri}`);
            const verifyTimeout = new Promise<boolean>((_, reject) => {
              timeoutId = setTimeout(() => reject(new Error('VERIFY_TIMEOUT')), 5000);
            });

            const verified = await Promise.race([
              verifyGrovkornetAuthenticity(uri),
              verifyTimeout
            ]);

            setVerified(uri, verified);
          } catch (error) {
            logger.error('Gallery', `Background verification failed for ${uri}`, error);
            setVerified(uri, false);
          } finally {
            if (timeoutId) clearTimeout(timeoutId);
            setVerifying(uri, false);
          }
        })
      );
    }
  }, []);

  return {
    selectedPhoto,
    setSelectedPhoto,
    verifying,
    verifyPhoto,
    verifyPhotosBatch,
  };
};
