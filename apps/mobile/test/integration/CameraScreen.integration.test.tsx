 

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { CameraScreen } from '@screens/camera';
import { useControlPanelStore } from '@entities/system';
import { useBodyStore } from '@entities/body';

// Mock Viewfinder to avoid native issues during integration test
jest.mock('@widgets/viewfinder', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    Viewfinder: (_props: unknown) => <View testID="connected-camera" />,
    DeviceHealthWarningBanner: (_props: unknown) => <View testID="device-health-warning" />,
  };
});

describe('CameraScreen Integration', () => {
  beforeEach(() => {
    // Reset stores
    act(() => {
      useControlPanelStore.getState().setActiveSection('none');
      useControlPanelStore.getState().setActiveModule('none');
      // No global reset needed if we just set values in tests
    });
  });

  it('renders correctly and handles section switching', async () => {
    const { getByLabelText, queryByText, getAllByText } = render(<CameraScreen />);

    // Wait for permissions to be resolved (mocked as granted)
    await waitFor(() => expect(queryByText('camera.requesting_permissions')).toBeNull());

    // Check if Footer sections are present
    const exposureSection = getByLabelText(/sections\.body/i);
    expect(exposureSection).toBeDefined();

    // Click on Exposure section
    fireEvent.press(exposureSection);

    // Verify UI Store updated
    expect(useControlPanelStore.getState().activeSection).toBe('body');
    expect(useControlPanelStore.getState().activeModule).toBe('exposure');

    // Verify ManualExposureModule components appear
    await waitFor(() => expect(getAllByText(/parameters\.iso/i)[0]).toBeDefined());
  });

  it('updates camera store when interaction happens', () => {
    const { getByLabelText, getAllByText } = render(<CameraScreen />);
    
    // Switch to exposure section
    act(() => {
      fireEvent.press(getByLabelText(/sections\.body/i));
    });

    // Find ISO control
    const isoControl = getAllByText(/parameters\.iso/i)[0];
    
    // Reset active parameter to none to test activation on press
    act(() => {
      useControlPanelStore.getState().setActiveParameter('none');
    });

    // Simulate press on ISO control to make it active
    fireEvent.press(isoControl);
    expect(useControlPanelStore.getState().activeParameter).toBe('iso');

    // Directly test store integration (since Slider interaction is complex to mock/fire in unit test)
    act(() => {
      useBodyStore.getState().setIso(800);
    });

    expect(useBodyStore.getState().iso.value).toBe(800);
    expect(useBodyStore.getState().isoAuto.value).toBe(false);
  });
});
