import { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { logger } from '@shared/lib/logger';
import { GalleryItem } from './types';
import { useGalleryPermissions } from './useGalleryPermissions';
import { useGalleryFetch } from './useGalleryFetch';

const isFinalProcessedUri = (uri: string) => {
  if (!uri.startsWith('file://')) return true; // content:// is final
  return (
    uri.startsWith('file:///storage/') ||
    uri.includes('/storage/emulated/') ||
    uri.includes('DCIM/') ||
    uri.includes('Grovkornet/')
  );
};

const isTempUri = (uri: string) => {
  return (
    uri.startsWith('file:///data/') ||
    uri.includes('preview') ||
    uri.includes('temp')
  );
};

export const useGalleryPhotos = (initialUri?: string | null) => {
  const [photos, setPhotos] = useState<GalleryItem[]>(() => {
    if (initialUri) {
      const initialFilenameOrId = initialUri.split('/').pop();
      const isTemp = isTempUri(initialUri);
      const id = isTemp ? 'preview-temp' : (initialUri.split('/').pop() || 'initial');
      return [{ id, key: id, uri: initialUri, filename: initialFilenameOrId }];
    }
    return [];
  });
  const [loading, setLoading] = useState(true);

  const {
    permissionGranted,
    setPermissionGranted,
    checkAndRequestPermissions,
  } = useGalleryPermissions();

  const { fetchPhotos } = useGalleryFetch();

  const initialUriRef = useRef(initialUri);
  const lastEvaluatedUriRef = useRef<string | null | undefined>(initialUri);
  useEffect(() => {
    initialUriRef.current = initialUri;
  }, [initialUri]);

  useEffect(() => {
    const activeRef = { current: true };
    const currentInitialUri = initialUriRef.current;
    logger.debug('useGalleryPhotos', `Effect started: initialUri=${currentInitialUri}`);

    const loadPhotos = async () => {
      const currentInitialUriLocal = initialUriRef.current;
      logger.debug('useGalleryPhotos', `loadPhotos started: initialUri=${currentInitialUriLocal}`);
      try {
        const granted = await checkAndRequestPermissions(activeRef);

        if (!activeRef.current) {
          logger.debug('useGalleryPhotos', `loadPhotos: active became false during permission check`);
          return;
        }

        if (!granted) {
          logger.warn('Gallery', 'MediaLibrary permission denied');
          setLoading(false);
          setPermissionGranted(false);
          if (currentInitialUriLocal) {
            const isProcessed = isFinalProcessedUri(currentInitialUriLocal);
            if (isProcessed) {
              setPhotos([{ id: 'initial', uri: currentInitialUriLocal }]);
            } else {
              try {
                const info = await FileSystem.getInfoAsync(currentInitialUriLocal);
                if (info.exists) {
                  setPhotos([{ id: 'initial', uri: currentInitialUriLocal }]);
                } else {
                  setPhotos([]);
                }
              } catch {
                setPhotos([]);
              }
            }
          } else {
            setPhotos([]);
          }
          return;
        }

        setPermissionGranted(true);
        const fetchedItems = await fetchPhotos(activeRef);

        if (!activeRef.current) {
          logger.debug('useGalleryPhotos', `loadPhotos: active became false during photo fetching`);
          return;
        }

        const items = [...fetchedItems];

        if (currentInitialUriLocal) {
          const initialFilenameOrId = currentInitialUriLocal.split('/').pop();
          const alreadyExists = items.some(item =>
            item.uri === currentInitialUriLocal ||
            (initialFilenameOrId && (item.filename === initialFilenameOrId || item.id === initialFilenameOrId))
          );

          logger.debug('useGalleryPhotos', `loadPhotos check: initialUri=${currentInitialUriLocal}, alreadyExists=${alreadyExists}`);
          if (!alreadyExists) {
            try {
              const info = await FileSystem.getInfoAsync(currentInitialUriLocal);
              if (info.exists) {
                const isProcessed = isFinalProcessedUri(currentInitialUriLocal);
                if (isProcessed) {
                  logger.debug('useGalleryPhotos', `loadPhotos: unshifting final processed photo directly: ${currentInitialUriLocal}`);
                  const id = currentInitialUriLocal.split('/').pop() || 'initial';
                  items.unshift({ id, key: id, uri: currentInitialUriLocal, filename: initialFilenameOrId });
                } else {
                  logger.debug('useGalleryPhotos', `loadPhotos: unshifting temp preview: ${currentInitialUriLocal}`);
                  items.unshift({ id: 'preview-temp', key: 'preview-temp', uri: currentInitialUriLocal, filename: initialFilenameOrId });
                }
              } else {
                logger.debug('useGalleryPhotos', `loadPhotos: photo ${currentInitialUriLocal} does not exist on disk, skipping.`);
              }
            } catch (e) {
              logger.warn('useGalleryPhotos', `Failed to check existence of photo: ${currentInitialUriLocal}`, e);
            }
          }
        }

        // Deduplicate items by ID to prevent React "Encountered two children with the same key" crashes
        const uniqueItems: GalleryItem[] = [];
        const seenIds = new Set<string>();
        for (const item of items) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            uniqueItems.push(item);
          }
        }

        logger.debug('useGalleryPhotos', `loadPhotos complete: setting ${uniqueItems.length} photos`);
        setPhotos(uniqueItems);
        setLoading(false);
      } catch (error) {
        logger.error('Gallery', 'Failed to load photos (graceful fallback)', error);
        if (activeRef.current) {
          setLoading(false);
          setPermissionGranted(false);
          if (currentInitialUriLocal) {
            const isProcessed = isFinalProcessedUri(currentInitialUriLocal);
            if (isProcessed) {
              setPhotos([{ id: 'initial', uri: currentInitialUriLocal }]);
            } else {
              try {
                const info = await FileSystem.getInfoAsync(currentInitialUriLocal);
                if (info.exists) {
                  setPhotos([{ id: 'initial', uri: currentInitialUriLocal }]);
                } else {
                  setPhotos([]);
                }
              } catch {
                setPhotos([]);
              }
            }
          }
        }
      }
    };

    void loadPhotos();

    let rafId: number;
    const subscription = AppState.addEventListener('change', nextAppState => {
      logger.debug('useGalleryPhotos', `AppState change: status=${nextAppState}, active=${activeRef.current}`);
      if (nextAppState === 'active' && activeRef.current) {
        rafId = requestAnimationFrame(() => {
          void loadPhotos();
        });
      }
    });

    return () => {
      logger.debug('useGalleryPhotos', `Effect cleanup running for initialUri=${initialUriRef.current}`);
      activeRef.current = false;
      subscription.remove();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Dynamically inject initialUri if it updates AFTER initial load and is missing from the list.
  useEffect(() => {
    if (loading || !initialUri) return;
    if (initialUri === lastEvaluatedUriRef.current) return;

    lastEvaluatedUriRef.current = initialUri;

    const activeRef = { current: true };
    const injectInitialUri = async () => {
      try {
        const initialFilenameOrId = initialUri.split('/').pop();
        const isProcessed = isFinalProcessedUri(initialUri);
        const isTemp = isTempUri(initialUri);

        let shouldInject = false;
        try {
          const info = await FileSystem.getInfoAsync(initialUri);
          if (info.exists) {
            shouldInject = true;
          } else {
            logger.debug('useGalleryPhotos', `Dynamically injecting missing initialUri: ${initialUri} failed, file does not exist.`);
          }
        } catch (e) {
          logger.warn('useGalleryPhotos', `Failed to check existence of injected photo: ${initialUri}`, e);
          // Fallback: if it's a processed URI or content://, try to inject it anyway if we cannot verify it
          if (isProcessed || !initialUri.startsWith('file://')) {
             shouldInject = true;
          }
        }

        if (!activeRef.current || !shouldInject) return;

        setPhotos(prev => {
          const alreadyExists = prev.some(item =>
            item.uri === initialUri ||
            (initialFilenameOrId && (item.filename === initialFilenameOrId || item.id === initialFilenameOrId))
          );

          if (alreadyExists) return prev;

          logger.debug('useGalleryPhotos', `Dynamically injecting missing initialUri: ${initialUri}`);
          const id = isTemp ? 'preview-temp' : (initialUri.split('/').pop() || 'injected');
          return [{ id, key: id, uri: initialUri, filename: initialFilenameOrId }, ...prev];
        });
      } catch (e) {
        logger.warn('useGalleryPhotos', 'Failed to inject missing initialUri', e);
      }
    };

    void injectInitialUri();

    return () => {
      activeRef.current = false;
    };
  }, [initialUri, loading]);

  return {
    photos,
    setPhotos,
    loading,
    permissionGranted,
  };
};
