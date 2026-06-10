import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { logger } from '@shared/lib/logger';

export const useCameraPermissions = () => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setHasPermission(true);
      }
    };
    requestPermission().catch(error => {
      logger.error('CameraScreen', 'Camera permission error', error);
    });
  }, []);

  return { hasPermission };
};
