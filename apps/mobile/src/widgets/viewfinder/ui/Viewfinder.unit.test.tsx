/* eslint-disable @typescript-eslint/no-require-imports */
 
import React from 'react';
import { render } from '@testing-library/react-native';
import { Viewfinder } from './Viewfinder';
import { useBodyStore } from '@entities/body';
import { useFilmStore } from '@entities/film';

// Mock NativeRenderer
jest.mock('@entities/lens/ui/NativeRenderer', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    NativeRenderer: (props: unknown) => <View testID="native-camera" {...(props as Record<string, unknown>)} />,
  };
});

interface MockCameraInstance {
  props: {
    saturation: { value: number };
    iso: { value: number };
    cameraAspectRatio: { value: number };
    onDebugUpdate: (event: { nativeEvent: { fps: number; hwFps: number; resolution: string } }) => void;
    onExposureUpdate: (event: { nativeEvent: { iso: number; shutterSpeed: number } }) => void;
  };
}

describe('Viewfinder', () => {
  it('correctly maps store values to NativeFilmCamera props', () => {
    const bodyStore = useBodyStore.getState();
    const filmStore = useFilmStore.getState();
    
    // Set some values in store
    filmStore.saturation.value = 1.5;
    filmStore.satRed.value = 75.0;
    filmStore.satBlue.value = 25.0;
    bodyStore.iso.value = 400;
    bodyStore.aspectRatio.value = 1; // 16:9

    const { getByTestId } = render(<Viewfinder />);
    const nativeCamera = getByTestId('native-camera') as unknown as MockCameraInstance;

    // Check if props match store values
    expect(nativeCamera.props.saturation.value).toBe(1.5);
    expect((nativeCamera.props as any).satRed.value).toBe(75.0);
    expect((nativeCamera.props as any).satBlue.value).toBe(25.0);
    expect(nativeCamera.props.iso.value).toBe(400);
    expect(nativeCamera.props.cameraAspectRatio.value).toBe(1);
  });

  it('handles debug update events', () => {
    const bodyStore = useBodyStore.getState();

    const { getByTestId } = render(<Viewfinder />);
    const nativeCamera = getByTestId('native-camera') as unknown as MockCameraInstance;

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
    const nativeCamera = getByTestId('native-camera') as unknown as MockCameraInstance;

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
