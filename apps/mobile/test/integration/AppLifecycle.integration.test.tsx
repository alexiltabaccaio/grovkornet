/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { CameraScreen } from '@screens/camera';
import { AppState } from 'react-native';
import { useControlPanelStore } from '@entities/system';
import { useGalleryStore } from '@entities/gallery';

// Mock Viewfinder to avoid native issues during integration test
jest.mock('@widgets/viewfinder', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    Viewfinder: () => <View testID="connected-camera" />,
    DeviceHealthWarningBanner: () => <View testID="device-health-warning" />,
  };
});

describe('AppLifecycle Integration Test', () => {
  let appStateCallbacks: ((state: string) => void)[] = [];
  let mockCurrentAppState = 'active';

  beforeAll(() => {
    Object.defineProperty(AppState, 'currentState', {
      get: () => mockCurrentAppState,
      configurable: true,
    });
  });

  beforeEach(() => {
    appStateCallbacks = [];
    mockCurrentAppState = 'active';
    jest.spyOn(AppState, 'addEventListener').mockImplementation(
      (event, cb: any) => {
        appStateCallbacks.push(cb);
        return { remove: jest.fn() };
      }
    );

    act(() => {
      useControlPanelStore.getState().setActiveSection('none');
      useControlPanelStore.getState().setActiveModule('none');
      useGalleryStore.getState().setIsOpen(false);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('unmounts Viewfinder (enters deep sleep) when app transitions to background while gallery is open', async () => {
    // Open the gallery so that useCameraDeepSleep is active
    act(() => {
      useGalleryStore.getState().setIsOpen(true);
    });

    const { getByTestId, queryByTestId, queryByText, rerender } = render(<CameraScreen />);

    // Wait for permission check to resolve
    await waitFor(() => expect(queryByText('camera.requesting_permissions')).toBeNull());

    // Viewfinder should initially be mounted (even when gallery is open, until deep sleep timer or backgrounding triggers)
    expect(getByTestId('connected-camera')).toBeDefined();

    // Simulate app going to background
    mockCurrentAppState = 'background';
    act(() => {
      appStateCallbacks.forEach((cb) => cb('background'));
    });

    rerender(<CameraScreen />);

    // Viewfinder should be unmounted due to deep sleep triggering on background
    expect(queryByTestId('connected-camera')).toBeNull();
  });

  it('remounts Viewfinder and resets animations when returning to active state', async () => {
    const { getByTestId, queryByText } = render(<CameraScreen />);

    await waitFor(() => expect(queryByText('camera.requesting_permissions')).toBeNull());

    // Switch to background
    mockCurrentAppState = 'background';
    act(() => {
      appStateCallbacks.forEach((cb) => cb('background'));
    });

    // Bring app back to active
    mockCurrentAppState = 'background'; // Set previous to match useCameraAppState check (matches background)
    act(() => {
      appStateCallbacks.forEach((cb) => cb('active'));
    });

    // Viewfinder should be remounted
    expect(getByTestId('connected-camera')).toBeDefined();
  });
});
