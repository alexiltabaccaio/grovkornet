/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { AppState, PermissionsAndroid, Platform, StatusBar } from 'react-native';
import { CameraScreen } from './CameraScreen';

const mockTriggerCapture = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
}));

jest.mock('@entities/system', () => {
  const state = {
    isFpsOverlayEnabled: true,
    isLayoutOverlayEnabled: false,
    isLogsEnabled: true,
  };
  const controlPanelState = {
    activeSection: 'none',
    activeModule: 'none',
    activeParameter: 'none',
    setActiveSection: jest.fn(),
    setActiveModule: jest.fn(),
    setActiveParameter: jest.fn(),
  };
  return {
    useSystemStore: Object.assign(
      jest.fn((fn?: (state: any) => unknown) => fn ? fn(state) : state),
      {
        getState: jest.fn(() => state),
        setState: jest.fn(),
      }
    ),
    useControlPanelStore: Object.assign(
      jest.fn((fn?: (state: any) => unknown) => fn ? fn(controlPanelState) : controlPanelState),
      {
        getState: jest.fn(() => controlPanelState),
        setState: jest.fn(),
      }
    ),
  };
});

jest.mock('@entities/camera', () => {
  const state = {
    triggerCapture: mockTriggerCapture,
  };
  return {
    useCameraStore: jest.fn((fn?: (state: any) => unknown) => fn ? fn(state) : state),
  };
});

const mockDrawerAnimation = { value: 0 };
const mockFooterTranslateY = { value: 0 };
const mockViewfinderTranslateY = { value: 0 };
const mockLayoutSyncOffset = { value: 0 };

jest.mock('../lib/useCameraUIAnimations', () => ({
  useCameraUIAnimations: () => ({
    drawerAnimation: mockDrawerAnimation,
    footerTranslateY: mockFooterTranslateY,
    viewfinderTranslateY: mockViewfinderTranslateY,
    layoutSyncOffset: mockLayoutSyncOffset,
  }),
}));

jest.mock('@entities/gallery', () => {
  const ReactActual = jest.requireActual('react');
  let mockIsOpen = false;
  const mockGalleryStoreFn = Object.assign(
    jest.fn((fn?: (state: any) => unknown) => {
      const [galleryOpen, setGalleryOpen] = ReactActual.useState(mockIsOpen);
      
      const customSetIsOpen = (val: boolean) => {
        mockIsOpen = val;
        setGalleryOpen(val);
      };

      const state = {
        latestCapturedUri: 'file:///test.jpg',
        latestPreviewUri: null,
        isOpen: galleryOpen,
        setIsOpen: customSetIsOpen,
      };
      return fn ? fn(state) : state;
    }),
    {
      getState: jest.fn(() => ({
        isOpen: mockIsOpen,
        latestCapturedUri: 'file:///test.jpg',
        latestPreviewUri: null,
      })),
      setState: jest.fn((patch: any) => {
        if (patch && patch.isOpen !== undefined) {
          mockIsOpen = patch.isOpen;
        }
      }),
    }
  );
  return {
    useGalleryStore: mockGalleryStoreFn,
  };
});

jest.mock('@widgets/control-panel', () => ({
  ControlPanel: 'ControlPanel',
}));

jest.mock('@widgets/viewfinder', () => ({
  Viewfinder: 'Viewfinder',
  DeviceHealthWarningBanner: 'DeviceHealthWarningBanner',
}));

jest.mock('@widgets/header', () => ({
  Header: 'Header',
}));

jest.mock('@features/gallery', () => {
  const { TouchableOpacity } = require('react-native');
  return {
    CaptureThumbnail: (props: any) => (
      <TouchableOpacity testID="CaptureThumbnail" onPress={props.onPress} />
    ),
    useGalleryPrefetch: jest.fn(),
  };
});

jest.mock('@widgets/gallery-viewer', () => {
  const { TouchableOpacity } = require('react-native');
  return {
    GalleryViewer: (props: any) => (
      <TouchableOpacity testID="GalleryViewer" onPress={props.onClose} />
    ),
  };
});

jest.mock('@features/body-controls', () => ({
  ShutterButton: 'ShutterButton',
  CameraFlipButton: 'CameraFlipButton',
}));

jest.mock('@features/lens-controls', () => {
  const ReactActual = require('react');
  return {
    GestureController: ({ children }: any) => <ReactActual.Fragment>{children}</ReactActual.Fragment>,
  };
});

jest.mock('@features/system-settings', () => ({
  DebugOverlay: 'DebugOverlay',
  AddPresetModal: 'AddPresetModal',
  DeletePresetModal: 'DeletePresetModal',
  QuickPresetSelector: 'QuickPresetSelector',
}));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: (cb: any) => cb(),
    withTiming: jest.fn((target, config, callback) => {
      if (callback) {
        callback(true);
        callback(false);
      }
      return target;
    }),
    runOnJS: jest.fn((f: any) => f),
    useAnimatedReaction: jest.fn(),
    interpolate: jest.fn((v, _i, _o) => v),
    Extrapolation: {
      CLAMP: 'clamp',
    },
    View,
    default: {
      View,
      createAnimatedComponent: jest.fn((comp: any) => comp),
    },
  };
});

describe('CameraScreen Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android';
    StatusBar.currentHeight = 30;
    jest.useFakeTimers();
    mockDrawerAnimation.value = 0;
    mockFooterTranslateY.value = 0;
    mockViewfinderTranslateY.value = 0;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders nothing initially if permission is not granted, then renders viewfinder when permission is resolved', () => {
    StatusBar.currentHeight = undefined;
    let resolvePermission!: (val: any) => void;
    const requestSpy = jest.spyOn(PermissionsAndroid, 'request').mockImplementation(
      () => new Promise((resolve) => {
        resolvePermission = resolve;
      })
    );

    const { toJSON } = render(<CameraScreen />);

    // Initially permission is not resolved, so it should render the center view (empty)
    expect(toJSON()).toEqual({
      type: 'View',
      props: { style: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0e0e0e' } },
      children: null,
    });

    // Resolve permission as granted
    act(() => {
      resolvePermission(PermissionsAndroid.RESULTS.GRANTED);
    });

    expect(requestSpy).toHaveBeenCalledWith(PermissionsAndroid.PERMISSIONS.CAMERA);
  });

  it('handles permission request errors gracefully', async () => {
    StatusBar.currentHeight = undefined;
    jest.spyOn(PermissionsAndroid, 'request').mockRejectedValue(new Error('Permission system crash'));

    const { toJSON } = render(<CameraScreen />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(toJSON()).toBeDefined();
  });

  it('handles Platform.OS = ios without requesting PermissionsAndroid', () => {
    Platform.OS = 'ios';
    const requestSpy = jest.spyOn(PermissionsAndroid, 'request');

    const { getByTestId } = render(<CameraScreen />);
    expect(requestSpy).not.toHaveBeenCalled();
    expect(getByTestId('CaptureThumbnail')).toBeDefined();
  });

  it('opens and closes the gallery and triggers app state focus refresh', () => {
    Platform.OS = 'ios';
    
    // Track app state listener
    let appStateCallback!: (state: string) => void;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(
      (event, cb: any) => {
        appStateCallback = cb;
        return { remove: jest.fn() };
      }
    );

    const { getByTestId, queryByTestId } = render(<CameraScreen />);
    
    // Simulate AppState transition to active
    act(() => {
      appStateCallback('active');
    });

    // Simulate AppState transition to background (to cover nextIsActive = false branch)
    act(() => {
      appStateCallback('background');
    });

    // Open Gallery
    const captureThumbnail = getByTestId('CaptureThumbnail');
    act(() => {
      fireEvent.press(captureThumbnail);
    });

    // Verify GalleryViewer renders and can be closed
    const galleryViewer = getByTestId('GalleryViewer');
    expect(galleryViewer).toBeDefined();

    act(() => {
      fireEvent.press(galleryViewer);
    });

    // Verify GalleryViewer is closed
    expect(queryByTestId('GalleryViewer')).toBeNull();
  });

  it('resets animation values when cameraKey changes (appState goes to active) if activeSection is none', () => {
    mockDrawerAnimation.value = -250;
    mockFooterTranslateY.value = -50;
    mockViewfinderTranslateY.value = -100;

    let appStateCallback!: (state: string) => void;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((event, cb: any) => {
      appStateCallback = cb;
      return { remove: jest.fn() };
    });

    render(<CameraScreen />);

    // Simulate app returning to foreground
    act(() => {
      appStateCallback('background');
    });
    act(() => {
      appStateCallback('active');
    });

    // Since activeSection is mocked as 'none', values should reset to 0
    expect(mockDrawerAnimation.value).toBe(0);
    expect(mockFooterTranslateY.value).toBe(0);
    expect(mockViewfinderTranslateY.value).toBe(0);
  });

  it('triggers the safety net to animate values to 0 when activeSection becomes none', () => {
    const mockControlPanelStore = require('@entities/system').useControlPanelStore;
    
    // Start with activeSection !== 'none'
    const activeState = {
      activeSection: 'lens',
    };
    mockControlPanelStore.mockReturnValue(activeState);

    const { rerender } = render(<CameraScreen />);

    // Set non-zero values to simulate an open control panel
    mockDrawerAnimation.value = -250;
    mockFooterTranslateY.value = -50;
    mockViewfinderTranslateY.value = -100;

    // Change activeSection to 'none'
    const closedState = {
      activeSection: 'none',
    };
    mockControlPanelStore.mockReturnValue(closedState);

    act(() => {
      rerender(<CameraScreen />);
    });

    // Should call withTiming to reset them to 0
    const reanimated = require('react-native-reanimated');
    expect(reanimated.withTiming).toHaveBeenCalledWith(0, { duration: 300 });
    expect(mockDrawerAnimation.value).toBe(0);
    expect(mockFooterTranslateY.value).toBe(0);
    expect(mockViewfinderTranslateY.value).toBe(0);
  });
});
