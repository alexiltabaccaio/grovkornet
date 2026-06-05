import { usePresetStore, Preset, PresetPayload, FilmPresetPayload, BodyPresetPayload, DEFAULT_PRESET_PAYLOAD, DEFAULT_FILM_PAYLOAD, DEFAULT_BODY_PAYLOAD } from '@entities/preset';
import { useFilmStore, getNitroConfig } from '@entities/film';
import { useBodyStore } from '@entities/body';

/**
 * Snapshots the current runtime values of FilmStore and BodyStore
 */
export const snapshotCurrentPayload = (): PresetPayload => {
  const filmStore = useFilmStore.getState();
  const bodyStore = useBodyStore.getState();

  const filmPayload = {} as Record<keyof FilmPresetPayload, unknown>;
  Object.keys(DEFAULT_FILM_PAYLOAD).forEach((key) => {
    const k = key as keyof FilmPresetPayload;
    const val = filmStore[k] as unknown;
    const hasValue = val && typeof val === 'object' && 'value' in val;
    filmPayload[k] = hasValue
      ? (val as Record<string, unknown>).value
      : DEFAULT_FILM_PAYLOAD[k];
  });

  const bodyPayload = {} as Record<keyof BodyPresetPayload, unknown>;
  Object.keys(DEFAULT_BODY_PAYLOAD).forEach((key) => {
    const k = key as keyof BodyPresetPayload;
    const val = bodyStore[k] as unknown;
    const hasValue = val && typeof val === 'object' && 'value' in val;
    bodyPayload[k] = hasValue
      ? (val as Record<string, unknown>).value
      : DEFAULT_BODY_PAYLOAD[k];
  });

  return {
    film: filmPayload as FilmPresetPayload,
    body: bodyPayload as BodyPresetPayload,
  };
};

const normalizePayload = (p: PresetPayload): PresetPayload => {
  const film: Record<string, unknown> = { ...DEFAULT_FILM_PAYLOAD };
  if (p.film) {
    Object.keys(p.film).forEach((key) => {
      const k = key as keyof FilmPresetPayload;
      if (p.film[k] !== undefined && p.film[k] !== null) {
        film[k] = p.film[k];
      }
    });
  }

  const body: Record<string, unknown> = { ...DEFAULT_BODY_PAYLOAD };
  if (p.body) {
    Object.keys(p.body).forEach((key) => {
      const k = key as keyof BodyPresetPayload;
      if (p.body[k] !== undefined && p.body[k] !== null) {
        body[k] = p.body[k];
      }
    });
  }

  return {
    film: film as unknown as FilmPresetPayload,
    body: body as unknown as BodyPresetPayload,
  };
};

export const arePayloadsEqual = (p1: PresetPayload, p2: PresetPayload): boolean => {
  if (!p1 || !p2) return false;

  const n1 = normalizePayload(p1);
  const n2 = normalizePayload(p2);

  const filmKeys = Object.keys(DEFAULT_FILM_PAYLOAD) as Array<keyof FilmPresetPayload>;
  for (const key of filmKeys) {
    // Ignore numeric values of parameters that are in Auto mode for BOTH payloads
    if ((key === 'temperature' || key === 'tint') && n1.film.temperatureAuto && n2.film.temperatureAuto) continue;
    if (key === 'contrast' && n1.film.contrastAuto && n2.film.contrastAuto) continue;
    if (key === 'blackLevel' && n1.film.blackLevelAuto && n2.film.blackLevelAuto) continue;
    if (key === 'highlights' && n1.film.highlightsAuto && n2.film.highlightsAuto) continue;
    if (key === 'pivot' && n1.film.pivotAuto && n2.film.pivotAuto) continue;
    if (key === 'noiseReductionMode' && n1.film.noiseReductionAuto && n2.film.noiseReductionAuto) continue;

    const val1 = n1.film[key];
    const val2 = n2.film[key];
    if (typeof val1 === 'number' && typeof val2 === 'number') {
      if (Math.abs(val1 - val2) >= 0.000001) return false;
    } else if (val1 !== val2) {
      return false;
    }
  }

  const bodyKeys = Object.keys(DEFAULT_BODY_PAYLOAD) as Array<keyof BodyPresetPayload>;
  for (const key of bodyKeys) {
    if (key === 'iso' && n1.body.isoAuto && n2.body.isoAuto) continue;
    if (key === 'shutterSpeed' && n1.body.shutterSpeedAuto && n2.body.shutterSpeedAuto) continue;
    if (key === 'ev' && n1.body.evAuto && n2.body.evAuto) continue;

    const val1 = n1.body[key];
    const val2 = n2.body[key];
    if (typeof val1 === 'number' && typeof val2 === 'number') {
      if (Math.abs(val1 - val2) >= 0.000001) return false;
    } else if (val1 !== val2) {
      return false;
    }
  }

  return true;
};

/**
 * Applies a preset by updating the FilmStore and BodyStore shared values
 */
export const applyPreset = (id: string): void => {
  const store = usePresetStore.getState();
  let payload: PresetPayload | null = null;

  if (id === 'default') {
    payload = DEFAULT_PRESET_PAYLOAD;
  } else if (id === 'customized') {
    payload = store.customizedPayload;
  } else {
    const preset = store.userPresets.find((p) => p.id === id);
    if (preset) {
      payload = preset.payload;
    }
  }

  if (!payload) return;

  store.setApplyingPreset(true);
  store.setActivePresetId(id);

  // Do not clear customized payload/thumbnail when switching presets,
  // so the user can easily switch back to their "Custom" preset
  // without losing their unsaved changes.

  // Safe Merge & direct update of Film shared values
  const filmStore = useFilmStore.getState();
  const targetFilm = { ...DEFAULT_FILM_PAYLOAD, ...payload.film };
  Object.keys(targetFilm).forEach((key) => {
    const k = key as keyof FilmPresetPayload;
    const storeItem = filmStore[k] as unknown;
    if (storeItem && typeof storeItem === 'object' && 'value' in storeItem) {
      (storeItem as Record<string, unknown>).value = targetFilm[k];
    }
  });

  // Sync Nitro-based parameters
  getNitroConfig().saturation = targetFilm.saturation;

  // Safe Merge & direct update of Body shared values
  const bodyStore = useBodyStore.getState();
  const targetBody = { ...DEFAULT_BODY_PAYLOAD, ...payload.body };
  Object.keys(targetBody).forEach((key) => {
    const k = key as keyof BodyPresetPayload;
    const storeItem = bodyStore[k] as unknown;
    if (storeItem && typeof storeItem === 'object' && 'value' in storeItem) {
      (storeItem as Record<string, unknown>).value = targetBody[k];
    }
  });

  store.setApplyingPreset(false);
};

/**
 * Creates and saves a new user preset
 */
export const addPreset = (name: string, thumbnailUri?: string): void => {
  const store = usePresetStore.getState();
  const payload = store.customizedPayload ?? snapshotCurrentPayload();

  const newPreset: Preset = {
    id: Date.now().toString(),
    name,
    payload,
    isFavorite: false,
    inQuickSelect: true,
    createdAt: Date.now(),
    thumbnailUri,
  };

  store.addUserPreset(newPreset);
};

/**
 * Deletes a user preset and falls back to default if the deleted preset was active
 */
export const removePreset = (id: string): void => {
  const store = usePresetStore.getState();

  if (id === 'customized') {
    store.setCustomizedPayload(null);
    store.setCustomizedThumbnailUri(null);
    applyPreset('default');
    return;
  }

  const wasActive = store.activePresetId === id;

  store.removeUserPreset(id);

  if (wasActive) {
    applyPreset('default');
  }
};

/**
 * Marks the active preset as customized when a parameter changes manually
 */
export const markAsCustomized = (): void => {
  const store = usePresetStore.getState();
  if (store.isApplyingPreset) return;

  const payload = snapshotCurrentPayload();

  // Check if it matches the default preset
  if (arePayloadsEqual(payload, DEFAULT_PRESET_PAYLOAD)) {
    store.setActivePresetId('default');
    store.setCustomizedPayload(null);
    store.setCustomizedThumbnailUri(null);
    return;
  }

  // Check if it matches any user preset
  const matchingUserPreset = store.userPresets.find((preset) =>
    arePayloadsEqual(payload, preset.payload)
  );

  if (matchingUserPreset) {
    store.setActivePresetId(matchingUserPreset.id);
    store.setCustomizedPayload(null);
    store.setCustomizedThumbnailUri(null);
    return;
  }

  store.setActivePresetId('customized');
  store.setCustomizedPayload(payload);
};

/**
 * Navigates to the next quick preset
 */
export const nextQuickPreset = (): void => {
  const store = usePresetStore.getState();
  const list = store.getQuickSelectList();
  if (list.length <= 1) return;
  const currentIndex = list.findIndex((p) => p.id === store.activePresetId);
  const nextIndex = (currentIndex + 1) % list.length;
  applyPreset(list[nextIndex].id);
};

/**
 * Navigates to the previous quick preset
 */
export const prevQuickPreset = (): void => {
  const store = usePresetStore.getState();
  const list = store.getQuickSelectList();
  if (list.length <= 1) return;
  const currentIndex = list.findIndex((p) => p.id === store.activePresetId);
  const prevIndex = (currentIndex - 1 + list.length) % list.length;
  applyPreset(list[prevIndex].id);
};
