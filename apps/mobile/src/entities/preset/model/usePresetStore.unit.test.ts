import { usePresetStore } from './usePresetStore';
import { Image } from 'expo-image';
import { generatePresetPreview } from '@grovkornet/engine';

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

describe('usePresetStore - Dynamic Prefetching', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    
    // Reset store state
    usePresetStore.setState({
      activePresetId: 'default',
      customizedPayload: null,
      customizedThumbnailUri: null,
      userPresets: [],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call Image.prefetch when a new customized thumbnail is generated', async () => {
    // 1. Trigger the customized mode
    usePresetStore.getState().markAsCustomized();

    // 2. Advance timers by 500ms to trigger the debounce subscription callback
    jest.advanceTimersByTime(500);

    // 3. Resolve all promises
    await Promise.resolve(); // Resolves the promise inside setTimeout
    await Promise.resolve(); // Resolves generatePresetPreview
    await Promise.resolve(); // Resolves Image.prefetch

    // 4. Verify native method was called with the local uri and film payload
    expect(generatePresetPreview).toHaveBeenCalled();

    // 5. Verify that Image.prefetch was called with the generated URI
    expect(Image.prefetch).toHaveBeenCalledWith('file:///cache/preset_preview_mock.jpg');
    expect(usePresetStore.getState().customizedThumbnailUri).toBe('file:///cache/preset_preview_mock.jpg');
  });

  it('should respect the 500ms debounce before generating and prefetching', async () => {
    // 1. Trigger the customized mode
    usePresetStore.getState().markAsCustomized();

    // 2. Advance time by 300ms (should not trigger since debounce is 500ms)
    jest.advanceTimersByTime(300);
    expect(generatePresetPreview).not.toHaveBeenCalled();
    expect(Image.prefetch).not.toHaveBeenCalled();

    // 3. Trigger customization again to reset the debounce timer
    usePresetStore.getState().markAsCustomized();

    // 4. Advance time by another 300ms (total 600ms, but only 300ms since last change)
    jest.advanceTimersByTime(300);
    expect(generatePresetPreview).not.toHaveBeenCalled();

    // 5. Finally, advance by 200ms more (500ms since last change)
    jest.advanceTimersByTime(200);

    // Resolve promises
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(generatePresetPreview).toHaveBeenCalledTimes(1);
    expect(Image.prefetch).toHaveBeenCalledWith('file:///cache/preset_preview_mock.jpg');
  });
});
