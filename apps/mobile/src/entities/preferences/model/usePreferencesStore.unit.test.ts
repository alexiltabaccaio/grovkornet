import { usePreferencesStore } from './usePreferencesStore';

describe('usePreferencesStore', () => {
  beforeEach(() => {
    // Reset store state
    usePreferencesStore.setState({
      fpsSetting: null,
      resolutionSetting: null,
      aspectRatio: null,
      force60fpsCrop: null,
      language: null,
      cameraId: null,
      cameraAuto: null,
      focusDistance: null,
      focusAuto: null,
      hapticsEnabled: null,
    });
  });

  it('initializes with default null values', () => {
    const state = usePreferencesStore.getState();
    expect(state.fpsSetting).toBeNull();
    expect(state.resolutionSetting).toBeNull();
    expect(state.aspectRatio).toBeNull();
    expect(state.force60fpsCrop).toBeNull();
    expect(state.language).toBeNull();
    expect(state.cameraId).toBeNull();
    expect(state.cameraAuto).toBeNull();
    expect(state.focusDistance).toBeNull();
    expect(state.focusAuto).toBeNull();
    expect(state.hapticsEnabled).toBeNull();
  });

  it('updates fpsSetting correctly', () => {
    usePreferencesStore.getState().setFpsSettingPref(60);
    expect(usePreferencesStore.getState().fpsSetting).toBe(60);
  });

  it('updates resolutionSetting correctly', () => {
    usePreferencesStore.getState().setResolutionSettingPref(1);
    expect(usePreferencesStore.getState().resolutionSetting).toBe(1);
  });

  it('updates aspectRatio correctly', () => {
    usePreferencesStore.getState().setAspectRatioPref(2);
    expect(usePreferencesStore.getState().aspectRatio).toBe(2);
  });

  it('updates force60fpsCrop correctly', () => {
    usePreferencesStore.getState().setForce60fpsCropPref(1);
    expect(usePreferencesStore.getState().force60fpsCrop).toBe(1);
  });

  it('updates language correctly', () => {
    usePreferencesStore.getState().setLanguagePref('it');
    expect(usePreferencesStore.getState().language).toBe('it');
  });

  it('updates cameraId correctly', () => {
    usePreferencesStore.getState().setCameraIdPref('0');
    expect(usePreferencesStore.getState().cameraId).toBe('0');
  });

  it('updates cameraAuto correctly', () => {
    usePreferencesStore.getState().setCameraAutoPref(true);
    expect(usePreferencesStore.getState().cameraAuto).toBe(true);
  });

  it('updates focusDistance correctly', () => {
    usePreferencesStore.getState().setFocusDistancePref(0.8);
    expect(usePreferencesStore.getState().focusDistance).toBe(0.8);
  });

  it('updates focusAuto correctly', () => {
    usePreferencesStore.getState().setFocusAutoPref(false);
    expect(usePreferencesStore.getState().focusAuto).toBe(false);
  });

  it('updates hapticsEnabled correctly', () => {
    usePreferencesStore.getState().setHapticsEnabledPref(true);
    expect(usePreferencesStore.getState().hapticsEnabled).toBe(true);
  });

  describe('Zustand Persist Configuration', () => {
    it('has the correct storage name and uses MMKV storage', () => {
      const persistOptions = (usePreferencesStore as any).persist?.getOptions();
      expect(persistOptions).toBeDefined();
      expect(persistOptions.name).toBe('grovkornet-preferences-storage');
      expect(persistOptions.storage).toBeDefined();
    });
  });
});
