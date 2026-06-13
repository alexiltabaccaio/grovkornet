import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { CameraScreen } from '@screens/camera';
import { useBodyStore } from '@entities/body';
import { useSystemStore, useControlPanelStore } from '@entities/system';

jest.mock('@entities/lens/ui/NativeRenderer', () => {
  const ReactActual = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    NativeRenderer: ReactActual.forwardRef((props: unknown, ref: unknown) => {
      ReactActual.useImperativeHandle(ref, () => ({
        takePhoto: jest.fn(),
      }));
      return <View testID="native-film-camera" {...(props as object)} />;
    }),
  };
});

describe('SystemPreferencesAndTelemetry Integration', () => {
  beforeEach(() => {
    act(() => {
      useControlPanelStore.getState().setActiveSection('none');
      useControlPanelStore.getState().setActiveModule('none');
      useSystemStore.getState().setIsFpsOverlayEnabled(false);
      useBodyStore.getState().setDebugInfo(0, '1080p', 0);
    });
  });

  it('enables debug overlay and processes telemetry updates correctly', async () => {
    const { getByTestId, getByDisplayValue, queryByDisplayValue, queryByText } = render(<CameraScreen />);

    // Wait for permissions to be resolved
    await waitFor(() => expect(queryByText('camera.requesting_permissions')).toBeNull());

    // Verify debug overlay is initially not present
    expect(queryByDisplayValue(/FPS:/)).toBeNull();

    // Enable debug mode
    act(() => {
      useSystemStore.getState().setIsFpsOverlayEnabled(true);
    });

    // Verify debug overlay appears with default values
    expect(getByDisplayValue(/FPS: -/)).toBeDefined();

    const nativeCamera = getByTestId('native-film-camera');

    // Simulate debug telemetry update from native camera
    act(() => {
      fireEvent(nativeCamera, 'debugUpdate', {
        nativeEvent: {
          fps: 60,
          hwFps: 60,
          resolution: '3840x2160',
        },
      });
    });

    // Verify hardware store telemetry values updated correctly
    expect(useBodyStore.getState().fps.value).toBe(60);
    expect(useBodyStore.getState().hwFps.value).toBe(60);
    expect(useBodyStore.getState().resolution.value).toBe('3840x2160');
  });

  it('handles preview quality integration correctly (optimized)', () => {
    act(() => {
      useControlPanelStore.getState().setActiveParameter('resolution_setting');
      useBodyStore.getState().resolutionSetting.value = 1; // 1080p
      useBodyStore.getState().previewQuality.value = 1; // Optimized
    });

    const { getByTestId, queryByText } = render(<CameraScreen />);
    const nativeCamera = getByTestId('native-film-camera');

    // Preview quality label should render (always visible) and warning should be null
    expect(queryByText('PARAMETERS.PREVIEW_QUALITY')).toBeDefined();
    expect(queryByText('parameters.preview_quality_warning')).toBeNull();
    expect(nativeCamera.props.animatedProps.previewQuality).toBe(1);
  });

  it('handles preview quality warning correctly (maximum on 4K)', () => {
    act(() => {
      useControlPanelStore.getState().setActiveParameter('resolution_setting');
      useBodyStore.getState().resolutionSetting.value = 0; // 4K
      useBodyStore.getState().previewQuality.value = 0; // Maximum
    });

    const { getByTestId, queryByText } = render(<CameraScreen />);
    const nativeCamera = getByTestId('native-film-camera');

    // Warning should render and native prop should be 0 (Maximum)
    expect(queryByText('PARAMETERS.PREVIEW_QUALITY')).toBeDefined();
    expect(queryByText('parameters.preview_quality_warning')).toBeDefined();
    expect(nativeCamera.props.animatedProps.previewQuality).toBe(0);
  });
});
