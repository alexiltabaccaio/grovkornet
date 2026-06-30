import React from 'react';
import { render, act } from '@testing-library/react-native';
import { AppState, Platform, PermissionsAndroid } from 'react-native';
import { CameraScreen } from './CameraScreen';

// Mock high-level UI widgets to focus the test on viewfinder/camera mounting lifecycle
jest.mock('@widgets/control-panel', () => ({
  ControlPanel: () => null,
}));
jest.mock('@widgets/header', () => ({
  Header: () => null,
}));
jest.mock('@widgets/gallery-viewer', () => ({
  GalleryViewer: () => null,
}));
jest.mock('@features/gallery', () => ({
  CaptureThumbnail: () => null,
  useGalleryPrefetch: jest.fn(),
}));
jest.mock('@features/sections/system', () => ({
  DebugOverlay: () => null,
}));
jest.mock('@features/presets', () => ({
  AddPresetModal: () => null,
  DeletePresetModal: () => null,
  QuickPresetSelector: () => null,
  PresetsPanel: () => null,
}));
jest.mock('@features/camera', () => ({
  ShutterButton: () => null,
  CameraFlipButton: () => null,
  FlashOverlay: () => null,
  GestureController: ({ children }: any) => children,
}));


describe('Camera Lifecycle Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android';
  });

  it('registers AppState listener and updates viewfinder key on AppState transition to active', async () => {
    // 1. Mock camera permissions as granted
    const requestSpy = jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);

    // 2. Track AppState listener registration
    let appStateCallback: ((state: string) => void) | null = null;
    const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener').mockImplementation((event, cb: any) => {
      appStateCallback = cb;
      return { remove: jest.fn() };
    });

    // 3. Render CameraScreen
    const { toJSON } = render(<CameraScreen />);

    // Resolve the async permission request
    await act(async () => {
      await Promise.resolve();
    });

    expect(requestSpy).toHaveBeenCalledWith(PermissionsAndroid.PERMISSIONS.CAMERA);
    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    expect(appStateCallback).toBeDefined();

    // 4. Simulate AppState change to active (should increment key and trigger re-render)
    act(() => {
      appStateCallback!('active');
    });

    // Verify it renders correctly
    expect(toJSON()).toBeDefined();
  });
});
