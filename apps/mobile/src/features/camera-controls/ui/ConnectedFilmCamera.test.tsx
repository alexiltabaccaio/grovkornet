/* eslint-disable @typescript-eslint/no-require-imports */
 
import React from 'react';
import { render } from '@testing-library/react-native';
import { ConnectedFilmCamera } from './ConnectedFilmCamera';
import { useHardwareStore } from '../model/useHardwareStore';
import { useStylesStore } from '../model/useStylesStore';

// Mock NativeFilmCamera
jest.mock('@entities/camera/ui/NativeFilmCamera', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    NativeFilmCamera: (props: unknown) => <View testID="native-camera" {...(props as Record<string, unknown>)} />,
  };
});

interface MockCameraInstance {
  props: {
    saturation: { value: number };
    iso: { value: number };
    aspectRatio: { value: number };
    onDebugUpdate: (event: { nativeEvent: { fps: number; hwFps: number; resolution: string } }) => void;
    onExposureUpdate: (event: { nativeEvent: { iso: number; shutterSpeed: number } }) => void;
  };
}

describe('ConnectedFilmCamera', () => {
  it('correctly maps store values to NativeFilmCamera props', () => {
    const hwStore = useHardwareStore.getState();
    const styleStore = useStylesStore.getState();
    
    // Set some values in store
    styleStore.saturation.value = 1.5;
    hwStore.iso.value = 400;
    hwStore.aspectRatio.value = 1; // 16:9

    const { getByTestId } = render(<ConnectedFilmCamera />);
    const nativeCamera = getByTestId('native-camera') as unknown as MockCameraInstance;

    // Check if props match store values
    expect(nativeCamera.props.saturation.value).toBe(1.5);
    expect(nativeCamera.props.iso.value).toBe(400);
    expect(nativeCamera.props.aspectRatio.value).toBe(1);
  });

  it('handles debug update events', () => {
    const hwStore = useHardwareStore.getState();

    const { getByTestId } = render(<ConnectedFilmCamera />);
    const nativeCamera = getByTestId('native-camera') as unknown as MockCameraInstance;

    // Simulate native event
    nativeCamera.props.onDebugUpdate({
      nativeEvent: {
        fps: 60, 
        hwFps: 15,
        resolution: '1080p'
      }
    });

    expect(hwStore.fps.value).toBe(60);
    expect(hwStore.hwFps.value).toBe(15);
    expect(hwStore.resolution.value).toBe('1080p');
  });

  it('updates store values on exposure update when in auto mode', () => {
    const hwStore = useHardwareStore.getState();
    hwStore.isoAuto.value = true;
    
    const { getByTestId } = render(<ConnectedFilmCamera />);
    const nativeCamera = getByTestId('native-camera') as unknown as MockCameraInstance;

    // Simulate exposure update from native side
    nativeCamera.props.onExposureUpdate({
      nativeEvent: {
        iso: 800, 
        shutterSpeed: 100
      }
    });

    expect(hwStore.iso.value).toBe(800);
  });
});
