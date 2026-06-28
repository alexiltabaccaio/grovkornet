/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { CameraScreen } from '@screens/camera';
import * as MMKVModule from 'react-native-mmkv';
import { usePreferencesStore } from '@entities/preferences';
import { usePresetStore } from '@entities/preset';

// Mock Viewfinder to avoid native issues during integration test
jest.mock('@widgets/viewfinder', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    Viewfinder: () => <View testID="connected-camera" />,
    DeviceHealthWarningBanner: () => <View testID="device-health-warning" />,
  };
});

describe('StateHydration Integration Test', () => {
  const mockGlobalRegistry = (MMKVModule as any)._globalStores;

  beforeEach(() => {
    // Clear global stores
    mockGlobalRegistry.forEach((storeMap: Map<string, string>) => {
      storeMap.clear();
    });

    act(() => {
      usePreferencesStore.persist.clearStorage();
      usePresetStore.persist.clearStorage();
    });
  });

  it('hydrates preferences and presets from MMKV and applies them on start', async () => {
    // 1. Setup MMKV stores
    const prefStoreMap = mockGlobalRegistry.get('grovkornet-global-preferences');
    expect(prefStoreMap).toBeDefined();
    
    const prefState = {
      state: {
        fpsSetting: 30,
        aspectRatio: 2,
        language: 'it',
      },
      version: 0,
    };
    prefStoreMap.set('grovkornet-preferences-storage', JSON.stringify(prefState));

    const presetStoreMap = mockGlobalRegistry.get('grovkornet-presets');
    expect(presetStoreMap).toBeDefined();

    const mockPresetState = {
      state: {
        userPresets: [
          {
            id: 'custom-preset-id',
            name: 'Hydrated Vintage Preset',
            payload: {
              film: { saturation: 1.2, contrast: 1.1 },
            },
            isFavorite: true,
            inQuickSelect: true,
            createdAt: Date.now(),
            thumbnailUri: 'file:///vintage.jpg',
          },
        ],
        activePresetId: 'custom-preset-id',
        customizedPayload: null,
      },
      version: 0,
    };
    presetStoreMap.set('grovkornet-presets-storage', JSON.stringify(mockPresetState));

    // 2. Rehydrate stores explicitly to simulate app mount initialization
    await act(async () => {
      await usePreferencesStore.persist.rehydrate();
      await usePresetStore.persist.rehydrate();
    });

    // 3. Render CameraScreen
    const { queryByText } = render(<CameraScreen />);

    // Wait for permission check to resolve
    await waitFor(() => expect(queryByText('camera.requesting_permissions')).toBeNull());

    // 4. Verify stores hold the hydrated values
    expect(usePreferencesStore.getState().fpsSetting).toBe(30);
    expect(usePreferencesStore.getState().aspectRatio).toBe(2);
    expect(usePreferencesStore.getState().language).toBe('it');

    expect(usePresetStore.getState().activePresetId).toBe('custom-preset-id');
    expect(usePresetStore.getState().userPresets[0].name).toBe('Hydrated Vintage Preset');
  });
});
