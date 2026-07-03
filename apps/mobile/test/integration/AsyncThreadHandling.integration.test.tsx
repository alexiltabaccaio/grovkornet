 
import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { CameraScreen } from '@screens/camera';
import { PermissionsAndroid } from 'react-native';
import { useCameraStore } from '@entities/camera';
import { useGalleryStore } from '@entities/gallery';
import { useVerificationStore } from '@entities/verification';
import { useFilmStore, getNitroConfig } from '@entities/film';
import { initNativeSync } from '../../src/app/lib/nativeSync';

// Mock NativeRenderer to capture props and trigger events
jest.mock('@entities/lens/ui/NativeRenderer', () => {
  const ReactActual = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    NativeRenderer: ReactActual.forwardRef((props: any, ref: any) => {
      ReactActual.useImperativeHandle(ref, () => ({
        takePhoto: jest.fn(),
      }));
      return <View testID="native-film-camera" {...props} />;
    }),
  };
});

describe('AsyncThreadHandling Integration Test', () => {
  beforeEach(() => {
    // Grant permissions by default for integration test UI mounts
    jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(
      PermissionsAndroid.RESULTS.GRANTED
    );

    // Reset stores to initial states
    act(() => {
      // Camera Store
      useCameraStore.setState({
        isCapturing: false,
        isCameraSecure: true,
        isTorchOn: false,
        thermalState: 'normal',
        isLowRam: false,
      });

      // Gallery Store
      useGalleryStore.setState({
        isOpen: false,
        latestPreviewUri: null,
        latestCapturedUri: null,
      });

      // Verification Store
      useVerificationStore.getState().clearCache();

      // Reset film store saturation value
      useFilmStore.getState().saturation.value = 1.0;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Scenario 1: Rapid Capture Spamming (Race Condition / Guarding)
  it('handles rapid capture triggers and resets correctly without getting stuck', () => {
    jest.useFakeTimers();

    const store = useCameraStore.getState();
    expect(store.isCapturing).toBe(false);

    // Call first capture
    act(() => {
      store.triggerCapture();
    });
    expect(useCameraStore.getState().isCapturing).toBe(true);

    // Spam calls to triggerCapture while it's active
    act(() => {
      store.triggerCapture();
      store.triggerCapture();
    });
    expect(useCameraStore.getState().isCapturing).toBe(true);

    // Advance time by 300ms (not yet 350ms, so still true)
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(useCameraStore.getState().isCapturing).toBe(true);

    // Advance time beyond 350ms (e.g. another 100ms)
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(useCameraStore.getState().isCapturing).toBe(false);

    jest.useRealTimers();
  });

  // Scenario 2: Delayed Native Callback Synchronization (Photo Capture Callback Pipeline)
  it('correctly propagates asynchronous photo capture events to gallery and verification stores', async () => {
    const { getByTestId, queryByText } = render(<CameraScreen />);

    // Wait for permissions check
    await waitFor(() => expect(queryByText('camera.requesting_permissions')).toBeNull());

    // By now, useRecentMediaThumbnail has mounted and might have queried assets, setting latestCapturedUri to 'file:///test/1.jpg'
    expect(useGalleryStore.getState().latestCapturedUri).toBe('file:///test/1.jpg');

    const nativeCamera = getByTestId('native-film-camera');
    
    // Simulate first callback: temporary preview URI
    const tempUri = 'file:///data/user/0/com.grovkornet/cache/temp-preview.jpg';
    act(() => {
      nativeCamera.props.onPhotoCaptured({
        nativeEvent: { uri: tempUri },
      });
    });

    expect(useGalleryStore.getState().latestPreviewUri).toBe(tempUri);
    expect(useGalleryStore.getState().latestCapturedUri).toBe('file:///test/1.jpg'); // remains the same during preview

    // Simulate second callback: final persistent media library URI
    const finalUri = 'content://media/external/images/media/42';
    act(() => {
      nativeCamera.props.onPhotoCaptured({
        nativeEvent: { uri: finalUri },
      });
    });

    expect(useGalleryStore.getState().latestCapturedUri).toBe(finalUri);
    expect(useGalleryStore.getState().latestPreviewUri).toBeNull();
    expect(useVerificationStore.getState().verifiedMap[finalUri]).toBe(true);
  });

  // Scenario 3: Debounced Parameter Syncing (nativeSync JSI integration)
  it('correctly debounces and synchronizes store parameter updates to JSI configuration', () => {
    jest.useFakeTimers();

    // Initialize native sync
    initNativeSync();

    const nitro = getNitroConfig();
    expect(nitro.saturation).toBe(1.0); // fallback dummy config default is 1.0

    // Perform rapid store updates (drag slider simulation)
    act(() => {
      useFilmStore.getState().setSaturation(1.2);
    });
    // Immediately check: should not be updated yet due to 50ms debounce
    expect(nitro.saturation).toBe(1.0);

    act(() => {
      useFilmStore.getState().setSaturation(1.5);
    });
    // Immediately check: still 1.0
    expect(nitro.saturation).toBe(1.0);

    // Advance time by 30ms (less than 50ms debounce)
    act(() => {
      jest.advanceTimersByTime(30);
    });
    expect(nitro.saturation).toBe(1.0);

    // Complete the 50ms debounce
    act(() => {
      jest.advanceTimersByTime(25);
    });
    expect(nitro.saturation).toBe(1.5);

    jest.useRealTimers();
  });
});
