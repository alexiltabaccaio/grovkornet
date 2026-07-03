import { getNitroConfig } from '@entities/film';

export const AUTO_MAPPINGS: Record<string, string> = {
  temperature: 'temperatureAuto',
  tint: 'temperatureAuto',
  contrast: 'contrastAuto',
  blackLevel: 'blackLevelAuto',
  highlights: 'highlightsAuto',
  pivot: 'pivotAuto',
  noiseReductionMode: 'noiseReductionAuto',
  iso: 'isoAuto',
  shutterSpeed: 'shutterSpeedAuto',
  ev: 'evAuto',
};

export const snapshotStorePayload = <T extends object>(
  storeState: Record<string, unknown> | object,
  defaultPayload: T
): T => {
  const state = storeState as Record<string, unknown>;
  const payload = {} as Record<keyof T, unknown>;
  Object.keys(defaultPayload).forEach((key) => {
    const k = key as keyof T;
    const val = state[key];
    const hasValue = !!(val && typeof val === 'object' && 'value' in (val as Record<string, unknown>));
    payload[k] = hasValue
      ? (val as Record<string, unknown>).value
      : val !== undefined
      ? val
      : (defaultPayload as Record<keyof T, unknown>)[k];
  });
  return payload as T;
};

export const normalizeStorePayload = <T extends object>(
  payload: T | undefined,
  defaultPayload: T
): T => {
  const result = { ...defaultPayload };
  if (payload) {
    const p = payload as Record<string, unknown>;
    Object.keys(payload).forEach((key) => {
      if (p[key] !== undefined && p[key] !== null) {
        (result as Record<string, unknown>)[key] = p[key];
      }
    });
  }
  return result;
};

export const areStorePayloadsEqual = <T extends object>(
  n1: T,
  n2: T,
  defaultPayload: T
): boolean => {
  const keys = Object.keys(defaultPayload) as Array<keyof T>;
  const o1 = n1 as Record<string, unknown>;
  const o2 = n2 as Record<string, unknown>;
  for (const key of keys) {
    const keyStr = key as string;
    const autoKey = AUTO_MAPPINGS[keyStr];
    if (autoKey && o1[autoKey] && o2[autoKey]) {
      continue;
    }

    const val1 = o1[keyStr];
    const val2 = o2[keyStr];
    if (typeof val1 === 'number' && typeof val2 === 'number') {
      if (Math.abs(val1 - val2) >= 0.000001) return false;
    } else if (val1 !== val2) {
      return false;
    }
  }
  return true;
};

export const applyStorePayload = <T extends object>(
  storeState: Record<string, unknown> | object,
  defaultPayload: T,
  customPayload: T | undefined
): T => {
  const target = { ...defaultPayload, ...customPayload };
  const state = storeState as Record<string, unknown>;
  const t = target as Record<string, unknown>;
  Object.keys(target).forEach((key) => {
    const storeItem = state[key];
    if (storeItem && typeof storeItem === 'object' && 'value' in (storeItem as Record<string, unknown>)) {
      (storeItem as Record<string, unknown>).value = t[key];
    }
  });
  return target;
};

export const syncPayloadToNitro = (payload: Record<string, unknown> | object): void => {
  const nitroConfig = getNitroConfig();
  const p = payload as Record<string, unknown>;
  Object.keys(p).forEach((key) => {
    if (key in nitroConfig) {
      try {
        (nitroConfig as unknown as Record<string, unknown>)[key] = p[key];
      } catch {
        // Ignored
      }
    }
  });
};
