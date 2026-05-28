import { usePresetStore, DEFAULT_FILM_PAYLOAD, DEFAULT_BODY_PAYLOAD } from '@entities/preset';
import { useFilmStore } from '@entities/film';
import { useBodyStore } from '@entities/body';
import { addPreset, applyPreset, markAsCustomized, removePreset, nextQuickPreset, prevQuickPreset } from './presetActions';

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

describe('presetActions', () => {
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

  describe('addPreset', () => {
    it('adds a preset snapshotting active values when customizedPayload is null', () => {
      (useFilmStore.getState().saturation as any).value = 1.5;
      (useBodyStore.getState().iso as any).value = 800;

      addPreset('Custom Retro', 'file:///custom_thumb.jpg');

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

      addPreset('B&W High Contrast');

      const updatedStore = usePresetStore.getState();
      expect(updatedStore.userPresets).toHaveLength(1);
      expect(updatedStore.userPresets[0].payload.film.saturation).toBe(0.2);
      expect(updatedStore.userPresets[0].payload.body.iso).toBe(3200);
      expect(updatedStore.customizedPayload).toBeNull();
    });
  });

  describe('removePreset', () => {
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

      removePreset('123');

      const updatedStore = usePresetStore.getState();
      expect(updatedStore.userPresets).toHaveLength(0);
      expect(updatedStore.activePresetId).toBe('default');
    });
  });

  describe('applyPreset', () => {
    it('applies default preset and updates film and body stores', () => {
      (useFilmStore.getState().saturation as any).value = 2.0;
      (useBodyStore.getState().iso as any).value = 1600;

      applyPreset('default');

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

      applyPreset('customized');

      expect(useFilmStore.getState().contrast.value).toBe(1.8);
      expect(useBodyStore.getState().ev.value).toBe(1.0);
      expect(usePresetStore.getState().activePresetId).toBe('customized');
    });

    it('applies user preset and merges with default payloads', () => {
      const userPreset = {
        id: 'user-1',
        name: 'Special',
        payload: {
          film: { saturation: 0.5 } as any,
          body: { iso: 400 } as any,
        },
        isFavorite: false,
        inQuickSelect: false,
        createdAt: Date.now(),
      };
      usePresetStore.setState({ userPresets: [userPreset] });

      applyPreset('user-1');

      expect(useFilmStore.getState().saturation.value).toBe(0.5);
      expect(useFilmStore.getState().contrast.value).toBe(DEFAULT_FILM_PAYLOAD.contrast);
      expect(useBodyStore.getState().iso.value).toBe(400);
      expect(usePresetStore.getState().activePresetId).toBe('user-1');
    });
  });

  describe('markAsCustomized', () => {
    it('marks preset as customized snapshotting current film and body stores', () => {
      (useFilmStore.getState().saturation as any).value = 1.8;
      (useBodyStore.getState().iso as any).value = 1200;

      markAsCustomized();

      const store = usePresetStore.getState();
      expect(store.activePresetId).toBe('customized');
      expect(store.customizedPayload?.film.saturation).toBe(1.8);
      expect(store.customizedPayload?.body.iso).toBe(1200);
    });
  });

  describe('Quick Selector List and Navigation', () => {
    it('navigates next and previous preset correctly', () => {
      const presets = [
        { id: '1', name: 'P1', payload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD }, isFavorite: false, inQuickSelect: true, createdAt: Date.now() },
      ];
      usePresetStore.setState({
        userPresets: presets,
        activePresetId: 'default',
      });

      // Quick list: ['default', '1']
      nextQuickPreset();
      expect(usePresetStore.getState().activePresetId).toBe('1');

      nextQuickPreset();
      expect(usePresetStore.getState().activePresetId).toBe('default');

      prevQuickPreset();
      expect(usePresetStore.getState().activePresetId).toBe('1');
    });
  });
});
