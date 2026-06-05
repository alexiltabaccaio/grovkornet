/* eslint-disable @typescript-eslint/no-require-imports */
 
import React from 'react';
import { render } from '@testing-library/react-native';
import { Viewfinder } from './Viewfinder';
import { useBodyStore } from '@entities/body';
import { useFilmStore } from '@entities/film';

// Mock NativeRenderer
jest.mock('@entities/lens/ui/NativeRenderer', () => {
  const { View } = require('react-native');
  return {
    NativeRenderer: (props: any) => <View testID="native-camera" {...props} />,
  };
});
describe('Viewfinder', () => {
  it('correctly maps store values to NativeFilmCamera props', () => {
    const bodyStore = useBodyStore.getState();
    const filmStore = useFilmStore.getState();
    
    // Set some values in store
    filmStore.satRed.value = 75.0;
    filmStore.satBlue.value = 25.0;
    bodyStore.iso.value = 400;
    bodyStore.aspectRatio.value = 1; // 16:9

    const { getByTestId } = render(<Viewfinder />);
    const nativeCamera = getByTestId('native-camera');

    // Check if props match store values
    expect(nativeCamera.props.animatedProps.satRed).toBe(75.0);
    expect(nativeCamera.props.animatedProps.satBlue).toBe(25.0);
    expect(nativeCamera.props.animatedProps.iso).toBe(400);
    expect(nativeCamera.props.animatedProps.cameraAspectRatio).toBe(1);
  });

  it('handles debug update events', () => {
    const bodyStore = useBodyStore.getState();

    const { getByTestId } = render(<Viewfinder />);
    const nativeCamera = getByTestId('native-camera');

    // Simulate native event
    nativeCamera.props.onDebugUpdate({
      nativeEvent: {
        fps: 60, 
        hwFps: 15,
        resolution: '1080p'
      }
    });

    expect(bodyStore.fps.value).toBe(60);
    expect(bodyStore.hwFps.value).toBe(15);
    expect(bodyStore.resolution.value).toBe('1080p');
  });

  it('updates store values on exposure update when in auto mode', () => {
    const bodyStore = useBodyStore.getState();
    bodyStore.isoAuto.value = true;
    
    const { getByTestId } = render(<Viewfinder />);
    const nativeCamera = getByTestId('native-camera');

    // Simulate exposure update from native side
    nativeCamera.props.onExposureUpdate({
      nativeEvent: {
        iso: 800, 
        shutterSpeed: 100
      }
    });

    expect(bodyStore.iso.value).toBe(800);
  });
});
