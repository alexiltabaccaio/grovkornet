import { useState, useCallback } from 'react';
import { verifyGrovkornetAuthenticity } from '@grovkornet/engine';
import { logger } from '@shared/lib/logger';
import { useVerificationStore } from '@entities/verification';
import { GalleryItem } from './types';

// Module-level singleton queue to prevent duplicate verification work
const verifyingQueue = new Set<string>();

export const useImageVerification = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const [verifying, setVerifying] = useState(false);

  const verifyPhoto = useCallback(async (item: GalleryItem) => {
    logger.debug('Gallery', `verifyPhoto for: ${item.uri}`);
    setSelectedPhoto(item);

    const verifiedMap = useVerificationStore.getState().verifiedMap;
    if (verifiedMap[item.uri] !== undefined || verifyingQueue.has(item.uri)) {
      return;
    }

    setVerifying(true);
    verifyingQueue.add(item.uri);
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
      useVerificationStore.getState().setVerified(item.uri, verified);
    } catch (error) {
      logger.error('Gallery', `Verification error or timeout for ${item.uri}`, error);
      useVerificationStore.getState().setVerified(item.uri, false);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      verifyingQueue.delete(item.uri);
      setVerifying(false);
    }
  }, []);

  const verifyPhotosBatch = useCallback(async (uris: string[]) => {
    const verifiedMap = useVerificationStore.getState().verifiedMap;
    // Filter out URIs that are already verified or currently in the queue
    const toVerify = uris.filter(
      (uri) => verifiedMap[uri] === undefined && !verifyingQueue.has(uri)
    );

    if (toVerify.length === 0) {
      return;
    }

    logger.debug('Gallery', `Starting batch verification for ${toVerify.length} photos`);

    // Add all to queue immediately to prevent other calls from verifying them
    toVerify.forEach((uri) => verifyingQueue.add(uri));

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

            useVerificationStore.getState().setVerified(uri, verified);
          } catch (error) {
            logger.error('Gallery', `Background verification failed for ${uri}`, error);
            useVerificationStore.getState().setVerified(uri, false);
          } finally {
            if (timeoutId) clearTimeout(timeoutId);
            verifyingQueue.delete(uri);
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
