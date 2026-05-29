import { useVerificationStore } from './useVerificationStore';

describe('useVerificationStore', () => {
  beforeEach(() => {
    // Reset store state
    useVerificationStore.setState({
      verifiedMap: {},
    });
  });

  it('initializes with default empty map', () => {
    const state = useVerificationStore.getState();
    expect(state.verifiedMap).toEqual({});
  });

  it('updates verifiedMap correctly with setVerified', () => {
    useVerificationStore.getState().setVerified('file:///test/1.jpg', true);
    expect(useVerificationStore.getState().verifiedMap['file:///test/1.jpg']).toBe(true);

    useVerificationStore.getState().setVerified('file:///test/2.jpg', false);
    expect(useVerificationStore.getState().verifiedMap['file:///test/2.jpg']).toBe(false);
  });

  it('updates verifiedMap correctly with setVerifiedBatch', () => {
    useVerificationStore.getState().setVerifiedBatch({
      'file:///test/1.jpg': true,
      'file:///test/2.jpg': false,
    });

    const state = useVerificationStore.getState();
    expect(state.verifiedMap['file:///test/1.jpg']).toBe(true);
    expect(state.verifiedMap['file:///test/2.jpg']).toBe(false);
  });

  it('clears cache correctly with clearCache', () => {
    useVerificationStore.getState().setVerified('file:///test/1.jpg', true);
    expect(useVerificationStore.getState().verifiedMap['file:///test/1.jpg']).toBe(true);

    useVerificationStore.getState().clearCache();
    expect(useVerificationStore.getState().verifiedMap).toEqual({});
  });

  describe('Zustand Persist Configuration', () => {
    it('has the correct storage name and uses MMKV storage', () => {
      const persistOptions = (useVerificationStore as any).persist?.getOptions();
      expect(persistOptions).toBeDefined();
      expect(persistOptions.name).toBe('grovkornet-verification-storage');
      expect(persistOptions.storage).toBeDefined();
    });
  });
});
