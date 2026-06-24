import { initNativeSync } from './nativeSync';
import { setFilmStoreListener, getNitroConfig, useFilmStore } from '@entities/film';
import { usePresetStore } from '@entities/preset';
import { markAsCustomized } from '@features/system-settings';

let registeredListener: ((paramName?: string) => void) | null = null;

jest.mock('@entities/film', () => ({
  useFilmStore: {
    getState: jest.fn(),
  },
  setFilmStoreListener: jest.fn((cb) => {
    registeredListener = cb;
  }),
  getNitroConfig: jest.fn(),
}));

jest.mock('@entities/preset', () => ({
  usePresetStore: {
    getState: jest.fn(),
  },
  DEFAULT_FILM_PAYLOAD: {
    saturation: 1.0,
    contrast: 1.0,
  },
}));

jest.mock('@features/system-settings', () => ({
  markAsCustomized: jest.fn(),
}));

describe('nativeSync unit tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    registeredListener = null;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('registers the film store listener on initialization', () => {
    initNativeSync();
    expect(setFilmStoreListener).toHaveBeenCalledWith(expect.any(Function));
    expect(registeredListener).toBeDefined();
  });

  it('does nothing if isApplyingPreset is true', () => {
    initNativeSync();
    
    (usePresetStore.getState as jest.Mock).mockReturnValue({
      isApplyingPreset: true,
    });

    registeredListener!('saturation');
    
    jest.advanceTimersByTime(50);

    expect(getNitroConfig).not.toHaveBeenCalled();
    expect(markAsCustomized).not.toHaveBeenCalled();
  });

  it('syncs changed film parameters to nitro config after debounce timeout', () => {
    initNativeSync();

    (usePresetStore.getState as jest.Mock).mockReturnValue({
      isApplyingPreset: false,
    });

    const mockNitroRecord: Record<string, any> = {
      saturation: 1.0,
      contrast: 1.0,
    };
    (getNitroConfig as jest.Mock).mockReturnValue(mockNitroRecord);

    (useFilmStore.getState as jest.Mock).mockReturnValue({
      saturation: { value: 1.5 },
      contrast: { value: 1.0 }, // unchanged value
      otherKey: 'not-a-shared-value', // ignored
    });

    // Call listener with param inside DEFAULT_FILM_PAYLOAD
    registeredListener!('saturation');

    // Call multiple times to test debounce
    registeredListener!('saturation');
    
    // Advance less than debounce duration
    jest.advanceTimersByTime(30);
    expect(getNitroConfig).not.toHaveBeenCalled();

    // Complete the 50ms sync debounce
    jest.advanceTimersByTime(20);

    expect(getNitroConfig).toHaveBeenCalled();
    expect(mockNitroRecord.saturation).toBe(1.5);
    expect(mockNitroRecord.contrast).toBe(1.0); // should not be reassigned

    // Both debounce timers (sync and customize) are set to 50ms, so both should have fired now
    expect(markAsCustomized).toHaveBeenCalledTimes(1);
  });

  it('does not mark as customized if paramName is not in DEFAULT_FILM_PAYLOAD', () => {
    initNativeSync();

    (usePresetStore.getState as jest.Mock).mockReturnValue({
      isApplyingPreset: false,
    });

    (useFilmStore.getState as jest.Mock).mockReturnValue({});
    (getNitroConfig as jest.Mock).mockReturnValue({});

    // Param not present in payload
    registeredListener!('non-existent-param');

    jest.advanceTimersByTime(100);

    expect(markAsCustomized).not.toHaveBeenCalled();
  });

  it('marks as customized if paramName is undefined', () => {
    initNativeSync();

    (usePresetStore.getState as jest.Mock).mockReturnValue({
      isApplyingPreset: false,
    });

    (useFilmStore.getState as jest.Mock).mockReturnValue({});
    (getNitroConfig as jest.Mock).mockReturnValue({});

    // paramName undefined
    registeredListener!(undefined);

    jest.advanceTimersByTime(100);

    expect(markAsCustomized).toHaveBeenCalled();
  });

  it('catches and logs exceptions during synchronization', () => {
    initNativeSync();

    (usePresetStore.getState as jest.Mock).mockReturnValue({
      isApplyingPreset: false,
    });

    // force getNitroConfig to throw
    (getNitroConfig as jest.Mock).mockImplementation(() => {
      throw new Error('Nitro Error');
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    registeredListener!('saturation');

    jest.advanceTimersByTime(50);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[nativeSync] Failed to sync film parameters to Nitro:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('correctly maps and syncs every single key in the sync map', () => {
    initNativeSync();

    (usePresetStore.getState as jest.Mock).mockReturnValue({
      isApplyingPreset: false,
    });

    const mockNitroRecord: Record<string, any> = {};
    const storeState: Record<string, any> = {};

    const allKeys = [
      'saturation', 'contrast', 'grainIntensity', 'grainChroma', 'grainSize',
      'grainSpeed', 'vignetteIntensity', 'chromaShift', 'temperature', 'tint',
      'bloomIntensity', 'chromaticAberration', 'chromaShiftDirection', 'sharpening',
      'satRed', 'satOrange', 'satYellow', 'satGreen', 'satCyan', 'satBlue',
      'satPurple', 'satMagenta', 'aberrationInvert', 'boundMagentaRed',
      'boundRedOrange', 'boundOrangeYellow', 'boundYellowGreen', 'boundGreenCyan',
      'boundCyanBlue', 'boundBluePurple', 'boundPurpleMagenta', 'grainRoughness',
      'panelY', 'grainEnabled', 'bloomEnabled', 'blackLevel', 'highlights',
      'pivot', 'contrastAuto', 'blackLevelAuto', 'highlightsAuto', 'pivotAuto',
      'pixelationFactor', 'tapeJitter', 'scanlines', 'chromaShiftInvert', 'hue',
      'hueRed', 'hueOrange', 'hueYellow', 'hueGreen', 'hueCyan', 'hueBlue',
      'huePurple', 'hueMagenta', 'scanlinesHorizontal', 'scanlinesMode',
      'scanlinesDensity', 'lensDistortion'
    ];

    allKeys.forEach((key) => {
      mockNitroRecord[key] = 1.0;
      storeState[key] = { value: 2.5 };
    });

    (getNitroConfig as jest.Mock).mockReturnValue(mockNitroRecord);
    (useFilmStore.getState as jest.Mock).mockReturnValue(storeState);

    registeredListener!(undefined);
    jest.advanceTimersByTime(50);

    allKeys.forEach((key) => {
      expect(mockNitroRecord[key]).toBe(2.5);
    });
  });

  it('does not re-assign properties on Nitro if the value is already equal', () => {
    initNativeSync();

    (usePresetStore.getState as jest.Mock).mockReturnValue({
      isApplyingPreset: false,
    });

    let assignCount = 0;
    const mockNitroRecord = {};
    
    Object.defineProperty(mockNitroRecord, 'saturation', {
      get: () => 1.5,
      set: () => {
        assignCount++;
      },
      configurable: true,
      enumerable: true,
    });

    (getNitroConfig as jest.Mock).mockReturnValue(mockNitroRecord);
    
    (useFilmStore.getState as jest.Mock).mockReturnValue({
      saturation: { value: 1.5 },
    });

    registeredListener!(undefined);
    jest.advanceTimersByTime(50);

    expect(assignCount).toBe(0);
  });
});

