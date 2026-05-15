/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render } from '@testing-library/react-native';
import { ConnectedFilmCamera } from './ConnectedFilmCamera';
import { useCameraEffectsStore } from '../model/useCameraEffectsStore';

// Mock NativeFilmCamera
jest.mock('@entities/camera/ui/NativeFilmCamera', () => {
  const { View } = require('react-native');
  return {
    NativeFilmCamera: (props: any) => <View testID="native-camera" {...props} />,
  };
});

describe('ConnectedFilmCamera', () => {
  it('correctly maps store values to NativeFilmCamera props', () => {
    const store = useCameraEffectsStore.getState();
    
    // Set some values in store
    store.saturation.value = 1.5;
    store.iso.value = 400;

    const { getByTestId } = render(<ConnectedFilmCamera />);
    const nativeCamera = getByTestId('native-camera');

    // Check if props match store values
    expect(nativeCamera.props.saturation.value).toBe(1.5);
    expect(nativeCamera.props.iso.value).toBe(400);
  });

  it('handles debug update events', () => {
    const store = useCameraEffectsStore.getState();

    const { getByTestId } = render(<ConnectedFilmCamera />);
    const nativeCamera = getByTestId('native-camera');

    // Simulate native event (useEvent expects direct data)
    nativeCamera.props.onDebugUpdate({
      fps: 60, 
      hwFps: 15,
      resolution: '1080p'
    });

    expect(store.fps.value).toBe(60);
    expect(store.hwFps.value).toBe(15);
    expect(store.resolution.value).toBe('1080p');
  });

  it('updates store values on exposure update when in auto mode', () => {
    const store = useCameraEffectsStore.getState();
    store.isoAuto.value = true;
    
    const { getByTestId } = render(<ConnectedFilmCamera />);
    const nativeCamera = getByTestId('native-camera');

    // Simulate exposure update from native side (useEvent expects direct data)
    nativeCamera.props.onExposureUpdate({
      iso: 800, 
      shutterSpeed: 100
    });

    expect(store.iso.value).toBe(800);
  });
});
