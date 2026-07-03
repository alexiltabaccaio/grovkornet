import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { GalleryViewer } from '@widgets/gallery-viewer';
import { useVerificationStore } from '@entities/verification';
import { BackHandler, Platform } from 'react-native';
import Share from 'react-native-share';

// Control verification result dynamically in tests
let mockVerificationResult = true;

jest.mock('expo-modules-core', () => {
  const actual = jest.requireActual('expo-modules-core');
  return {
    ...actual,
    requireNativeViewManager: jest.fn(() => {
       
      const { View } = require('react-native');
      return View;
    }),
    requireNativeModule: jest.fn(() => ({
      verifyGrovkornetAuthenticity: jest.fn(() => Promise.resolve(mockVerificationResult)),
    })),
  };
});

jest.mock('@grovkornet/engine', () => {
  const actual = jest.requireActual('@grovkornet/engine');
  return {
    ...actual,
    verifyGrovkornetAuthenticity: jest.fn(() => {
      return Promise.resolve(mockVerificationResult);
    }),
  };
});

// Mock expo-file-system
jest.mock('expo-file-system/legacy', () => ({
  copyAsync: jest.fn().mockResolvedValue(true),
  cacheDirectory: 'file:///cache/',
}));

describe('GalleryViewer Integration', () => {
  const mockOnClose = jest.fn();
  let originalPlatformOS: typeof Platform.OS;

  // Helper to flush asynchronous tasks and allow timers to run
  const flushEffects = async () => {
    for (let i = 0; i < 4; i++) {
      await act(async () => {
        jest.runOnlyPendingTimers();
        await Promise.resolve();
      });
    }
  };

  const pressAndFlush = async (element: any) => {
    await act(async () => {
      fireEvent.press(element);
      jest.runOnlyPendingTimers();
      await Promise.resolve();
    });
    await flushEffects();
  };

  beforeAll(() => {
    originalPlatformOS = Platform.OS;
  });

  afterAll(() => {
    Platform.OS = originalPlatformOS;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerificationResult = true;
    Platform.OS = 'ios'; // default to iOS
    jest.useFakeTimers();

    act(() => {
      // Clear verification map
      useVerificationStore.setState({ verifiedMap: {} });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders loading placeholder initially and displays photo preview after load', async () => {
    const { getByTestId, queryByTestId, getByLabelText } = render(
      <GalleryViewer onClose={mockOnClose} initialUri="file:///test/1.jpg" />
    );

    // Verify initial placeholder image is rendered
    expect(getByTestId('gallery-placeholder-image')).toBeTruthy();

    // Flush all pending promises and timeouts
    await flushEffects();

    // Once loaded, the placeholder is removed (showPlaceholder = false)
    expect(queryByTestId('gallery-placeholder-image')).toBeNull();

    // Verify PhotoPreview contents and share button are rendered
    expect(getByLabelText('gallery.share_generic')).toBeTruthy();
  });

  it('updates the active preview photo when selecting a thumbnail from the gallery strip', async () => {
    const { queryByTestId, getByTestId, getByLabelText } = render(
      <GalleryViewer onClose={mockOnClose} initialUri="file:///test/1.jpg" />
    );

    await flushEffects();
    expect(queryByTestId('gallery-placeholder-image')).toBeNull();

    // By default, the first thumbnail (file:///test/1.jpg) is active.
    // Let's press the second thumbnail (file:///test/2.jpg) in the GalleryStrip.
    const thumbnail2 = getByTestId('gallery-strip-item-2');
    expect(thumbnail2).toBeTruthy();

    await pressAndFlush(thumbnail2);

    // Verify that the preview image updates by pressing generic share and checking shared URI
    const genericShareButton = getByLabelText('gallery.share_generic');
    await pressAndFlush(genericShareButton);

    expect(Share.open).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('2.jpg'),
      })
    );
  });

  it('triggers generic sharing flow when generic share button is pressed', async () => {
    const { queryByTestId, getByLabelText } = render(
      <GalleryViewer onClose={mockOnClose} initialUri="file:///test/1.jpg" />
    );

    await flushEffects();
    expect(queryByTestId('gallery-placeholder-image')).toBeNull();

    const genericShareButton = getByLabelText('gallery.share_generic');
    
    await pressAndFlush(genericShareButton);

    expect(Share.open).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('file:///'),
        type: 'image/jpeg',
      })
    );
  });

  it('handles Instagram sharing validation based on verification store', async () => {
    // Set verification mock to false initially
    mockVerificationResult = false;

    const { queryByTestId, getByLabelText } = render(
      <GalleryViewer onClose={mockOnClose} initialUri="file:///test/1.jpg" />
    );

    await flushEffects();
    expect(queryByTestId('gallery-placeholder-image')).toBeNull();

    // 1. When verification returns false, the button label should indicate it is unverified.
    const igUnverifiedButton = getByLabelText('gallery.unverified_badge');
    expect(igUnverifiedButton).toBeTruthy();

    // Pressing it should not trigger Instagram sharing (it shows Alert)
    act(() => {
      fireEvent.press(igUnverifiedButton);
    });
    expect(Share.shareSingle).not.toHaveBeenCalled();

    act(() => {
      useVerificationStore.setState({
        verifiedMap: {
          'file:///test/1.jpg': true,
        },
      });
    });
    await flushEffects();

    // Under verified state, the button label changes to share_instagram
    const igVerifiedButton = getByLabelText('gallery.share_instagram');
    expect(igVerifiedButton).toBeTruthy();

    await pressAndFlush(igVerifiedButton);

    expect(Share.shareSingle).toHaveBeenCalled();
  });

  it.skip('closes the gallery viewer when the hardware back button is pressed on Android', async () => {
    Platform.OS = 'android';
    // Spy on BackHandler subscription
    const addListenerSpy = jest.spyOn(BackHandler, 'addEventListener');

    render(<GalleryViewer onClose={mockOnClose} initialUri="file:///test/1.jpg" />);

    await flushEffects();

    // Get hardwareBackPress callback
    const calls = addListenerSpy.mock.calls;
    const backCall = calls.find(c => c[0] === 'hardwareBackPress');
    expect(backCall).toBeDefined();

    const handler = backCall![1];

    act(() => {
      const handled = handler();
      expect(handled).toBe(true);
    });

    expect(mockOnClose).toHaveBeenCalled();
    addListenerSpy.mockRestore();
  });
});
