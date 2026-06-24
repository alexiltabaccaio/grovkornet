import { renderHook } from '@testing-library/react-native';
import { useFilmWorklets } from './useFilmWorklets';
import { useFilmStore } from '../model/useFilmStore';
import { getNitroConfig } from '../model/getNitroConfig';

let mockBypass = false;
jest.mock('@shared/lib/debug/bypassFlags', () => ({
  get BYPASS_JS_SANITIZATION() {
    return mockBypass;
  }
}));

const booleanFunctions = new Set([
  'updateNoiseReductionAuto',
  'updateTemperatureAuto',
  'updateIsSelfieCamera',
  'updateAberrationInvert',
  'updateGrainEnabled',
  'updateBloomEnabled',
  'updateContrastAuto',
  'updateBlackLevelAuto',
  'updateHighlightsAuto',
  'updatePivotAuto',
  'updateChromaShiftInvert',
  'updateScanlinesHorizontal'
]);

const clampedLimits: Record<string, { min: number; max: number; mid: number }> = {
  updateSaturation: { min: 0.0, max: 2.0, mid: 1.0 },
  updateContrast: { min: 0.0, max: 2.0, mid: 1.0 },
  updateGrainIntensity: { min: 0.0, max: 2.0, mid: 1.0 },
  updateVignetteIntensity: { min: 0.0, max: 1.0, mid: 0.5 },
  updateChromaShift: { min: 0.0, max: 1.0, mid: 0.5 },
  updateTemperature: { min: 2000.0, max: 10000.0, mid: 5000.0 },
  updateTint: { min: -100.0, max: 100.0, mid: 0.0 },
  updateBloomIntensity: { min: 0.0, max: 9999.0, mid: 10.0 },
  updateChromaticAberration: { min: 0.0, max: 1.0, mid: 0.5 },
  updateSharpening: { min: 0.0, max: 1.0, mid: 0.5 },
  updateBlackLevel: { min: -0.5, max: 0.5, mid: 0.0 },
  updateHighlights: { min: 0.0, max: 2.0, mid: 1.0 },
  updatePivot: { min: 0.0, max: 1.0, mid: 0.5 },
  updatePixelationFactor: { min: 1.0, max: 16.0, mid: 4.0 },
  updateTapeJitter: { min: 0.0, max: 1.0, mid: 0.5 },
  updateScanlines: { min: 0.0, max: 1.0, mid: 0.5 },
  updateHue: { min: -180.0, max: 180.0, mid: 0.0 },
  updateLensDistortion: { min: -1.0, max: 1.0, mid: 0.0 },
};

describe('useFilmWorklets - Standard Mode', () => {
  beforeEach(() => {
    mockBypass = false;
    // Reset state values in useFilmStore
    const film = useFilmStore.getState();
    Object.keys(film).forEach((key) => {
      const stateProp = (film as any)[key];
      if (stateProp && typeof stateProp === 'object' && 'value' in stateProp) {
        if (typeof stateProp.value === 'number') {
          stateProp.value = 0;
        } else if (typeof stateProp.value === 'boolean') {
          stateProp.value = false;
        }
      }
    });

    // Clear config object
    const config = getNitroConfig();
    Object.keys(config).forEach((key) => {
      delete (config as any)[key];
    });
  });

  it('correctly updates all parameters (happy path, clamping, and nan logic)', () => {
    const { result } = renderHook(() => useFilmWorklets());
    const worklets = result.current as Record<string, any>;
    const filmStore = useFilmStore.getState() as any;
    const config = getNitroConfig() as any;

    const functions = Object.keys(worklets).filter((key) => key.startsWith('update'));
    expect(functions.length).toBeGreaterThan(0);

    const originalWarn = console.warn;
    console.warn = jest.fn();

    const clearConfig = () => {
      Object.keys(config).forEach((key) => {
        delete config[key];
      });
    };

    functions.forEach((fnName) => {
      const fn = worklets[fnName];
      const storeKey = fnName.substring(6).charAt(0).toLowerCase() + fnName.substring(7);

      clearConfig();

      if (booleanFunctions.has(fnName)) {
        // Test boolean happy paths
        fn(true);
        expect(filmStore[storeKey].value).toBe(true);
        if (storeKey in config) {
          expect(config[storeKey]).toBe(true);
        }

        clearConfig();
        fn(false);
        expect(filmStore[storeKey].value).toBe(false);
        if (storeKey in config) {
          expect(config[storeKey]).toBe(false);
        }
      } else {
        // Numeric parameters
        if (fnName in clampedLimits) {
          const limits = clampedLimits[fnName];

          // Test midpoint (within range)
          fn(limits.mid);
          expect(filmStore[storeKey].value).toBe(limits.mid);
          if (storeKey in config) {
            expect(config[storeKey]).toBe(limits.mid);
          }

          // Test min clamp
          clearConfig();
          fn(limits.min - 10);
          expect(filmStore[storeKey].value).toBe(limits.min);
          if (storeKey in config) {
            expect(config[storeKey]).toBe(limits.min);
          }

          // Test max clamp
          clearConfig();
          fn(limits.max + 10);
          expect(filmStore[storeKey].value).toBe(limits.max);
          if (storeKey in config) {
            expect(config[storeKey]).toBe(limits.max);
          }
        } else {
          // Unclamped numeric parameters
          fn(0.7);
          expect(filmStore[storeKey].value).toBe(0.7);
          if (storeKey in config) {
            expect(config[storeKey]).toBe(0.7);
          }
        }

        // Test NaN handling (two subsequent calls to trigger console.warn branch coverage)
        const warnMock = console.warn as jest.Mock;
        warnMock.mockClear();

        const valueBeforeNaN = filmStore[storeKey].value;

        // 1st NaN call: triggers warning
        fn(NaN);
        expect(warnMock).toHaveBeenCalledTimes(1);
        expect(warnMock).toHaveBeenLastCalledWith(
          expect.stringContaining(`NaN value intercepted for parameter '${storeKey}'`)
        );
        expect(filmStore[storeKey].value).toBe(valueBeforeNaN);
        if (storeKey in config) {
          expect(config[storeKey]).toBe(valueBeforeNaN);
        }

        // 2nd NaN call: suppresses warning
        fn(NaN);
        expect(warnMock).toHaveBeenCalledTimes(1);
        expect(filmStore[storeKey].value).toBe(valueBeforeNaN);
        if (storeKey in config) {
          expect(config[storeKey]).toBe(valueBeforeNaN);
        }
      }
    });

    console.warn = originalWarn;
  });

  it('correctly manages side-effects of parameter updates', () => {
    const { result } = renderHook(() => useFilmWorklets());
    const worklets = result.current as Record<string, any>;
    const filmStore = useFilmStore.getState() as any;
    const config = getNitroConfig() as any;

    const clearConfig = () => {
      Object.keys(config).forEach((key) => {
        delete config[key];
      });
    };

    // grainIntensity -> grainEnabled
    clearConfig();
    worklets.updateGrainIntensity(1.5);
    expect(filmStore.grainEnabled.value).toBe(true);
    expect(config.grainEnabled).toBe(true);

    clearConfig();
    worklets.updateGrainIntensity(0.0);
    expect(filmStore.grainEnabled.value).toBe(false);
    expect(config.grainEnabled).toBe(false);

    clearConfig();
    worklets.updateGrainIntensity(-0.5);
    expect(filmStore.grainEnabled.value).toBe(false);
    expect(config.grainEnabled).toBe(false);

    // bloomIntensity -> bloomEnabled
    clearConfig();
    worklets.updateBloomIntensity(10.0);
    expect(filmStore.bloomEnabled.value).toBe(true);
    expect(config.bloomEnabled).toBe(true);

    clearConfig();
    worklets.updateBloomIntensity(0.0);
    expect(filmStore.bloomEnabled.value).toBe(false);
    expect(config.bloomEnabled).toBe(false);

    clearConfig();
    worklets.updateBloomIntensity(-5.0);
    expect(filmStore.bloomEnabled.value).toBe(false);
    expect(config.bloomEnabled).toBe(false);

    // temperature -> temperatureAuto = false
    filmStore.temperatureAuto.value = true;
    clearConfig();
    worklets.updateTemperature(4500);
    expect(filmStore.temperatureAuto.value).toBe(false);

    // tint -> temperatureAuto = false
    filmStore.temperatureAuto.value = true;
    clearConfig();
    worklets.updateTint(10);
    expect(filmStore.temperatureAuto.value).toBe(false);

    // contrast -> contrastAuto = false
    filmStore.contrastAuto.value = true;
    clearConfig();
    worklets.updateContrast(1.2);
    expect(filmStore.contrastAuto.value).toBe(false);
    expect(config.contrastAuto).toBe(false);

    // blackLevel -> blackLevelAuto = false
    filmStore.blackLevelAuto.value = true;
    clearConfig();
    worklets.updateBlackLevel(0.1);
    expect(filmStore.blackLevelAuto.value).toBe(false);
    expect(config.blackLevelAuto).toBe(false);

    // highlights -> highlightsAuto = false
    filmStore.highlightsAuto.value = true;
    clearConfig();
    worklets.updateHighlights(1.2);
    expect(filmStore.highlightsAuto.value).toBe(false);
    expect(config.highlightsAuto).toBe(false);

    // pivot -> pivotAuto = false
    filmStore.pivotAuto.value = true;
    clearConfig();
    worklets.updatePivot(0.4);
    expect(filmStore.pivotAuto.value).toBe(false);
    expect(config.pivotAuto).toBe(false);
  });
});

describe('useFilmWorklets - Bypass Sanitization Mode', () => {
  beforeEach(() => {
    mockBypass = true;
    // Reset config object
    const config = getNitroConfig();
    Object.keys(config).forEach((key) => {
      delete (config as any)[key];
    });
  });

  it('bypasses sanitization and permits NaN through update functions', () => {
    const { result } = renderHook(() => useFilmWorklets());
    const worklets = result.current as Record<string, any>;
    const filmStore = useFilmStore.getState() as any;
    const config = getNitroConfig() as any;

    const functions = Object.keys(worklets).filter((key) => key.startsWith('update'));
    const originalWarn = console.warn;
    console.warn = jest.fn();

    const clearConfig = () => {
      Object.keys(config).forEach((key) => {
        delete config[key];
      });
    };

    functions.forEach((fnName) => {
      const fn = worklets[fnName];
      const storeKey = fnName.substring(6).charAt(0).toLowerCase() + fnName.substring(7);

      clearConfig();
      if (booleanFunctions.has(fnName)) {
        fn(true);
        expect(filmStore[storeKey].value).toBe(true);
        if (storeKey in config) {
          expect(config[storeKey]).toBe(true);
        }
      } else {
        // Set standard out-of-bounds value (bypass allows it to pass through unclamped)
        const outOfBoundsValue = fnName in clampedLimits 
          ? clampedLimits[fnName].max + 100 
          : 9.9;
        
        fn(outOfBoundsValue);
        expect(filmStore[storeKey].value).toBe(outOfBoundsValue);
        if (storeKey in config) {
          expect(config[storeKey]).toBe(outOfBoundsValue);
        }

        // Also test NaN when bypass is true (should not return or be blocked)
        fn(NaN);
        expect(filmStore[storeKey].value).toBeNaN();
        if (storeKey in config) {
          expect(config[storeKey]).toBeNaN();
        }
      }
    });

    console.warn = originalWarn;
  });

  it('bypasses sanitization and manages side-effects of parameter updates', () => {
    const { result } = renderHook(() => useFilmWorklets());
    const worklets = result.current as Record<string, any>;
    const filmStore = useFilmStore.getState() as any;
    const config = getNitroConfig() as any;

    const clearConfig = () => {
      Object.keys(config).forEach((key) => {
        delete config[key];
      });
    };

    // grainIntensity -> grainEnabled side effect in bypass mode
    clearConfig();
    worklets.updateGrainIntensity(1.5);
    expect(filmStore.grainEnabled.value).toBe(true);
    expect(config.grainEnabled).toBe(true);

    clearConfig();
    worklets.updateGrainIntensity(0.0);
    expect(filmStore.grainEnabled.value).toBe(false);
    expect(config.grainEnabled).toBe(false);

    clearConfig();
    worklets.updateGrainIntensity(-0.5);
    expect(filmStore.grainEnabled.value).toBe(false);
    expect(config.grainEnabled).toBe(false);

    // bloomIntensity -> bloomEnabled side effect in bypass mode
    clearConfig();
    worklets.updateBloomIntensity(10.0);
    expect(filmStore.bloomEnabled.value).toBe(true);
    expect(config.bloomEnabled).toBe(true);

    clearConfig();
    worklets.updateBloomIntensity(0.0);
    expect(filmStore.bloomEnabled.value).toBe(false);
    expect(config.bloomEnabled).toBe(false);

    clearConfig();
    worklets.updateBloomIntensity(-5.0);
    expect(filmStore.bloomEnabled.value).toBe(false);
    expect(config.bloomEnabled).toBe(false);

    // temperature -> temperatureAuto = false
    filmStore.temperatureAuto.value = true;
    clearConfig();
    worklets.updateTemperature(4500);
    expect(filmStore.temperatureAuto.value).toBe(false);

    // tint -> temperatureAuto = false
    filmStore.temperatureAuto.value = true;
    clearConfig();
    worklets.updateTint(10);
    expect(filmStore.temperatureAuto.value).toBe(false);

    // contrast -> contrastAuto = false
    filmStore.contrastAuto.value = true;
    clearConfig();
    worklets.updateContrast(1.2);
    expect(filmStore.contrastAuto.value).toBe(false);
    expect(config.contrastAuto).toBe(false);

    // blackLevel -> blackLevelAuto = false
    filmStore.blackLevelAuto.value = true;
    clearConfig();
    worklets.updateBlackLevel(0.1);
    expect(filmStore.blackLevelAuto.value).toBe(false);
    expect(config.blackLevelAuto).toBe(false);

    // highlights -> highlightsAuto = false
    filmStore.highlightsAuto.value = true;
    clearConfig();
    worklets.updateHighlights(1.2);
    expect(filmStore.highlightsAuto.value).toBe(false);
    expect(config.highlightsAuto).toBe(false);

    // pivot -> pivotAuto = false
    filmStore.pivotAuto.value = true;
    clearConfig();
    worklets.updatePivot(0.4);
    expect(filmStore.pivotAuto.value).toBe(false);
    expect(config.pivotAuto).toBe(false);
  });
});
