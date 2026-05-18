/* eslint-disable @typescript-eslint/no-require-imports */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { CameraScreen } from '@screens/camera/ui/CameraScreen';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { useUIStore } from '@features/camera-controls/model/useUIStore';

jest.mock('@entities/camera/ui/NativeFilmCamera', () => {
  const ReactActual = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    NativeFilmCamera: ReactActual.forwardRef((props: unknown, ref: unknown) => {
      ReactActual.useImperativeHandle(ref, () => ({
        takePhoto: jest.fn(),
      }));
      return <View testID="native-film-camera" {...(props as object)} />;
    }),
  };
});

describe('SystemPreferencesAndTelemetry Integration', () => {
  beforeEach(() => {
    act(() => {
      useUIStore.getState().setActiveSection('none');
      useUIStore.getState().setActiveModule('none');
      useUIStore.getState().setIsDebugEnabled(false);
      useHardwareStore.getState().setDebugInfo(0, '1080p', 0);
    });
  });

  it('enables debug overlay and processes telemetry updates correctly', async () => {
    const { getByTestId, getByDisplayValue, queryByDisplayValue, queryByText } = render(<CameraScreen />);

    // Wait for permissions to be resolved
    await waitFor(() => expect(queryByText('camera.requesting_permissions')).toBeNull());

    // Verify debug overlay is initially not present
    expect(queryByDisplayValue(/FPS:/)).toBeNull();

    // Enable debug mode
    act(() => {
      useUIStore.getState().setIsDebugEnabled(true);
    });

    // Verify debug overlay appears with default values
    expect(getByDisplayValue(/FPS: 0/)).toBeDefined();

    const nativeCamera = getByTestId('native-film-camera');

    // Simulate debug telemetry update from native camera
    act(() => {
      fireEvent(nativeCamera, 'debugUpdate', {
        nativeEvent: {
          fps: 60,
          hwFps: 60,
          resolution: '3840x2160',
        },
      });
    });

    // Verify hardware store telemetry values updated correctly
    expect(useHardwareStore.getState().fps.value).toBe(60);
    expect(useHardwareStore.getState().hwFps.value).toBe(60);
    expect(useHardwareStore.getState().resolution.value).toBe('3840x2160');
  });
});
