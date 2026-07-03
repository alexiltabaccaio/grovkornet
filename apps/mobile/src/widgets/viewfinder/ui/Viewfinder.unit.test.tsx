// Mock NativeRenderer
jest.mock('@entities/lens/ui/NativeRenderer', () => {
  const { View } = require('react-native');
  return {
    NativeRenderer: (props: any) => <View testID="native-camera" {...props} />,
  };
});

// Define shared mock instances on global scope to avoid Jest hoisting variable initialization errors
// @ts-ignore
global.mockSyncRuntimeToNative = global.mockSyncRuntimeToNative || jest.fn().mockImplementation(() => Promise.resolve());
// @ts-ignore
global.mockBodyWorklets = global.mockBodyWorklets || {
  updateZoom: jest.fn().mockImplementation((val: number) => {
    const { useBodyStore } = require('@entities/body');
    useBodyStore.getState().zoom.value = val;
  })
};
// @ts-ignore
global.mockFilmWorklets = global.mockFilmWorklets || {
  updateDeviceOrientation: jest.fn().mockImplementation((val: number) => {
    const store = (global as any).mockFilmStore || require('@entities/film').useFilmStore;
    store.getState().deviceOrientation.value = val;
  })
};

// Mock presets under all resolved path permutations to guarantee Jest intercepts the dynamic import
jest.mock('@features/presets', () => ({
  // @ts-ignore
  syncRuntimeToNative: (...args: any[]) => global.mockSyncRuntimeToNative(...args),
}));
jest.mock('../../../features/presets', () => ({
  // @ts-ignore
  syncRuntimeToNative: (...args: any[]) => global.mockSyncRuntimeToNative(...args),
}));
jest.mock('..\\..\\..\\features\\presets', () => ({
  // @ts-ignore
  syncRuntimeToNative: (...args: any[]) => global.mockSyncRuntimeToNative(...args),
}));
jest.mock('../../../features/presets/index', () => ({
  // @ts-ignore
  syncRuntimeToNative: (...args: any[]) => global.mockSyncRuntimeToNative(...args),
}));
jest.mock('..\\..\\..\\features\\presets\\index', () => ({
  // @ts-ignore
  syncRuntimeToNative: (...args: any[]) => global.mockSyncRuntimeToNative(...args),
}));
jest.mock('../../../features/presets/index.ts', () => ({
  // @ts-ignore
  syncRuntimeToNative: (...args: any[]) => global.mockSyncRuntimeToNative(...args),
}));
jest.mock('..\\..\\..\\features\\presets\\index.ts', () => ({
  // @ts-ignore
  syncRuntimeToNative: (...args: any[]) => global.mockSyncRuntimeToNative(...args),
}));

// Mock whole entities folders under all resolved permutations to bypass Babel alias resolution discrepancies in Jest
jest.mock('@entities/body', () => {
  const original = jest.requireActual('@entities/body');
  return {
    ...original,
    // @ts-ignore
    useBodyWorklets: () => global.mockBodyWorklets,
  };
});
jest.mock('../../../entities/body', () => {
  const original = jest.requireActual('@entities/body');
  return {
    ...original,
    // @ts-ignore
    useBodyWorklets: () => global.mockBodyWorklets,
  };
});
jest.mock('..\\..\\..\\entities\\body', () => {
  const original = jest.requireActual('@entities/body');
  return {
    ...original,
    // @ts-ignore
    useBodyWorklets: () => global.mockBodyWorklets,
  };
});
jest.mock('../../../entities/body/index', () => {
  const original = jest.requireActual('@entities/body');
  return {
    ...original,
    // @ts-ignore
    useBodyWorklets: () => global.mockBodyWorklets,
  };
});
jest.mock('..\\..\\..\\entities\\body\\index', () => {
  const original = jest.requireActual('@entities/body');
  return {
    ...original,
    // @ts-ignore
    useBodyWorklets: () => global.mockBodyWorklets,
  };
});
jest.mock('../../../entities/body/index.ts', () => {
  const original = jest.requireActual('@entities/body');
  return {
    ...original,
    // @ts-ignore
    useBodyWorklets: () => global.mockBodyWorklets,
  };
});
jest.mock('..\\..\\..\\entities\\body\\index.ts', () => {
  const original = jest.requireActual('@entities/body');
  return {
    ...original,
    // @ts-ignore
    useBodyWorklets: () => global.mockBodyWorklets,
  };
});

jest.mock('@entities/film', () => {
  const original = jest.requireActual('@entities/film');
  return {
    ...original,
    // @ts-ignore
    useFilmWorklets: () => global.mockFilmWorklets,
  };
});
jest.mock('../../../entities/film', () => {
  const original = jest.requireActual('@entities/film');
  return {
    ...original,
    // @ts-ignore
    useFilmWorklets: () => global.mockFilmWorklets,
  };
});
jest.mock('..\\..\\..\\entities\\film', () => {
  const original = jest.requireActual('@entities/film');
  return {
    ...original,
    // @ts-ignore
    useFilmWorklets: () => global.mockFilmWorklets,
  };
});
jest.mock('../../../entities/film/index', () => {
  const original = jest.requireActual('@entities/film');
  return {
    ...original,
    // @ts-ignore
    useFilmWorklets: () => global.mockFilmWorklets,
  };
});
jest.mock('..\\..\\..\\entities\\film\\index', () => {
  const original = jest.requireActual('@entities/film');
  return {
    ...original,
    // @ts-ignore
    useFilmWorklets: () => global.mockFilmWorklets,
  };
});
jest.mock('../../../entities/film/index.ts', () => {
  const original = jest.requireActual('@entities/film');
  return {
    ...original,
    // @ts-ignore
    useFilmWorklets: () => global.mockFilmWorklets,
  };
});
jest.mock('..\\..\\..\\entities\\film\\index.ts', () => {
  const original = jest.requireActual('@entities/film');
  return {
    ...original,
    // @ts-ignore
    useFilmWorklets: () => global.mockFilmWorklets,
  };
});

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Viewfinder } from './Viewfinder';
import { useBodyStore, useBodyWorklets } from '@entities/body';
import { useFilmStore, useFilmWorklets } from '@entities/film';
import { useGalleryStore } from '@entities/gallery';
import { useVerificationStore } from '@entities/verification';
import { useCameraStore } from '@entities/camera';
import { Gesture } from 'react-native-gesture-handler';
import * as Reanimated from 'react-native-reanimated';
import * as presets from '@features/presets';

describe('Viewfinder', () => {
  let reactionCallback: Function | null = null;
  let pinchCallbacks: Record<string, Function> = {};

  beforeAll(() => {
    // @ts-ignore
    global.mockFilmStore = useFilmStore;

    // 1. Spy on useAnimatedReaction to catch orientation triggers (Reanimated module properties are mutable in Jest)
    jest.spyOn(Reanimated, 'useAnimatedReaction').mockImplementation((prepare: any, react: any, deps: any) => {
      try {
        prepare();
      } catch (e) {
        // Ignore potential errors if prepare reads uninitialized properties
      }
      const isOrientationReaction = deps && deps.length > 0 && deps[0] && typeof deps[0].updateDeviceOrientation === 'function';
      if (isOrientationReaction) {
        reactionCallback = (val: number) => {
          react(val);
        };
      }
    });

    // 2. Spy on Gesture.Pinch to catch touch event handlers
    const mockPinch: any = {
      enabled: jest.fn().mockImplementation(() => mockPinch),
      onBegin: jest.fn().mockImplementation((cb) => { pinchCallbacks.onBegin = cb; return mockPinch; }),
      onStart: jest.fn().mockImplementation((cb) => { pinchCallbacks.onStart = cb; return mockPinch; }),
      onChange: jest.fn().mockImplementation((cb) => { pinchCallbacks.onChange = cb; return mockPinch; }),
      onFinalize: jest.fn().mockImplementation((cb) => { pinchCallbacks.onFinalize = cb; return mockPinch; }),
    };
    jest.spyOn(Gesture, 'Pinch').mockImplementation(() => mockPinch as any);
  });

  it('correctly maps manual store values to NativeFilmCamera props', () => {
    const bodyStore = useBodyStore.getState();
    const filmStore = useFilmStore.getState();
    const { useLensStore } = require('@entities/lens');
    const lensStore = useLensStore.getState();
    
    // Set some manual values in store
    filmStore.satRed.value = 75.0;
    filmStore.satBlue.value = 25.0;
    bodyStore.iso.value = 400;
    bodyStore.isoAuto.value = false;
    bodyStore.shutterSpeed.value = 125;
    bodyStore.shutterSpeedAuto.value = false;
    bodyStore.aspectRatio.value = 1; // 16:9
    filmStore.noiseReductionMode.value = 2;
    filmStore.noiseReductionAuto.value = false;
    bodyStore.capabilities = { maxTorchStrength: 4 };
    bodyStore.torchStrength.value = 0.5;
    bodyStore.force60fpsCrop.value = 0;
    lensStore.focusAuto.value = false;
    lensStore.focusDistance.value = 0.5;

    const { getByTestId } = render(<Viewfinder />);
    const nativeCamera = getByTestId('native-camera');

    // Check if props match store values
    expect(nativeCamera.props.animatedProps.satRed).toBeUndefined();
    expect(nativeCamera.props.animatedProps.satBlue).toBeUndefined();
    expect(nativeCamera.props.animatedProps.iso).toBe(400);
    expect(nativeCamera.props.animatedProps.exposureTime).toBe(125);
    expect(nativeCamera.props.animatedProps.cameraAspectRatio).toBe(1);
    expect(nativeCamera.props.animatedProps.noiseReduction).toBe(2);
    expect(nativeCamera.props.animatedProps.torchStrength).toBe(2); // 0.5 * 4 = 2.0
    expect(nativeCamera.props.animatedProps.force60fpsCrop).toBe(false);
    expect(nativeCamera.props.animatedProps.focusDistance).toBe(0.5);
  });

  it('correctly maps auto store values to NativeFilmCamera props', () => {
    const bodyStore = useBodyStore.getState();
    const filmStore = useFilmStore.getState();
    const { useLensStore } = require('@entities/lens');
    const lensStore = useLensStore.getState();

    // Set auto modes and crop enabled
    bodyStore.isoAuto.value = true;
    bodyStore.shutterSpeedAuto.value = true;
    filmStore.noiseReductionAuto.value = true;
    bodyStore.force60fpsCrop.value = 1;
    lensStore.focusAuto.value = true;

    const { getByTestId } = render(<Viewfinder />);
    const nativeCamera = getByTestId('native-camera');

    expect(nativeCamera.props.animatedProps.iso).toBe(-1);
    expect(nativeCamera.props.animatedProps.exposureTime).toBe(-1);
    expect(nativeCamera.props.animatedProps.noiseReduction).toBe(-1);
    expect(nativeCamera.props.animatedProps.force60fpsCrop).toBe(true);
    expect(nativeCamera.props.animatedProps.focusDistance).toBe(-1.0);
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

  it('limits FPS to 30 for all aspect ratios when crop is disabled, and allows 60 when crop is enabled', () => {
    const bodyStore = useBodyStore.getState();
    bodyStore.fpsSetting.value = 60;
    
    // Case 1: Crop disabled (force60fpsCrop = 0) -> all aspect ratios limited to 30
    bodyStore.force60fpsCrop.value = 0;
    bodyStore.aspectRatio.value = 0; // 4:3
    bodyStore.resolutionSetting.value = 1; // High-res 1080p (resolves isHighRes to true, killing <= 1 vs < 1 mutant)
    const { getByTestId, rerender } = render(<Viewfinder cameraKey={1} />);
    let nativeCamera = getByTestId('native-camera');
    expect(nativeCamera.props.animatedProps.targetFps).toBe(30);

    bodyStore.resolutionSetting.value = 0; // High-res 4K
    bodyStore.aspectRatio.value = 1; // 16:9
    rerender(<Viewfinder cameraKey={2} />);
    nativeCamera = getByTestId('native-camera');
    expect(nativeCamera.props.animatedProps.targetFps).toBe(30);

    // Case 2: Crop enabled (force60fpsCrop = 1) -> allows 60 FPS
    bodyStore.force60fpsCrop.value = 1;
    bodyStore.aspectRatio.value = 0; // 4:3
    rerender(<Viewfinder cameraKey={3} />);
    nativeCamera = getByTestId('native-camera');
    expect(nativeCamera.props.animatedProps.targetFps).toBe(60);

    bodyStore.aspectRatio.value = 1; // 16:9
    rerender(<Viewfinder cameraKey={4} />);
    nativeCamera = getByTestId('native-camera');
    expect(nativeCamera.props.animatedProps.targetFps).toBe(60);
  });

  beforeEach(() => {
    // @ts-ignore
    global.mockSyncRuntimeToNative.mockClear();
    // @ts-ignore
    global.mockFilmWorklets.updateDeviceOrientation.mockClear();
    // @ts-ignore
    global.mockBodyWorklets.updateZoom.mockClear();
  });

  it('handles photo captured events', () => {
    const { getByTestId } = render(<Viewfinder />);
    const nativeCamera = getByTestId('native-camera');
    
    // Case 1: Temporary preview in cache
    nativeCamera.props.onPhotoCaptured({
      nativeEvent: { uri: 'file:///data/user/0/com.app/cache/photo.jpg' }
    });
    expect(useGalleryStore.getState().latestPreviewUri).toBe('file:///data/user/0/com.app/cache/photo.jpg');
    
    // Case 2: Final saved image (MediaStore)
    nativeCamera.props.onPhotoCaptured({
      nativeEvent: { uri: 'content://media/external/images/media/123' }
    });
    expect(useGalleryStore.getState().latestCapturedUri).toBe('content://media/external/images/media/123');
    expect(useVerificationStore.getState().verifiedMap['content://media/external/images/media/123']).toBe(true);
  });

  it('handles session ready events', async () => {
    const { getByTestId } = render(<Viewfinder />);
    const nativeCamera = getByTestId('native-camera');
    
    nativeCamera.props.onSessionReady();
    
    // Wait asynchronously for dynamic import / require to trigger the mock
    await waitFor(() => {
      // @ts-ignore
      expect(global.mockSyncRuntimeToNative).toHaveBeenCalled();
    });
  });

  it('handles session ready events failure', async () => {
    const originalConsoleWarn = console.warn;
    console.warn = jest.fn();
    
    // @ts-ignore
    global.mockSyncRuntimeToNative.mockRejectedValueOnce(new Error('Sync failed'));
    
    const { getByTestId } = render(<Viewfinder />);
    const nativeCamera = getByTestId('native-camera');
    
    nativeCamera.props.onSessionReady();
    
    await waitFor(() => {
      expect(console.warn).toHaveBeenCalledWith('Failed to sync native runtime', expect.any(Error));
    });
    
    console.warn = originalConsoleWarn;
  });

  it('handles pinch gesture events', () => {
    const bodyStore = useBodyStore.getState();
    
    render(<Viewfinder />);
    bodyStore.zoom.value = 2.0;
    
    // 1. Trigger onBegin
    pinchCallbacks.onBegin();
    expect(bodyStore.zoom.value).toBeCloseTo(2.000001, 6);
    
    // 2. Trigger onStart
    pinchCallbacks.onStart();
    
    // 3. Trigger onChange
    pinchCallbacks.onChange({ scale: 1.5 });
    expect(bodyStore.zoom.value).toBeCloseTo(3.0, 5);
    
    // 4. Trigger onFinalize
    pinchCallbacks.onFinalize();
    
    // Case 5: handles scale NaN
    bodyStore.zoom.value = 3.0;
    pinchCallbacks.onChange({ scale: NaN });
    expect(bodyStore.zoom.value).toBe(3.0);
  });

  it('handles device rotation animated reactions', () => {
    const filmStore = useFilmStore.getState();
    render(<Viewfinder />);
    
    if (reactionCallback) {
      // Test Landscape Left (90)
      reactionCallback(90);
      expect(filmStore.deviceOrientation.value).toBe(1);
      
      // Test Portrait Upside Down (180)
      reactionCallback(180);
      expect(filmStore.deviceOrientation.value).toBe(2);
      
      // Test Landscape Right (-90)
      reactionCallback(-90);
      expect(filmStore.deviceOrientation.value).toBe(3);
      
      // Test Portrait (0)
      reactionCallback(0);
      expect(filmStore.deviceOrientation.value).toBe(0);
    }
  });

  it('limits target FPS based on thermal state', () => {
    const bodyStore = useBodyStore.getState();
    const cameraStore = useCameraStore.getState();
    
    bodyStore.fpsSetting.value = 60;
    
    // Case 1: warning thermal state -> limits to 30
    cameraStore.setThermalState('warning');
    const { getByTestId, rerender } = render(<Viewfinder cameraKey={10} />);
    let nativeCamera = getByTestId('native-camera');
    expect(nativeCamera.props.animatedProps.targetFps).toBe(30);
    
    // Case 2: critical thermal state -> limits to 15
    cameraStore.setThermalState('critical');
    rerender(<Viewfinder cameraKey={11} />);
    nativeCamera = getByTestId('native-camera');
    expect(nativeCamera.props.animatedProps.targetFps).toBe(15);
    
    // Clean up
    cameraStore.setThermalState('normal');
  });
});
