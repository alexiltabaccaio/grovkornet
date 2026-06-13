import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createZustandMMKVStorage } from '@shared/lib/storage/mmkv';
import { logger } from '@shared/lib/logger';

export interface GalleryState {
  isOpen: boolean;
  latestPreviewUri: string | null;
  latestCapturedUri: string | null;
}

export interface GalleryActions {
  setIsOpen: (isOpen: boolean) => void;
  setLatestPreviewUri: (uri: string | null) => void;
  setLatestCapturedUri: (uri: string | null) => void;
}

export interface GalleryStore extends GalleryState, GalleryActions {}

export const useGalleryStore = create<GalleryStore>()(
  persist(
    (set) => ({
      // State
      isOpen: false,
      latestPreviewUri: null,
      latestCapturedUri: null,

      // Actions
      setIsOpen: (isOpen) => {
        set({ isOpen });
      },
      setLatestPreviewUri: (uri) => {
        set({ latestPreviewUri: uri });
      },
      setLatestCapturedUri: (uri) => {
        set({ latestCapturedUri: uri, latestPreviewUri: null });
      },
    }),
    {
      name: 'grovkornet-gallery-storage',
      storage: createJSONStorage(() => createZustandMMKVStorage('gallery-storage')),
      onRehydrateStorage: () => (state) => {
        if (state) {
          logger.debug('GalleryStore', 'Store rehydrated successfully', state);
        } else {
          logger.error('GalleryStore', 'Store rehydration failed or storage is empty');
        }
      },
      partialize: (state) => ({
        latestCapturedUri: state.latestCapturedUri,
      }),
    }
  )
);
