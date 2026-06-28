/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, waitFor, act, fireEvent } from '@testing-library/react-native';
import { CameraScreen } from '@screens/camera';
import { useCameraStore } from '@entities/camera';
import { usePreferencesStore } from '@entities/preferences';

// Mock NativeRenderer to capture props passed to it
jest.mock('@entities/lens/ui/NativeRenderer', () => {
  const ReactActual = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    NativeRenderer: ReactActual.forwardRef((props: any, ref: any) => {
      ReactActual.useImperativeHandle(ref, () => ({
        takePhoto: jest.fn(),
      }));
      return <View testID="native-film-camera" {...props} />;
    }),
  };
});

describe('NativeErrorsAndThrottling Integration Test', () => {
  beforeEach(() => {
    act(() => {
      useCameraStore.getState().setThermalState('normal');
      usePreferencesStore.setState({
        fpsSetting: 60,
      });
    });
  });

  it('handles normal thermal state (no warnings, no throttling)', async () => {
    const { queryByTestId, queryByText, getByTestId } = render(<CameraScreen />);

    // Wait for permission check
    await waitFor(() => expect(queryByText('camera.requesting_permissions')).toBeNull());

    // Warning banner components should not exist
    expect(queryByTestId('device-health-warning-circle')).toBeNull();
    expect(queryByTestId('device-health-warning-banner')).toBeNull();

    // FPS should be at the preferred 60
    const nativeCamera = getByTestId('native-film-camera');
    expect(nativeCamera.props.animatedProps.targetFps).toBe(60);
  });

  it('displays warning banner and throttles FPS to 30 when thermalState is warning', async () => {
    const { getByTestId, queryByTestId, queryByText, rerender } = render(<CameraScreen />);

    await waitFor(() => expect(queryByText('camera.requesting_permissions')).toBeNull());

    // 1. Simulate thermal warning
    act(() => {
      useCameraStore.getState().setThermalState('warning');
    });

    // Rerender to apply state changes to UI
    rerender(<CameraScreen />);

    // Exclamation circle should now appear
    const warningCircle = getByTestId('device-health-warning-circle');
    expect(warningCircle).toBeDefined();

    // Warning text container should initially be hidden
    expect(queryByTestId('device-health-warning-banner')).toBeNull();

    // 2. Press exclamation circle to show warning message
    act(() => {
      fireEvent.press(warningCircle);
    });

    rerender(<CameraScreen />);

    // Warning banner text should appear
    const warningBanner = getByTestId('device-health-warning-banner');
    expect(warningBanner).toBeDefined();

    // Verify it translates to device_health.warning
    const warningText = queryByText('device_health.warning');
    expect(warningText).toBeDefined();

    // 3. Verify FPS is throttled to 30
    const nativeCamera = getByTestId('native-film-camera');
    expect(nativeCamera.props.animatedProps.targetFps).toBe(30);
  });

  it('displays critical warning banner and throttles FPS to 15 when thermalState is critical', async () => {
    const { getByTestId, queryByTestId, queryByText, rerender } = render(<CameraScreen />);

    await waitFor(() => expect(queryByText('camera.requesting_permissions')).toBeNull());

    // 1. Simulate critical thermal state
    act(() => {
      useCameraStore.getState().setThermalState('critical');
    });

    rerender(<CameraScreen />);

    const warningCircle = getByTestId('device-health-warning-circle');
    expect(warningCircle).toBeDefined();

    // 2. Press circle to show message
    act(() => {
      fireEvent.press(warningCircle);
    });

    rerender(<CameraScreen />);

    const warningBanner = getByTestId('device-health-warning-banner');
    expect(warningBanner).toBeDefined();

    const criticalText = queryByText('device_health.critical');
    expect(criticalText).toBeDefined();

    // 3. Verify FPS is throttled to 15
    const nativeCamera = getByTestId('native-film-camera');
    expect(nativeCamera.props.animatedProps.targetFps).toBe(15);
  });
});
