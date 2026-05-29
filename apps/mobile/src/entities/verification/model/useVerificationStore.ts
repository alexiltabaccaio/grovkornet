import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createZustandMMKVStorage } from '@shared/lib/storage/mmkv';

interface VerificationState {
  verifiedMap: Record<string, boolean>; // key: URI, value: isVerified
  setVerified: (uri: string, isVerified: boolean) => void;
  setVerifiedBatch: (results: Record<string, boolean>) => void;
  clearCache: () => void;
}

export const useVerificationStore = create<VerificationState>()(
  persist(
    (set) => ({
      verifiedMap: {},
      setVerified: (uri, isVerified) =>
        set((state) => ({
          verifiedMap: { ...state.verifiedMap, [uri]: isVerified },
        })),
      setVerifiedBatch: (results) =>
        set((state) => ({
          verifiedMap: { ...state.verifiedMap, ...results },
        })),
      clearCache: () => set({ verifiedMap: {} }),
    }),
    {
      name: 'grovkornet-verification-storage',
      storage: createJSONStorage(() => createZustandMMKVStorage('verification-storage')),
    }
  )
);
