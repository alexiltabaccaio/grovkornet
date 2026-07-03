import { 
  snapshotStorePayload, 
  normalizeStorePayload, 
  areStorePayloadsEqual, 
  applyStorePayload,
  syncPayloadToNitro
} from './presetPayloadHelpers';
import { getNitroConfig } from '@entities/film';

jest.mock('@entities/film', () => ({
  getNitroConfig: jest.fn(),
}));

describe('presetPayloadHelpers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('dovrebbe catturare i valori correnti dello store in snapshotStorePayload', () => {
    const storeState = { saturation: { value: 1.2 }, contrast: 0.8 };
    const defaultPayload = { saturation: 1.0, contrast: 1.0 };
    const snapshot = snapshotStorePayload(storeState, defaultPayload);
    expect(snapshot).toEqual({ saturation: 1.2, contrast: 0.8 });
  });

  it('dovrebbe gestire valori non definiti e usare quelli di default', () => {
    const storeState = { saturation: undefined, contrast: 0.8 };
    const defaultPayload = { saturation: 1.0, contrast: 1.0 };
    const snapshot = snapshotStorePayload(storeState, defaultPayload);
    expect(snapshot).toEqual({ saturation: 1.0, contrast: 0.8 });
  });

  it('dovrebbe normalizzare il payload con i valori di default in caso di chiavi nulle o mancanti', () => {
    const payload = { saturation: null as any, contrast: 0.8 };
    const defaultPayload = { saturation: 1.0, contrast: 1.0 };
    const normalized = normalizeStorePayload(payload, defaultPayload);
    expect(normalized).toEqual({ saturation: 1.0, contrast: 0.8 });
  });

  it('dovrebbe identificare se i payload sono equivalenti (entro la tolleranza numerica)', () => {
    const p1 = { saturation: 1.0, contrast: 1.0 };
    const p2 = { saturation: 1.00000001, contrast: 1.0 };
    const defaultPayload = { saturation: 1.0, contrast: 1.0 };
    expect(areStorePayloadsEqual(p1, p2, defaultPayload)).toBe(true);
  });

  it('dovrebbe identificare se i payload non sono equivalenti', () => {
    const p1 = { saturation: 1.0, contrast: 1.0 };
    const p2 = { saturation: 1.1, contrast: 1.0 };
    const defaultPayload = { saturation: 1.0, contrast: 1.0 };
    expect(areStorePayloadsEqual(p1, p2, defaultPayload)).toBe(false);
  });

  it('dovrebbe applicare il payload modificando direttamente le properties .value degli store', () => {
    const saturationObj = { value: 1.0 };
    const storeState = { saturation: saturationObj, contrast: 1.0 };
    const defaultPayload = { saturation: 1.0, contrast: 1.0 };
    const customPayload = { saturation: 1.5, contrast: 0.8 };

    const target = applyStorePayload(storeState, defaultPayload, customPayload);
    expect(target).toEqual({ saturation: 1.5, contrast: 0.8 });
    expect(saturationObj.value).toBe(1.5);
  });

  it('dovrebbe sincronizzare i parametri verso il modulo nativo Nitro', () => {
    const mockNitroConfig = { saturation: 1.0, contrast: 1.0 };
    (getNitroConfig as jest.Mock).mockReturnValue(mockNitroConfig);

    const payload = { saturation: 1.5, contrast: 0.8, nonNativeParam: 42 };
    syncPayloadToNitro(payload);

    expect(mockNitroConfig.saturation).toBe(1.5);
    expect(mockNitroConfig.contrast).toBe(0.8);
    expect((mockNitroConfig as any).nonNativeParam).toBeUndefined();
  });
});
