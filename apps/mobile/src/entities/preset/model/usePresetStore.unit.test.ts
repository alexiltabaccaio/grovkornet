import { usePresetStore, DEFAULT_FILM_PAYLOAD, DEFAULT_BODY_PAYLOAD } from './usePresetStore';
import { useFilmStore } from '@entities/film';
import { useBodyStore } from '@entities/body';

jest.mock('@grovkornet/engine', () => ({
  generatePresetPreview: jest.fn().mockResolvedValue('file:///cache/preset_preview_mock.jpg'),
  deleteFile: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn().mockResolvedValue(true),
      localUri: 'file:///assets/monoscope.jpg',
      uri: 'file:///assets/monoscope.jpg',
    })),
  },
}));

describe('usePresetStore', () => {

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    
    // Reset stores state
    usePresetStore.setState({
      activePresetId: 'default',
      customizedPayload: null,
      customizedThumbnailUri: null,
      userPresets: [],
      isApplyingPreset: false,
      isAddModalVisible: false,
    });

    // Reset film store values
    const filmStore = useFilmStore.getState();
    Object.keys(DEFAULT_FILM_PAYLOAD).forEach((key) => {
      const k = key as keyof typeof DEFAULT_FILM_PAYLOAD;
      if (filmStore[k] && typeof filmStore[k] === 'object' && 'value' in filmStore[k]) {
        (filmStore[k] as any).value = DEFAULT_FILM_PAYLOAD[k];
      }
    });

    // Reset body store values
    const bodyStore = useBodyStore.getState();
    Object.keys(DEFAULT_BODY_PAYLOAD).forEach((key) => {
      const k = key as keyof typeof DEFAULT_BODY_PAYLOAD;
      if (bodyStore[k] && typeof bodyStore[k] === 'object' && 'value' in bodyStore[k]) {
        (bodyStore[k] as any).value = DEFAULT_BODY_PAYLOAD[k];
      }
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });



  describe('Preset CRUD Actions', () => {
    it('adds a preset snapshotting active values when customizedPayload is null', () => {
      // Modify active stores
      (useFilmStore.getState().saturation as any).value = 1.5;
      (useBodyStore.getState().iso as any).value = 800;

      const store = usePresetStore.getState();
      store.addPreset('Custom Retro', 'file:///custom_thumb.jpg');

      const updatedStore = usePresetStore.getState();
      expect(updatedStore.userPresets).toHaveLength(1);
      expect(updatedStore.userPresets[0].name).toBe('Custom Retro');
      expect(updatedStore.userPresets[0].thumbnailUri).toBe('file:///custom_thumb.jpg');
      expect(updatedStore.userPresets[0].payload.film.saturation).toBe(1.5);
      expect(updatedStore.userPresets[0].payload.body.iso).toBe(800);
      expect(updatedStore.activePresetId).toBe(updatedStore.userPresets[0].id);
    });

    it('adds a preset using customizedPayload when customizedPayload is defined', () => {
      usePresetStore.setState({
        customizedPayload: {
          film: { ...DEFAULT_FILM_PAYLOAD, saturation: 0.2 },
          body: { ...DEFAULT_BODY_PAYLOAD, iso: 3200 },
        },
      });

      const store = usePresetStore.getState();
      store.addPreset('B&W High Contrast');

      const updatedStore = usePresetStore.getState();
      expect(updatedStore.userPresets).toHaveLength(1);
      expect(updatedStore.userPresets[0].payload.film.saturation).toBe(0.2);
      expect(updatedStore.userPresets[0].payload.body.iso).toBe(3200);
      expect(updatedStore.customizedPayload).toBeNull();
    });

    it('removes a preset and falls back to default if removed preset was active', () => {
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
        activePresetId: '123',
      });

      usePresetStore.getState().removePreset('123');

      const updatedStore = usePresetStore.getState();
      expect(updatedStore.userPresets).toHaveLength(0);
      expect(updatedStore.activePresetId).toBe('default');
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

  describe('Preset Apply Actions', () => {
    it('applies default preset and updates film and body stores', () => {
      (useFilmStore.getState().saturation as any).value = 2.0;
      (useBodyStore.getState().iso as any).value = 1600;

      usePresetStore.getState().applyPreset('default');

      expect(useFilmStore.getState().saturation.value).toBe(DEFAULT_FILM_PAYLOAD.saturation);
      expect(useBodyStore.getState().iso.value).toBe(DEFAULT_BODY_PAYLOAD.iso);
      expect(usePresetStore.getState().activePresetId).toBe('default');
    });

    it('applies customized preset if active', () => {
      const customPayload = {
        film: { ...DEFAULT_FILM_PAYLOAD, contrast: 1.8 },
        body: { ...DEFAULT_BODY_PAYLOAD, ev: 1.0 },
      };
      usePresetStore.setState({
        customizedPayload: customPayload,
      });

      usePresetStore.getState().applyPreset('customized');

      expect(useFilmStore.getState().contrast.value).toBe(1.8);
      expect(useBodyStore.getState().ev.value).toBe(1.0);
      expect(usePresetStore.getState().activePresetId).toBe('customized');
    });

    it('applies user preset and merges with default payloads', () => {
      const userPreset = {
        id: 'user-1',
        name: 'Special',
        payload: {
          film: { saturation: 0.5 } as any, // partial payload
          body: { iso: 400 } as any, // partial payload
        },
        isFavorite: false,
        inQuickSelect: false,
        createdAt: Date.now(),
      };
      usePresetStore.setState({ userPresets: [userPreset] });

      usePresetStore.getState().applyPreset('user-1');

      expect(useFilmStore.getState().saturation.value).toBe(0.5);
      expect(useFilmStore.getState().contrast.value).toBe(DEFAULT_FILM_PAYLOAD.contrast); // from default merge
      expect(useBodyStore.getState().iso.value).toBe(400);
      expect(usePresetStore.getState().activePresetId).toBe('user-1');
    });
  });

  describe('Quick Selector List and Navigation', () => {
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

    it('navigates next and previous preset correctly', () => {
      const presets = [
        { id: '1', name: 'P1', payload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD }, isFavorite: false, inQuickSelect: true, createdAt: Date.now() },
      ];
      usePresetStore.setState({
        userPresets: presets,
        activePresetId: 'default',
      });

      // Quick list: ['default', '1']
      usePresetStore.getState().nextQuickPreset();
      expect(usePresetStore.getState().activePresetId).toBe('1');

      usePresetStore.getState().nextQuickPreset();
      expect(usePresetStore.getState().activePresetId).toBe('default');

      usePresetStore.getState().prevQuickPreset();
      expect(usePresetStore.getState().activePresetId).toBe('1');
    });

    it('does not navigate quick presets if list contains only 1 preset', () => {
      usePresetStore.setState({ activePresetId: 'default' }); // Only 'default' is in the list
      usePresetStore.getState().nextQuickPreset();
      expect(usePresetStore.getState().activePresetId).toBe('default');
    });
  });

  describe('Modals and UI states', () => {
    it('sets add modal visible state', () => {
      usePresetStore.getState().setAddModalVisible(true);
      expect(usePresetStore.getState().isAddModalVisible).toBe(true);
    });
  });
});
