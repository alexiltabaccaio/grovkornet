import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createZustandMMKVStorage } from '@shared/lib/storage/mmkv';

interface VerificationState {
  verifiedMap: Record<string, boolean>; // key: URI, value: isVerified
  verifyingUris: Record<string, boolean>; // key: URI, value: isVerifying
  setVerified: (uri: string, isVerified: boolean) => void;
  setVerifiedBatch: (results: Record<string, boolean>) => void;
  setVerifying: (uri: string, isVerifying: boolean) => void;
  setVerifyingBatch: (uris: string[], isVerifying: boolean) => void;
  clearCache: () => void;
}

export const useVerificationStore = create<VerificationState>()(
  persist(
    (set) => ({
      verifiedMap: {},
      verifyingUris: {},
      setVerified: (uri, isVerified) =>
        set((state) => ({
          verifiedMap: { ...state.verifiedMap, [uri]: isVerified },
        })),
      setVerifiedBatch: (results) =>
        set((state) => ({
          verifiedMap: { ...state.verifiedMap, ...results },
        })),
      setVerifying: (uri, isVerifying) =>
        set((state) => ({
          verifyingUris: { ...state.verifyingUris, [uri]: isVerifying },
        })),
      setVerifyingBatch: (uris, isVerifying) =>
        set((state) => {
          const nextVerifying = { ...state.verifyingUris };
          uris.forEach((uri) => {
            nextVerifying[uri] = isVerifying;
          });
          return { verifyingUris: nextVerifying };
        }),
      clearCache: () => set({ verifiedMap: {}, verifyingUris: {} }),
    }),
    {
      name: 'grovkornet-verification-storage',
      storage: createJSONStorage(() => createZustandMMKVStorage('verification-storage')),
      partialize: (state) => ({
        verifiedMap: state.verifiedMap,
      }),
    }
  )
);
