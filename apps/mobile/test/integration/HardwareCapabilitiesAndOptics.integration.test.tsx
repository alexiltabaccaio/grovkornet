import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { CameraScreen } from '@screens/camera';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { useControlPanelStore } from '@entities/system';

jest.mock('@entities/lens/ui/NativeRenderer', () => {
  const ReactActual = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    NativeRenderer: ReactActual.forwardRef((props: unknown, ref: unknown) => {
      ReactActual.useImperativeHandle(ref, () => ({
        takePhoto: jest.fn(),
      }));
      return <View testID="native-film-camera" {...(props as object)} />;
    }),
  };
});

describe('HardwareCapabilitiesAndOptics Integration', () => {
  beforeEach(() => {
    act(() => {
      useControlPanelStore.getState().setActiveSection('none');
      useControlPanelStore.getState().setActiveModule('none');
      useBodyStore.getState().setFpsSetting(60);
    });
  });

  it('updates capabilities and adapts FPS limits when camera capabilities change', async () => {
    const { getByTestId, queryByText } = render(<CameraScreen />);

    // Wait for permissions to be resolved
    await waitFor(() => expect(queryByText('camera.requesting_permissions')).toBeNull());

    const nativeCamera = getByTestId('native-film-camera');

    // Verify initial FPS setting is 60
    expect(useBodyStore.getState().fpsSetting.value).toBe(60);

    // Simulate capabilities update from native camera where maxFps is 30, minZoom is 1.0, maxZoom is 4.0
    act(() => {
      fireEvent(nativeCamera, 'capabilitiesUpdate', {
        nativeEvent: {
          maxFps: 30,
          supportsFocus: false,
          isoMin: 100,
          isoMax: 1600,
          availableCameras: [{ id: 'ultra-wide', focalLength: 13, focalLength35mm: 13 }],
          minZoom: 1.0,
          maxZoom: 4.0,
        },
      });
    });

    // Verify hardware store capabilities updated correctly
    expect(useBodyStore.getState().capabilities.maxFps).toBe(30);
    expect(useLensStore.getState().capabilities.supportsFocus).toBe(false);
    expect(useBodyStore.getState().capabilities.minZoom).toBe(1.0);
    expect(useBodyStore.getState().capabilities.maxZoom).toBe(4.0);

    // Verify fpsSetting automatically adapted to maxFps (30)
    expect(useBodyStore.getState().fpsSetting.value).toBe(30);

    // Set zoom to 5.0 (out of bounds)
    act(() => {
      useBodyStore.getState().setZoom(5.0);
    });
    // Check zoom is set to 5.0
    expect(useBodyStore.getState().zoom.value).toBe(5.0);

    // Simulate capabilities update capping zoom at 3.0
    act(() => {
      fireEvent(nativeCamera, 'capabilitiesUpdate', {
        nativeEvent: {
          maxFps: 30,
          supportsFocus: false,
          isoMin: 100,
          isoMax: 1600,
          availableCameras: [{ id: 'ultra-wide', focalLength: 13, focalLength35mm: 13 }],
          minZoom: 1.0,
          maxZoom: 3.0,
        },
      });
    });

    // Verify zoom auto-capped to 3.0
    expect(useBodyStore.getState().zoom.value).toBe(3.0);
  });
});
