/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { CameraScreen } from '@screens/camera';
import { PermissionsAndroid, Platform } from 'react-native';

// Mock Viewfinder to avoid native issues during integration test
jest.mock('@widgets/viewfinder', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    Viewfinder: () => <View testID="connected-camera" />,
    DeviceHealthWarningBanner: () => <View testID="device-health-warning" />,
  };
});

describe('PermissionsFlow Integration Test', () => {
  beforeEach(() => {
    Platform.OS = 'android';
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders fallback UI when permission is denied, and works when permission is granted', async () => {
    // 1. First scenario: Permission is denied
    const requestSpy = jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(
      PermissionsAndroid.RESULTS.DENIED
    );

    const { toJSON, queryByTestId, rerender } = render(<CameraScreen />);

    // Wait for the async permission request to complete
    await waitFor(() => expect(requestSpy).toHaveBeenCalled());

    // UI should show the fallback empty view
    expect(queryByTestId('connected-camera')).toBeNull();
    expect(toJSON()).toEqual({
      type: 'View',
      props: { style: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0e0e0e' } },
      children: null,
    });

    // 2. Second scenario: Rerender/Re-mount when permission is granted
    requestSpy.mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);
    
    // Remount by calling rerender (simulates app restarting or re-checking permissions)
    rerender(<CameraScreen />);
    
    await waitFor(() => {
      expect(queryByTestId('connected-camera')).toBeDefined();
    });
  });
});
