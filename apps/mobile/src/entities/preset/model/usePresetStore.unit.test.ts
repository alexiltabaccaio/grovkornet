import { usePresetStore, DEFAULT_FILM_PAYLOAD, DEFAULT_BODY_PAYLOAD } from './usePresetStore';

describe('usePresetStore', () => {

  beforeEach(() => {
    // Reset store state
    usePresetStore.setState({
      activePresetId: 'default',
      customizedPayload: null,
      customizedThumbnailUri: null,
      userPresets: [],
      isApplyingPreset: false,
      isAddModalVisible: false,
    });
  });

  describe('Preset CRUD Actions', () => {
    it('adds a user preset and sets it active', () => {
      const mockPreset = {
        id: '123',
        name: 'Retro',
        payload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD },
        isFavorite: false,
        inQuickSelect: false,
        createdAt: Date.now(),
        thumbnailUri: 'file:///thumb.jpg',
      };

      usePresetStore.getState().addUserPreset(mockPreset);

      const state = usePresetStore.getState();
      expect(state.userPresets).toHaveLength(1);
      expect(state.userPresets[0].name).toBe('Retro');
      expect(state.activePresetId).toBe('123');
    });

    it('removes a user preset', () => {
      const mockPreset = {
        id: '123',
        name: 'Retro',
        payload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD },
        isFavorite: false,
        inQuickSelect: false,
        createdAt: Date.now(),
      };
      usePresetStore.setState({
        userPresets: [mockPreset],
      });

      usePresetStore.getState().removeUserPreset('123');

      const state = usePresetStore.getState();
      expect(state.userPresets).toHaveLength(0);
    });

    it('sets favorite preset correctly', () => {
      const presets = [
        { id: '1', name: 'P1', payload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD }, isFavorite: false, inQuickSelect: false, createdAt: Date.now() },
        { id: '2', name: 'P2', payload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD }, isFavorite: false, inQuickSelect: false, createdAt: Date.now() },
      ];
      usePresetStore.setState({ userPresets: presets });

      usePresetStore.getState().setFavoritePreset('2');

      const updated = usePresetStore.getState().userPresets;
      expect(updated.find(p => p.id === '1')?.isFavorite).toBe(false);
      expect(updated.find(p => p.id === '2')?.isFavorite).toBe(true);
    });

    it('toggles quick select state and respects maximum limit of 5', () => {
      const presets = Array.from({ length: 6 }, (_, i) => ({
        id: `${i}`,
        name: `P${i}`,
        payload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD },
        isFavorite: false,
        inQuickSelect: i < 5,
        createdAt: Date.now(),
      }));
      usePresetStore.setState({ userPresets: presets });

      // Toggle off
      usePresetStore.getState().toggleQuickSelect('0');
      expect(usePresetStore.getState().userPresets[0].inQuickSelect).toBe(false);

      // Toggle on
      usePresetStore.getState().toggleQuickSelect('0');
      expect(usePresetStore.getState().userPresets[0].inQuickSelect).toBe(true);

      // Try pinning 6th preset (should fail)
      expect(() => {
        usePresetStore.getState().toggleQuickSelect('5');
      }).toThrow('LIMIT_EXCEEDED');
    });
  });

  describe('Quick Selector List', () => {
    it('builds quick select list correctly', () => {
      const presets = [
        { id: '1', name: 'P1', payload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD }, isFavorite: false, inQuickSelect: true, createdAt: Date.now() },
        { id: '2', name: 'P2', payload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD }, isFavorite: false, inQuickSelect: false, createdAt: Date.now() },
      ];
      usePresetStore.setState({
        userPresets: presets,
        customizedPayload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD },
      });

      const list = usePresetStore.getState().getQuickSelectList();
      expect(list).toEqual([
        { id: 'default', name: 'Default' },
        { id: 'customized', name: 'Personalizzato' },
        { id: '1', name: 'P1' },
      ]);
    });
  });

  describe('Modals and UI states', () => {
    it('sets add modal visible state', () => {
      usePresetStore.getState().setAddModalVisible(true);
      expect(usePresetStore.getState().isAddModalVisible).toBe(true);
    });
  });

  describe('Zustand Persist Configuration', () => {
    it('partializes only userPresets, activePresetId, and customizedPayload', () => {
      const persistOptions = (usePresetStore as any).persist?.getOptions();
      expect(persistOptions).toBeDefined();
      expect(persistOptions.name).toBe('grovkornet-presets-storage');
      
      const mockState = {
        userPresets: [{ id: '1', name: 'Preset 1' }],
        activePresetId: '1',
        customizedPayload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD },
        isApplyingPreset: true,
        isAddModalVisible: true,
        customizedThumbnailUri: 'file:///cached.jpg',
      };
      
      const partialized = persistOptions.partialize(mockState);
      expect(partialized).toEqual({
        userPresets: [{ id: '1', name: 'Preset 1' }],
        activePresetId: '1',
        customizedPayload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD },
      });
    });
  });
});
