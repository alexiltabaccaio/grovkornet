import { usePresetStore, DEFAULT_FILM_PAYLOAD, DEFAULT_BODY_PAYLOAD } from '@entities/preset';

import { generatePresetPreview } from '@grovkornet/engine';
import { 
  initThumbnailGenerator, 
  enablePresetSubscriptionForTesting, 
  disablePresetSubscriptionForTesting, 
  clearPresetSubscriptionTimeout 
} from './initThumbnailGenerator';

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

describe('initThumbnailGenerator', () => {
  let unsubscribe: (() => void) | null = null;

  beforeAll(() => {
    enablePresetSubscriptionForTesting();
  });

  afterAll(() => {
    disablePresetSubscriptionForTesting();
    clearPresetSubscriptionTimeout();
  });

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

    unsubscribe = initThumbnailGenerator();
  });

  afterEach(() => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    jest.useRealTimers();
  });

  describe('Dynamic Prefetching & Debounce', () => {
    it('should call Image.prefetch when a new customized thumbnail is generated', async () => {
      usePresetStore.setState({ customizedPayload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD } });
      jest.advanceTimersByTime(500);

      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      expect(generatePresetPreview).toHaveBeenCalled();

      expect(usePresetStore.getState().customizedThumbnailUri).toBe('file:///cache/preset_preview_mock.jpg');
    });

    it('should respect the 500ms debounce before generating and prefetching', async () => {
      usePresetStore.setState({ customizedPayload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD } });
      jest.advanceTimersByTime(300);
      expect(generatePresetPreview).not.toHaveBeenCalled();

      usePresetStore.setState({ customizedPayload: { film: { ...DEFAULT_FILM_PAYLOAD, saturation: 2.0 }, body: DEFAULT_BODY_PAYLOAD } });
      jest.advanceTimersByTime(300);
      expect(generatePresetPreview).not.toHaveBeenCalled();

      jest.advanceTimersByTime(200);

      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      expect(generatePresetPreview).toHaveBeenCalledTimes(1);
    });

    it('should clean up the customized thumbnail when customized payload is reset', () => {
      usePresetStore.setState({ customizedThumbnailUri: 'file:///cache/custom_thumb.jpg' });
      usePresetStore.setState({ customizedPayload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD } });

      // Reset
      usePresetStore.setState({ customizedPayload: null });

      expect(usePresetStore.getState().customizedThumbnailUri).toBeNull();
    });
  });
});
