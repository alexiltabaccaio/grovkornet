import { usePresetStore, Preset, PresetPayload, FilmPresetPayload, BodyPresetPayload, DEFAULT_PRESET_PAYLOAD, DEFAULT_FILM_PAYLOAD, DEFAULT_BODY_PAYLOAD } from '@entities/preset';
import { useFilmStore } from '@entities/film';
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
    inQuickSelect: false,
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
