import { usePresetStore, DEFAULT_FILM_PAYLOAD, DEFAULT_BODY_PAYLOAD } from '@entities/preset';
import { useFilmStore } from '@entities/film';
import { useBodyStore } from '@entities/body';
import { addPreset, applyPreset, markAsCustomized, removePreset, nextQuickPreset, prevQuickPreset, arePayloadsEqual } from './presetActions';

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
    (bodyStore.iso as any).value = 400;
    (bodyStore.ev as any).value = 0.0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('addPreset', () => {
    it('adds a preset snapshotting active values when customizedPayload is null', () => {
      (useFilmStore.getState().saturation as any).value = 1.5;
      (useBodyStore.getState().iso as any).value = 800; // This should not be snapshotted

      addPreset('Custom Retro', 'file:///custom_thumb.jpg');

      const updatedStore = usePresetStore.getState();
      expect(updatedStore.userPresets).toHaveLength(1);
      expect(updatedStore.userPresets[0].name).toBe('Custom Retro');
      expect(updatedStore.userPresets[0].thumbnailUri).toBe('file:///custom_thumb.jpg');
      expect(updatedStore.userPresets[0].payload.film.saturation).toBe(1.5);
      expect(updatedStore.userPresets[0].payload.body).toEqual({}); // Empty because body has no preset parameters
      expect(updatedStore.activePresetId).toBe(updatedStore.userPresets[0].id);
    });

    it('adds a preset using customizedPayload when customizedPayload is defined', () => {
      usePresetStore.setState({
        customizedPayload: {
          film: { ...DEFAULT_FILM_PAYLOAD, saturation: 0.2 },
          body: {},
          lens: {},
        },
      });

      addPreset('B&W High Contrast');

      const updatedStore = usePresetStore.getState();
      expect(updatedStore.userPresets).toHaveLength(1);
      expect(updatedStore.userPresets[0].payload.film.saturation).toBe(0.2);
      expect(updatedStore.userPresets[0].payload.body).toEqual({});
      expect(updatedStore.customizedPayload).toBeNull();
    });
  });

  describe('removePreset', () => {
    it('removes a preset and falls back to default if removed preset was active', () => {
      const mockPreset = {
        id: '123',
        name: 'Retro',
        payload: { film: DEFAULT_FILM_PAYLOAD, body: {}, lens: {} },
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
    it('applies default preset and updates film but leaves body stores untouched', () => {
      (useFilmStore.getState().saturation as any).value = 2.0;
      (useBodyStore.getState().iso as any).value = 1600; // Change exposure

      applyPreset('default');

      expect(useFilmStore.getState().saturation.value).toBe(DEFAULT_FILM_PAYLOAD.saturation);
      expect(useBodyStore.getState().iso.value).toBe(1600); // Exposure remains untouched!
      expect(usePresetStore.getState().activePresetId).toBe('default');
    });

    it('applies customized preset if active', () => {
      const customPayload = {
        film: { ...DEFAULT_FILM_PAYLOAD, contrast: 1.8 },
        body: {},
        lens: {},
      };
      usePresetStore.setState({
        customizedPayload: customPayload,
      });

      // Set initial values
      (useBodyStore.getState().ev as any).value = 1.5;

      applyPreset('customized');

      expect(useFilmStore.getState().contrast.value).toBe(1.8);
      expect(useBodyStore.getState().ev.value).toBe(1.5); // EV unchanged because it is excluded
      expect(usePresetStore.getState().activePresetId).toBe('customized');
    });

    it('applies user preset and merges with default payloads', () => {
      const userPreset = {
        id: 'user-1',
        name: 'Special',
        payload: {
          film: { saturation: 0.5 } as any,
          body: {},
          lens: {},
        },
        isFavorite: false,
        inQuickSelect: false,
        createdAt: Date.now(),
      };
      usePresetStore.setState({ userPresets: [userPreset] });

      (useBodyStore.getState().iso as any).value = 800;

      applyPreset('user-1');

      expect(useFilmStore.getState().saturation.value).toBe(0.5);
      expect(useFilmStore.getState().contrast.value).toBe(DEFAULT_FILM_PAYLOAD.contrast);
      expect(useBodyStore.getState().iso.value).toBe(800); // Intact
      expect(usePresetStore.getState().activePresetId).toBe('user-1');
    });

    it('preserves customized state when applying a non-customized preset', () => {
      const customPayload = {
        film: { ...DEFAULT_FILM_PAYLOAD, contrast: 1.8 },
        body: {},
        lens: {},
      };
      usePresetStore.setState({
        customizedPayload: customPayload,
        customizedThumbnailUri: 'file:///thumb.jpg',
      });

      applyPreset('default');

      const store = usePresetStore.getState();
      expect(store.customizedPayload).toEqual(customPayload);
      expect(store.customizedThumbnailUri).toBe('file:///thumb.jpg');
    });
  });

  describe('markAsCustomized', () => {
    it('marks preset as customized snapshotting current film store parameters', () => {
      (useFilmStore.getState().saturation as any).value = 1.8;
      (useBodyStore.getState().iso as any).value = 1200; // Should not trigger customization on its own

      markAsCustomized();

      const store = usePresetStore.getState();
      expect(store.activePresetId).toBe('customized');
      expect(store.customizedPayload?.film.saturation).toBe(1.8);
      expect(store.customizedPayload?.body).toEqual({});
    });

    it('switches back to default if manual changes match the default parameters', () => {
      usePresetStore.setState({
        activePresetId: 'customized',
        customizedPayload: {
          film: { ...DEFAULT_FILM_PAYLOAD, saturation: 1.8 },
          body: {},
          lens: {},
        },
      });

      (useFilmStore.getState().saturation as any).value = DEFAULT_FILM_PAYLOAD.saturation;

      markAsCustomized();

      const store = usePresetStore.getState();
      expect(store.activePresetId).toBe('default');
      expect(store.customizedPayload).toBeNull();
      expect(store.customizedThumbnailUri).toBeNull();
    });

    it('switches to matching user preset if manual changes match a user preset', () => {
      const targetPayload = {
        film: { ...DEFAULT_FILM_PAYLOAD, saturation: 0.7 },
        body: {},
        lens: {},
      };
      const userPreset = {
        id: 'user-matched',
        name: 'Matched Preset',
        payload: targetPayload,
        isFavorite: false,
        inQuickSelect: false,
        createdAt: Date.now(),
      };
      usePresetStore.setState({
        userPresets: [userPreset],
        activePresetId: 'customized',
        customizedPayload: {
          film: { ...DEFAULT_FILM_PAYLOAD, saturation: 1.8 },
          body: {},
          lens: {},
        },
      });

      (useFilmStore.getState().saturation as any).value = 0.7;

      markAsCustomized();

      const store = usePresetStore.getState();
      expect(store.activePresetId).toBe('user-matched');
      expect(store.customizedPayload).toBeNull();
      expect(store.customizedThumbnailUri).toBeNull();
    });

    it('handles floating point inaccuracies within epsilon tolerance', () => {
      usePresetStore.setState({
        activePresetId: 'default',
      });

      (useFilmStore.getState().saturation as any).value = DEFAULT_FILM_PAYLOAD.saturation + 0.0000002;

      markAsCustomized();

      expect(usePresetStore.getState().activePresetId).toBe('default');

      (useFilmStore.getState().saturation as any).value = DEFAULT_FILM_PAYLOAD.saturation + 0.00002;

      markAsCustomized();

      expect(usePresetStore.getState().activePresetId).toBe('customized');
    });
  });

  describe('Quick Selector List and Navigation', () => {
    it('navigates next and previous preset correctly', () => {
      const presets = [
        { id: '1', name: 'P1', payload: { film: DEFAULT_FILM_PAYLOAD, body: {}, lens: {} }, isFavorite: false, inQuickSelect: true, createdAt: Date.now() },
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

  describe('Non-preset parameters changes', () => {
    it('should not mark preset as customized or clear customized payload on changing non-preset parameters', () => {
      const customizedPayload = {
        film: { ...DEFAULT_FILM_PAYLOAD, saturation: 1.8 },
        body: {},
        lens: {},
      };
      usePresetStore.setState({
        activePresetId: 'default',
        customizedPayload: customizedPayload,
        customizedThumbnailUri: 'file:///custom.jpg',
      });

      // Change a non-preset film parameter: isSelfieCamera
      useFilmStore.getState().setIsSelfieCamera(true);

      jest.runAllTimers();

      expect(usePresetStore.getState().activePresetId).toBe('default');
      expect(usePresetStore.getState().customizedPayload).toEqual(customizedPayload);
      expect(usePresetStore.getState().customizedThumbnailUri).toBe('file:///custom.jpg');

      // Change a non-preset body parameter: zoom
      useBodyStore.getState().setZoom(2.5);

      jest.runAllTimers();

      expect(usePresetStore.getState().activePresetId).toBe('default');
      expect(usePresetStore.getState().customizedPayload).toEqual(customizedPayload);
      expect(usePresetStore.getState().customizedThumbnailUri).toBe('file:///custom.jpg');
    });
  });

  describe('arePayloadsEqual dynamic parameters', () => {
    it('ignores scanlinesHorizontal when comparing preset payloads', () => {
      const p1 = {
        film: { ...DEFAULT_FILM_PAYLOAD, scanlinesHorizontal: true } as any,
        body: {},
        lens: {},
      };
      const p2 = {
        film: { ...DEFAULT_FILM_PAYLOAD, scanlinesHorizontal: false } as any,
        body: {},
        lens: {},
      };

      expect(arePayloadsEqual(p1, p2)).toBe(true);
    });
  });
});
