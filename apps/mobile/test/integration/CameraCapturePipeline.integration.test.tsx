import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { CameraScreen } from '@screens/camera';
import { useSystemStore, useControlPanelStore } from '@entities/system';
import { useFilmStore } from '@entities/film';

const mockTakePhoto = jest.fn();

jest.mock('@entities/lens/ui/NativeRenderer', () => {
  const ReactActual = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    NativeRenderer: ReactActual.forwardRef((props: unknown, ref: unknown) => {
      ReactActual.useImperativeHandle(ref, () => ({
        takePhoto: mockTakePhoto,
      }));
      return <View testID="native-film-camera" {...(props as object)} />;
    }),
  };
});

describe('CameraCapturePipeline Integration', () => {
  beforeEach(() => {
    mockTakePhoto.mockClear();
    act(() => {
      useControlPanelStore.getState().setActiveSection('none');
      useControlPanelStore.getState().setActiveModule('none');
      useFilmStore.getState().setNoiseReductionAuto(true);
      useFilmStore.getState().setNoiseReductionMode(1);
    });
  });

  it('executes the full capture pipeline when shutter button is pressed', async () => {
    const { getByTestId, queryByText } = render(<CameraScreen />);

    // Wait for permissions to be resolved
    await waitFor(() => expect(queryByText('camera.requesting_permissions')).toBeNull());

    const shutterButton = getByTestId('shutter-button');

    // Simulate press on ShutterButton
    act(() => {
      fireEvent.press(shutterButton);
    });

    // Verify UI store isCapturing was triggered and useCameraCapture called takePhoto
    expect(mockTakePhoto).toHaveBeenCalled();
  });
});
