import { useSystemStore } from './useSystemStore';
import { logger } from '@shared/lib/logger';

describe('useSystemStore', () => {
  beforeEach(() => {
    useSystemStore.setState({
      isFpsOverlayEnabled: false,
      isLayoutOverlayEnabled: false,
      isLogsEnabled: false,
    });
  });

  it('initializes with default values', () => {
    const state = useSystemStore.getState();
    expect(state.isFpsOverlayEnabled).toBe(false);
    expect(state.isLayoutOverlayEnabled).toBe(false);
    expect(state.isLogsEnabled).toBe(false);
  });

  it('updates layout overlay mode correctly', () => {
    const { setIsLayoutOverlayEnabled } = useSystemStore.getState();
    setIsLayoutOverlayEnabled(true);
    expect(useSystemStore.getState().isLayoutOverlayEnabled).toBe(true);
  });

  it('updates fps overlay mode correctly', () => {
    const { setIsFpsOverlayEnabled } = useSystemStore.getState();
    setIsFpsOverlayEnabled(true);
    expect(useSystemStore.getState().isFpsOverlayEnabled).toBe(true);
  });

  it('updates logs mode correctly', () => {
    const { setIsLogsEnabled } = useSystemStore.getState();
    setIsLogsEnabled(true);
    expect(useSystemStore.getState().isLogsEnabled).toBe(true);
  });

  describe('Zustand Persist Configuration', () => {
    it('partializes only necessary system storage state keys', () => {
      const persistOptions = (useSystemStore as any).persist?.getOptions();
      expect(persistOptions).toBeDefined();
      
      const mockState = {
        isLogsEnabled: true,
        isFpsOverlayEnabled: true,
        isLayoutOverlayEnabled: true,
      };
      
      const partialized = persistOptions.partialize(mockState);
      expect(partialized).toEqual({
        isLogsEnabled: true,
      });
    });

    it('sets the logger debug level on store rehydration', () => {
      const persistOptions = (useSystemStore as any).persist?.getOptions();
      expect(persistOptions).toBeDefined();

      const spyLogger = jest.spyOn(logger, 'setDebugEnabled');
      const spyStore = jest.spyOn(useSystemStore.getState(), 'setIsLogsEnabled');
      
      const originalDev = (global as any).__DEV__;
      
      // Test when __DEV__ is true
      (global as any).__DEV__ = true;
      const onRehydrateDev = persistOptions.onRehydrateStorage();
      expect(typeof onRehydrateDev).toBe('function');
      onRehydrateDev({ isLogsEnabled: true }, null);
      expect(spyLogger).toHaveBeenCalledWith(true);
      expect(spyStore).not.toHaveBeenCalled();

      // Test when __DEV__ is false
      (global as any).__DEV__ = false;
      const onRehydrateProd = persistOptions.onRehydrateStorage();
      expect(typeof onRehydrateProd).toBe('function');
      onRehydrateProd({ isLogsEnabled: true }, null);
      expect(spyStore).toHaveBeenCalledWith(false);

      (global as any).__DEV__ = originalDev;
      spyLogger.mockRestore();
      spyStore.mockRestore();
    });
  });
});
