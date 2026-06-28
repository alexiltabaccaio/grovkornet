/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { CameraScreen } from '@screens/camera';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { useFilmStore } from '@entities/film';
import { useCameraStore } from '@entities/camera';

// Mock Viewfinder to render NativeRenderer and capture its props
jest.mock('@entities/lens/ui/NativeRenderer', () => {
  const ReactActual = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    NativeRenderer: ReactActual.forwardRef((props: any, ref: any) => {
      ReactActual.useImperativeHandle(ref, () => ({
        takePhoto: jest.fn(),
      }));
      // Render a View containing the animated props for assertion
      return <View testID="native-film-camera" {...props} />;
    }),
  };
});

describe('CodegenBindings Integration Test', () => {
  beforeEach(() => {
    act(() => {
      // Reset stores to default values
      useBodyStore.getState().ev.value = 0;
      useBodyStore.getState().zoom.value = 1.0;
      useBodyStore.getState().fpsSetting.value = 60;
      useLensStore.getState().focusAuto.value = true;
      useLensStore.getState().focusDistance.value = 0.0;
      useFilmStore.getState().isSelfieCamera.value = false;
      useFilmStore.getState().noiseReductionAuto.value = false;
      useFilmStore.getState().noiseReductionMode.value = 0;
    });
  });

  it('correctly maps Zustand store updates to NativeRenderer props', async () => {
    const { getByTestId, queryByText, rerender } = render(<CameraScreen />);

    // Wait for permission resolution
    await waitFor(() => expect(queryByText('camera.requesting_permissions')).toBeNull());

    let nativeCamera = getByTestId('native-film-camera');
    
    // 1. Verify default values
    expect(nativeCamera.props.animatedProps.ev).toBe(0);
    expect(nativeCamera.props.animatedProps.zoom).toBe(1.0);
    expect(nativeCamera.props.animatedProps.targetFps).toBe(60);
    expect(nativeCamera.props.animatedProps.autoFocus).toBe(true);
    expect(nativeCamera.props.animatedProps.isSelfieCamera).toBe(false);

    // 2. Modify values in stores
    act(() => {
      useBodyStore.getState().ev.value = 1.5;
      useBodyStore.getState().zoom.value = 2.5;
      useBodyStore.getState().fpsSetting.value = 30;
      useLensStore.getState().focusAuto.value = false;
      useLensStore.getState().focusDistance.value = 0.8;
      useFilmStore.getState().isSelfieCamera.value = true;
      useFilmStore.getState().noiseReductionMode.value = 2;
      
      // Trigger a state update on useCameraStore to force Viewfinder to rerender reactively
      useCameraStore.getState().setIsCameraSecure(false);
    });

    // Rerender to force Reanimated's mocked useAnimatedProps to re-evaluate the callbacks
    rerender(<CameraScreen />);

    // Re-query the camera view
    nativeCamera = getByTestId('native-film-camera');

    // 3. Verify updated values are correctly bound and sent as props
    expect(nativeCamera.props.animatedProps.ev).toBe(1.5);
    expect(nativeCamera.props.animatedProps.zoom).toBe(2.5);
    expect(nativeCamera.props.animatedProps.targetFps).toBe(30);
    expect(nativeCamera.props.animatedProps.autoFocus).toBe(false);
    expect(nativeCamera.props.animatedProps.focusDistance).toBe(0.8);
    expect(nativeCamera.props.animatedProps.isSelfieCamera).toBe(true);
    expect(nativeCamera.props.animatedProps.noiseReduction).toBe(2);
  });
});
