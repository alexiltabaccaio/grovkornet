import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { CameraScreen } from '@screens/camera/ui/CameraScreen';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { useSystemStore } from '@entities/system';

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
      useSystemStore.getState().setActiveSection('none');
      useSystemStore.getState().setActiveModule('none');
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

    // Simulate capabilities update from native camera where maxFps is 30
    act(() => {
      fireEvent(nativeCamera, 'capabilitiesUpdate', {
        nativeEvent: {
          maxFps: 30,
          supportsFocus: false,
          isoMin: 100,
          isoMax: 1600,
          availableCameras: [{ id: 'ultra-wide', focalLength: 13, focalLength35mm: 13 }],
        },
      });
    });

    // Verify hardware store capabilities updated correctly
    expect(useBodyStore.getState().capabilities.maxFps).toBe(30);
    expect(useLensStore.getState().capabilities.supportsFocus).toBe(false);

    // Verify fpsSetting automatically adapted to maxFps (30)
    expect(useBodyStore.getState().fpsSetting.value).toBe(30);
  });
});
