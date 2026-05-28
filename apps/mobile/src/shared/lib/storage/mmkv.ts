import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

export function createZustandMMKVStorage(id: string): StateStorage {
  const storage = createMMKV({ id });

  return {
    setItem: (name, value) => {
      storage.set(name, value);
    },
    getItem: (name) => {
      return storage.getString(name) ?? null;
    },
    removeItem: (name) => {
      storage.remove(name);
    },
  };
}
