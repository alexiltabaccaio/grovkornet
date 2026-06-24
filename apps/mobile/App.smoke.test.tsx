import React from 'react';
import { render } from '@testing-library/react-native';
import App from './App';
import { usePreferencesStore } from '@entities/preferences';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { useCameraStore } from '@entities/camera';
import { usePresetStore } from '@entities/preset';
import { applyPreset, initPreferenceSync } from '@features/system-settings';
import { initNativeSync } from '@features/camera-controls';
import i18n from 'i18next';

// Mock Expo StatusBar
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

// Mock system UI background
jest.mock('expo-system-ui', () => ({
  setBackgroundColorAsync: jest.fn().mockResolvedValue(true),
}));

// Mock System Settings features
jest.mock('@features/system-settings', () => ({
  applyPreset: jest.fn(),
  initPreferenceSync: jest.fn(),
}));

// Mock Camera Screen
jest.mock('@screens/camera', () => ({
  CameraScreen: () => null,
}));

// Mock Camera Controls features
jest.mock('@features/camera-controls', () => ({
  initNativeSync: jest.fn(),
}));


// Mock Preset Thumbnails feature
jest.mock('@features/preset-thumbnails', () => ({
  initThumbnailGenerator: jest.fn(() => jest.fn()), // Returns unsubscribe fn
}));

// Mock i18next core client
jest.mock('i18next', () => {
  const mock = {
    use: jest.fn().mockReturnThis(),
    init: jest.fn().mockResolvedValue(true),
    changeLanguage: jest.fn().mockResolvedValue(true),
    default: null as any,
  };
  mock.default = mock;
  return mock;
});

jest.mock('@grovkornet/engine', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const mockEmitter = {
    addListener: jest.fn((event, callback) => {
      mockEmitter.listeners[event] = callback;
      return { remove: jest.fn() };
    }),
    listeners: {} as Record<string, Function>,
  };
  (global as any).__mockEventEmitter = mockEmitter;

  return {
    NativeCameraEventEmitter: mockEmitter,
    resumeStream: jest.fn().mockResolvedValue(undefined),
    pauseStream: jest.fn().mockResolvedValue(undefined),
    verifyGrovkornetAuthenticity: jest.fn().mockResolvedValue(true),
    generatePresetPreview: jest.fn().mockResolvedValue('file:///cache/preset_preview_mock.jpg'),
    deleteFile: jest.fn().mockResolvedValue(true),
    CameraErrorCode: {
      UNKNOWN: 'UNKNOWN',
      INITIALIZATION_FAILED: 'INITIALIZATION_FAILED',
      CAMERA_NOT_FOUND: 'CAMERA_NOT_FOUND',
    },
    CAMERA_ERROR_DETAILS: {},
    NativeFilmCameraView: React.forwardRef((props: any, ref: any) => React.createElement(View, { ref, ...props })),
  };
});

const mockEventEmitter = (global as any).__mockEventEmitter;



describe('App Bootstrap Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset stores to default state
    usePreferencesStore.setState({
      resolutionSetting: null,
      fpsSetting: null,
      aspectRatio: null,
      force60fpsCrop: null,
      previewQuality: null,
      language: null,
      cameraId: null,
      cameraAuto: null,
      focusDistance: null,
      focusAuto: null,
      hapticsEnabled: true,
    });
    
    usePresetStore.setState({
      userPresets: [],
    });
  });

  it('renders without crashing and initializes sync managers', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeDefined();
    expect(initNativeSync).toHaveBeenCalled();
    expect(initPreferenceSync).toHaveBeenCalled();
  });

  it('loads and restores preferences to stores on mount', () => {
    usePreferencesStore.setState({
      resolutionSetting: 2,
      fpsSetting: 24,
      aspectRatio: 1,
      force60fpsCrop: 1,
      previewQuality: 0,
      language: 'it',
      cameraId: 'rear-0',
      cameraAuto: true,
      focusDistance: 0.8,
      focusAuto: false,
      hapticsEnabled: true,
    });

    render(<App />);

    const bodyStore = useBodyStore.getState();
    const lensStore = useLensStore.getState();

    expect(bodyStore.resolutionSetting.value).toBe(2);
    expect(bodyStore.fpsSetting.value).toBe(24);
    expect(bodyStore.aspectRatio.value).toBe(1);
    expect(bodyStore.force60fpsCrop.value).toBe(1);
    expect(bodyStore.previewQuality.value).toBe(0);
    expect(i18n.changeLanguage).toHaveBeenCalledWith('it');
    expect(lensStore.cameraId).toBe('rear-0');
    expect(lensStore.cameraAuto).toBe(true);
    expect(lensStore.focusDistance.value).toBe(0.8);
    expect(lensStore.focusAuto.value).toBe(false);
  });

  it('applies favorite preset on startup if defined', () => {
    const favoritePreset = {
      id: 'my-fav-preset',
      name: 'Cinematic Dream',
      payload: {} as any,
      isFavorite: true,
      inQuickSelect: false,
      createdAt: Date.now(),
    };

    usePresetStore.setState({
      userPresets: [favoritePreset],
    });

    render(<App />);
    expect(applyPreset).toHaveBeenCalledWith('my-fav-preset');
  });

  it('applies default preset on startup if no favorite exists', () => {
    const randomPreset = {
      id: 'some-preset',
      name: 'Vivid',
      payload: {} as any,
      isFavorite: false,
      inQuickSelect: false,
      createdAt: Date.now(),
    };

    usePresetStore.setState({
      userPresets: [randomPreset],
    });

    render(<App />);
    expect(applyPreset).toHaveBeenCalledWith('default');
  });

  it('subscribes to onDeviceHealthUpdate and updates camera store state on event dispatch', () => {
    render(<App />);
    
    expect(mockEventEmitter.addListener).toHaveBeenCalledWith('onDeviceHealthUpdate', expect.any(Function));
    const callback = mockEventEmitter.listeners['onDeviceHealthUpdate'];
    expect(callback).toBeDefined();

    // Trigger normal health state
    callback({ thermalState: 'normal', isLowRam: false });
    expect(useCameraStore.getState().thermalState).toBe('normal');
    expect(useCameraStore.getState().isLowRam).toBe(false);

    // Trigger thermal warning state with low memory
    callback({ thermalState: 'critical', isLowRam: true });
    expect(useCameraStore.getState().thermalState).toBe('critical');
    expect(useCameraStore.getState().isLowRam).toBe(true);
  });
});

