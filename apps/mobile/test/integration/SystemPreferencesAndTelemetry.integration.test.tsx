import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { CameraScreen } from '@screens/camera';
import { useBodyStore } from '@entities/body';
import { useSystemStore } from '@entities/system';

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
      useSystemStore.getState().setActiveSection('none');
      useSystemStore.getState().setActiveModule('none');
      useSystemStore.getState().setIsDebugEnabled(false);
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
      useSystemStore.getState().setIsDebugEnabled(true);
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

  it('handles 4K preview decoupling integration correctly (toggle off)', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('resolution_setting');
      useBodyStore.getState().resolutionSetting.value = 1; // 1080p
      useBodyStore.getState().previewIn4k.value = 0;
    });

    const { getByTestId, queryByText } = render(<CameraScreen />);
    const nativeCamera = getByTestId('native-film-camera');

    // 4K preview toggle and warning should not render when resolution is 1080p
    expect(queryByText('PARAMETERS.PREVIEW_IN_4K')).toBeNull();
    expect(queryByText('parameters.preview_in_4k_warning')).toBeNull();
    expect(nativeCamera.props.previewIn4k.value).toBe(false);
  });

  it('handles 4K preview decoupling integration correctly (toggle on)', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('resolution_setting');
      useBodyStore.getState().resolutionSetting.value = 0; // 4K
      useBodyStore.getState().previewIn4k.value = 1; // ON
    });

    const { getByTestId, queryByText } = render(<CameraScreen />);
    const nativeCamera = getByTestId('native-film-camera');

    // 4K preview toggle and warning should render and native prop should be true
    expect(queryByText('PARAMETERS.PREVIEW_IN_4K')).toBeDefined();
    expect(queryByText('parameters.preview_in_4k_warning')).toBeDefined();
    expect(nativeCamera.props.previewIn4k.value).toBe(true);
  });
});
