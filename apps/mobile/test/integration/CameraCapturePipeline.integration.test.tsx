/* eslint-disable @typescript-eslint/no-require-imports */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { CameraScreen } from '@screens/camera/ui/CameraScreen';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';

const mockTakePhoto = jest.fn();

jest.mock('@entities/camera/ui/NativeFilmCamera', () => {
  const ReactActual = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    NativeFilmCamera: ReactActual.forwardRef((props: unknown, ref: unknown) => {
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
      useUIStore.getState().setActiveSection('none');
      useUIStore.getState().setActiveModule('none');
      useStylesStore.getState().setNoiseReductionAuto(true);
      useStylesStore.getState().setNoiseReductionMode(1);
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

    // Verify noise reduction mode temporarily switched to HQ (2) due to noiseReductionAuto
    expect(useStylesStore.getState().noiseReductionMode.value).toBe(2);
  });
});
