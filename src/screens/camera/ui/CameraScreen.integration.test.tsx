/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { CameraScreen } from './CameraScreen';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useCameraEffectsStore } from '@features/camera-controls/model/useCameraEffectsStore';

// Mock ConnectedFilmCamera to avoid native issues during integration test
jest.mock('@features/camera-controls', () => {
  const actual = jest.requireActual('@features/camera-controls');
  const { View } = require('react-native');
  return {
    ...actual,
    ConnectedFilmCamera: (_props: any) => <View testID="connected-camera" />,
  };
});

describe('CameraScreen Integration', () => {
  beforeEach(() => {
    // Reset stores
    act(() => {
      useUIStore.getState().setActiveTab('none');
      useUIStore.getState().setActiveModule('none');
      useCameraEffectsStore.getState().resetTool('iso');
    });
  });

  it('renders correctly and handles tab switching', async () => {
    const { getByText, queryByText } = render(<CameraScreen />);

    // Wait for permissions to be resolved (mocked as granted)
    await waitFor(() => expect(queryByText('camera.requesting_permissions')).toBeNull());

    // Check if Footer tabs are present
    const exposureTab = getByText(/tabs\.exposure/i);
    expect(exposureTab).toBeDefined();

    // Click on Exposure tab
    fireEvent.press(exposureTab);

    // Verify UI Store updated
    expect(useUIStore.getState().activeTab).toBe('exposure');
    expect(useUIStore.getState().activeModule).toBe('manual_exposure');

    // Verify ManualExposureModule components appear
    await waitFor(() => expect(getByText(/parameters\.iso/i)).toBeDefined());
  });

  it('updates camera store when interaction happens', async () => {
    const { getByText } = render(<CameraScreen />);
    
    // Switch to exposure tab
    await act(async () => {
      fireEvent.press(getByText(/tabs\.exposure/i));
    });

    // Find ISO control
    const isoControl = getByText(/parameters\.iso/i);
    
    // Simulate press on ISO control to make it active
    fireEvent.press(isoControl);
    expect(useUIStore.getState().activeParameter).toBe('iso');

    // Directly test store integration (since Slider interaction is complex to mock/fire in unit test)
    act(() => {
      useCameraEffectsStore.getState().setIso(800);
    });

    expect(useCameraEffectsStore.getState().iso.value).toBe(800);
    expect(useCameraEffectsStore.getState().isoAuto.value).toBe(false);
  });
});
