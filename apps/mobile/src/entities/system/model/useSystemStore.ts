// ⚠️ AI WARNING: Before modifying this global state store, query the dependency graph: node packages/shared/scripts/graphrag/query.js <query>
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createZustandMMKVStorage } from '@shared/lib/storage/mmkv';
import { logger } from '@shared/lib/logger';
import { SystemStore } from './types';

export const useSystemStore = create<SystemStore>()(
  persist(
    (set) => ({
      // State
      isFpsOverlayEnabled: false,
      isLayoutOverlayEnabled: false,
      isLogsEnabled: __DEV__,

      // Actions
      setIsFpsOverlayEnabled: (enabled: boolean) => {
        set({ isFpsOverlayEnabled: enabled });
      },

      setIsLayoutOverlayEnabled: (enabled: boolean) => {
        set({ isLayoutOverlayEnabled: enabled });
      },

      setIsLogsEnabled: (enabled: boolean) => {
        logger.setDebugEnabled(enabled);
        set({ isLogsEnabled: enabled });
      },
    }),
    {
      name: 'grovkornet-system-storage',
      storage: createJSONStorage(() => createZustandMMKVStorage('system-storage')),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!__DEV__) {
            useSystemStore.getState().setIsLogsEnabled(false);
          } else {
            logger.setDebugEnabled(state.isLogsEnabled);
            logger.debug('SystemStore', 'Store rehydrated successfully', state);
          }
        } else {
          logger.error('SystemStore', 'Store rehydration failed or storage is empty');
        }
      },
      partialize: (state) => ({
        isLogsEnabled: state.isLogsEnabled,
      }),
    }
  )
);
