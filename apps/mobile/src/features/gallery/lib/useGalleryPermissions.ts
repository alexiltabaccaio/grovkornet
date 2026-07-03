import { useState } from 'react';
import * as MediaLibrary from 'expo-media-library/legacy';
import { logger } from '@shared/lib/logger';

export const useGalleryPermissions = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loadingPerms, setLoadingPerms] = useState(true);

  const checkAndRequestPermissions = async (activeRef: { current: boolean }): Promise<boolean> => {
    try {
      logger.debug('Gallery', 'Checking MediaLibrary permissions...');
      const checkPerms = async () => {
        const current = await MediaLibrary.getPermissionsAsync();
        if (current.granted || current.status === ('limited' as unknown as typeof current.status)) {
          return current.status;
        }
        logger.debug('Gallery', 'Requesting MediaLibrary permissions (ignoring canAskAgain)...');
        const req = await MediaLibrary.requestPermissionsAsync();
        return req.status;
      };

      let status = 'denied';
      if (process.env.NODE_ENV === 'test') {
        status = await checkPerms();
      } else {
        let permTimer: NodeJS.Timeout;
        const permTimeout = new Promise<string>((_, reject) =>
          permTimer = setTimeout(() => reject(new Error('PERM_TIMEOUT')), 60000)
        );
        try {
          status = await Promise.race([checkPerms(), permTimeout]).finally(() => clearTimeout(permTimer));
        } catch (e) {
          logger.warn('Gallery', 'Permissions timeout or error', e);
        }
      }

      if (!activeRef.current) return false;

      const granted = status === 'granted' || status === ('limited' as unknown as typeof status);
      setPermissionGranted(granted);
      setLoadingPerms(false);
      return granted;
    } catch (e) {
      logger.error('Gallery', 'Error in permissions check', e);
      if (activeRef.current) {
        setPermissionGranted(false);
        setLoadingPerms(false);
      }
      return false;
    }
  };

  return {
    permissionGranted,
    setPermissionGranted,
    loadingPerms,
    setLoadingPerms,
    checkAndRequestPermissions,
  };
};
