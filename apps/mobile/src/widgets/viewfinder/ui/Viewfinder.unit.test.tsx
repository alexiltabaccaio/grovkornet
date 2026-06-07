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
    expect(nativeCamera.props.animatedProps.satRed).toBeUndefined();
    expect(nativeCamera.props.animatedProps.satBlue).toBeUndefined();
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

  it('limits FPS to 30 for 4:3 high-res when crop is disabled, but keeps 60 for 16:9', () => {
    const bodyStore = useBodyStore.getState();
    bodyStore.fpsSetting.value = 60;
    bodyStore.resolutionSetting.value = 0; // High-res (4K)
    bodyStore.force60fpsCrop.value = 0; // Crop disabled
    
    // Test 1: 4:3 aspect ratio (e.g. 0)
    bodyStore.aspectRatio.value = 0;
    const { getByTestId, rerender } = render(<Viewfinder cameraKey={1} />);
    let nativeCamera = getByTestId('native-camera');
    expect(nativeCamera.props.animatedProps.targetFps).toBe(30);

    // Test 2: 16:9 aspect ratio (1)
    bodyStore.aspectRatio.value = 1;
    rerender(<Viewfinder cameraKey={2} />);
    nativeCamera = getByTestId('native-camera');
    expect(nativeCamera.props.animatedProps.targetFps).toBe(60);
  });
});
