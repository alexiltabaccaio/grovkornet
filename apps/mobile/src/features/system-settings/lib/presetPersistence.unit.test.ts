import * as MMKVModule from 'react-native-mmkv';
import { usePresetStore } from '@entities/preset';
import { usePreferencesStore } from '@entities/preferences';
import { act } from '@testing-library/react-native';
import { addPreset } from './presetActions';

describe('Preset and Preferences MMKV Persistence Integration', () => {
  const mockGlobalRegistry = (MMKVModule as any)._globalStores;

  beforeEach(() => {
    // Clear the contents of all global mock stores while preserving their references
    mockGlobalRegistry.forEach((storeMap: Map<string, string>) => {
      storeMap.clear();
    });

    // Reset stores to initial state
    usePresetStore.persist.clearStorage();
    usePresetStore.setState({
      userPresets: [],
      activePresetId: 'default',
      customizedPayload: null,
    });

    usePreferencesStore.persist.clearStorage();
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

  it('should persist user presets when a new preset is added', () => {
    // 1. Initially userPresets should be empty
    expect(usePresetStore.getState().userPresets).toHaveLength(0);

    // 2. Add a new preset
    act(() => {
      addPreset('Vintage Look', 'file:///vintage.jpg');
    });

    // 3. Verify it is added to the store state
    const presets = usePresetStore.getState().userPresets;
    expect(presets).toHaveLength(1);
    expect(presets[0].name).toBe('Vintage Look');
    expect(presets[0].thumbnailUri).toBe('file:///vintage.jpg');

    // 4. Verify that it was written to MMKV
    const presetsStoreMap = mockGlobalRegistry.get('grovkornet-presets');
    expect(presetsStoreMap).toBeDefined();
    
    const serializedState = presetsStoreMap.get('grovkornet-presets-storage');
    expect(serializedState).toBeDefined();

    const parsed = JSON.parse(serializedState);
    expect(parsed.state.userPresets).toHaveLength(1);
    expect(parsed.state.userPresets[0].name).toBe('Vintage Look');
  });

  it('should restore presets correctly upon store rehydration', async () => {
    // 1. Manually write a preset to MMKV to simulate pre-existing data
    const storeMap = mockGlobalRegistry.get('grovkornet-presets');
    expect(storeMap).toBeDefined();

    const mockState = {
      state: {
        userPresets: [
          {
            id: '12345',
            name: 'Stored Preset',
            payload: {
              film: { saturation: 1.5, contrast: 1.2 },
              body: { iso: 400 },
            },
            isFavorite: true,
            inQuickSelect: true,
            createdAt: Date.now(),
            thumbnailUri: 'file:///thumb.jpg',
          },
        ],
        activePresetId: '12345',
        customizedPayload: null,
      },
      version: 0,
    };
    storeMap.set('grovkornet-presets-storage', JSON.stringify(mockState));

    // 2. Force rehydration of the store
    await act(async () => {
      await usePresetStore.persist.rehydrate();
    });

    // 3. Verify state is correctly populated from MMKV
    const state = usePresetStore.getState();
    expect(state.userPresets).toHaveLength(1);
    expect(state.userPresets[0].name).toBe('Stored Preset');
    expect(state.activePresetId).toBe('12345');
    expect(state.userPresets[0].isFavorite).toBe(true);
  });

  it('should persist preferences correctly when actions are performed', () => {
    expect(usePreferencesStore.getState().language).toBeNull();

    act(() => {
      usePreferencesStore.getState().setLanguagePref('it');
      usePreferencesStore.getState().setCameraAutoPref(false);
    });

    // Verify it is written to the preferences MMKV store
    const prefsMap = mockGlobalRegistry.get('grovkornet-global-preferences');
    expect(prefsMap).toBeDefined();

    const serialized = prefsMap.get('grovkornet-preferences-storage');
    const parsed = JSON.parse(serialized);
    expect(parsed.state.language).toBe('it');
    expect(parsed.state.cameraAuto).toBe(false);
  });
});
