import { createZustandMMKVStorage } from './mmkv';

describe('createZustandMMKVStorage', () => {
  it('should store, retrieve, and remove values correctly', () => {
    const storage = createZustandMMKVStorage('test-store');

    // Test setItem e getItem
    storage.setItem('test-key', 'test-value');
    expect(storage.getItem('test-key')).toBe('test-value');

    // Test removeItem
    storage.removeItem('test-key');
    expect(storage.getItem('test-key')).toBeNull();
  });

  it('should return null for non-existent keys', () => {
    const storage = createZustandMMKVStorage('test-store');
    expect(storage.getItem('non-existent')).toBeNull();
  });
});
