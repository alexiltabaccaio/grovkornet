/* eslint-disable @typescript-eslint/no-require-imports */
 
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { CameraScreen } from '@screens/camera/ui/CameraScreen';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';

// Mock ConnectedFilmCamera to avoid native issues during integration test
jest.mock('@features/camera-controls', () => {
  const actual = jest.requireActual<{ ConnectedFilmCamera: unknown }>('@features/camera-controls');
  const { View } = require('react-native') as typeof import('react-native');
  return {
    ...actual,
    ConnectedFilmCamera: (_props: unknown) => <View testID="connected-camera" />,
  };
});

describe('CameraScreen Integration', () => {
  beforeEach(() => {
    // Reset stores
    act(() => {
      useUIStore.getState().setActiveSection('none');
      useUIStore.getState().setActiveModule('none');
      // No global reset needed if we just set values in tests
    });
  });

  it('renders correctly and handles section switching', async () => {
    const { getByLabelText, getByText, getAllByText, queryByText } = render(<CameraScreen />);

    // Wait for permissions to be resolved (mocked as granted)
    await waitFor(() => expect(queryByText('camera.requesting_permissions')).toBeNull());

    // Check if Footer sections are present
    const exposureSection = getByLabelText(/sections\.body/i) as unknown as { props: unknown };
    expect(exposureSection).toBeDefined();

    // Click on Exposure section
    fireEvent.press(exposureSection);

    // Verify UI Store updated
    expect(useUIStore.getState().activeSection).toBe('body');
    expect(useUIStore.getState().activeModule).toBe('exposure');

    // Verify ManualExposureModule components appear
    await waitFor(() => expect(getAllByText(/parameters\.iso/i)[0]).toBeDefined());
  });

  it('updates camera store when interaction happens', () => {
    const { getByLabelText, getAllByText } = render(<CameraScreen />);
    
    // Switch to exposure section
    act(() => {
      fireEvent.press(getByLabelText(/sections\.body/i) as unknown);
    });

    // Find ISO control
    const isoControl = getAllByText(/parameters\.iso/i)[0] as unknown as { props: unknown };
    
    // Reset active parameter to none to test activation on press
    act(() => {
      useUIStore.getState().setActiveParameter('none');
    });

    // Simulate press on ISO control to make it active
    fireEvent.press(isoControl);
    expect(useUIStore.getState().activeParameter).toBe('iso');

    // Directly test store integration (since Slider interaction is complex to mock/fire in unit test)
    act(() => {
      useHardwareStore.getState().setIso(800);
    });

    expect(useHardwareStore.getState().iso.value).toBe(800);
    expect(useHardwareStore.getState().isoAuto.value).toBe(false);
  });
});
