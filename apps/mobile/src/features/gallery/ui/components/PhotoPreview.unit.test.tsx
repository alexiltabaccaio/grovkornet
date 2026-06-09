import React from 'react';
import { render, act } from '@testing-library/react-native';
import { PhotoPreview } from './PhotoPreview';
import * as reanimatedModule from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { GalleryItem } from '../../lib/types';

const mockPhotos: GalleryItem[] = [
  { uri: 'file:///test/1.jpg', id: '1' },
  { uri: 'file:///test/2.jpg', id: '2' },
  { uri: 'file:///test/3.jpg', id: '3' },
];

describe('PhotoPreview', () => {
  let capturedPanGesture: any;
  let capturedPinchGesture: any;
  let capturedTapGesture: any;
  let originalPan: any;
  let originalPinch: any;
  let originalTap: any;
  let originalTiming: any;
  let originalSpring: any;
  let originalUseSharedValue: any;

  beforeAll(() => {
    originalTiming = reanimatedModule.withTiming;
    originalSpring = reanimatedModule.withSpring;
    originalUseSharedValue = reanimatedModule.useSharedValue;

    (reanimatedModule as any).cancelAnimation = jest.fn();

    (reanimatedModule as any).withTiming = (value: any, config: any, callback: any) => {
      if (typeof callback === 'function') {
        callback(true);
      }
      return value;
    };

    (reanimatedModule as any).withSpring = (value: any, config: any, callback: any) => {
      if (typeof callback === 'function') {
        callback(true);
      }
      return value;
    };

    const useMockSharedValue = (initialVal: any) => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      return React.useMemo(() => ({ value: initialVal }), []);
    };

    (reanimatedModule as any).useSharedValue = useMockSharedValue;
  });

  afterAll(() => {
    (reanimatedModule as any).withTiming = originalTiming;
    (reanimatedModule as any).withSpring = originalSpring;
    (reanimatedModule as any).useSharedValue = originalUseSharedValue;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    capturedPanGesture = null;
    capturedPinchGesture = null;
    capturedTapGesture = null;

    originalPan = Gesture.Pan;
    Gesture.Pan = (...args: any[]) => {
      const gesture = originalPan(...args);
      capturedPanGesture = gesture;
      return gesture;
    };

    originalPinch = Gesture.Pinch;
    Gesture.Pinch = (...args: any[]) => {
      const gesture = originalPinch(...args);
      capturedPinchGesture = gesture;
      return gesture;
    };

    originalTap = Gesture.Tap;
    Gesture.Tap = (...args: any[]) => {
      const gesture = originalTap(...args);
      capturedTapGesture = gesture;
      return gesture;
    };
  });

  afterEach(() => {
    Gesture.Pan = originalPan;
    Gesture.Pinch = originalPinch;
    Gesture.Tap = originalTap;
  });

  it('renders no photos text if empty', () => {
    const { getByText } = render(
      <PhotoPreview selectedPhoto={null} photos={[]} onPhotoVisible={jest.fn()} />
    );
    expect(getByText('gallery.no_photos')).toBeTruthy();
  });

  it('renders correctly with photos and displays center image', () => {
    const { toJSON } = render(
      <PhotoPreview
        selectedPhoto={mockPhotos[1]}
        photos={mockPhotos}
        onPhotoVisible={jest.fn()}
      />
    );
    expect(toJSON()).toBeDefined();
  });

  it('updates slots on programmatic jump (adjacent, diff = 1)', () => {
    const onPhotoVisibleMock = jest.fn();
    const { rerender } = render(
      <PhotoPreview
        selectedPhoto={mockPhotos[0]}
        photos={mockPhotos}
        onPhotoVisible={onPhotoVisibleMock}
      />
    );

    act(() => {
      rerender(
        <PhotoPreview
          selectedPhoto={mockPhotos[1]}
          photos={mockPhotos}
          onPhotoVisible={onPhotoVisibleMock}
        />
      );
    });

    expect(onPhotoVisibleMock).not.toHaveBeenCalled();
  });

  it('updates slots on programmatic jump (distant, diff > 1 forward and backward)', () => {
    const onPhotoVisibleMock = jest.fn();
    const { rerender } = render(
      <PhotoPreview
        selectedPhoto={mockPhotos[0]}
        photos={mockPhotos}
        onPhotoVisible={onPhotoVisibleMock}
      />
    );

    // Jump forward (diff = 2 > 0)
    act(() => {
      rerender(
        <PhotoPreview
          selectedPhoto={mockPhotos[2]}
          photos={mockPhotos}
          onPhotoVisible={onPhotoVisibleMock}
        />
      );
    });

    // Jump backward (diff = -2 < 0)
    act(() => {
      rerender(
        <PhotoPreview
          selectedPhoto={mockPhotos[0]}
          photos={mockPhotos}
          onPhotoVisible={onPhotoVisibleMock}
        />
      );
    });

    expect(onPhotoVisibleMock).not.toHaveBeenCalled();
  });

  describe('Gesture Handlers', () => {
    it('simulates gesture pan start, update, and end (swipe left to next photo)', () => {
      const onPhotoVisibleMock = jest.fn();
      render(
        <PhotoPreview
          selectedPhoto={mockPhotos[0]}
          photos={mockPhotos}
          onPhotoVisible={onPhotoVisibleMock}
        />
      );

      expect(capturedPanGesture).toBeDefined();

      act(() => {
        // Start the drag
        capturedPanGesture._onStart();
        // Update drag position: drag left by 400px (exceeds default width/2 threshold of 375)
        capturedPanGesture._onUpdate({ translationX: -400 });
        // End drag
        capturedPanGesture._onEnd({ velocityX: -100 });
      });

      expect(onPhotoVisibleMock).toHaveBeenCalledWith(mockPhotos[1]);
    });

    it('simulates gesture pan start, update, and end (swipe right to previous photo)', () => {
      const onPhotoVisibleMock = jest.fn();
      render(
        <PhotoPreview
          selectedPhoto={mockPhotos[1]}
          photos={mockPhotos}
          onPhotoVisible={onPhotoVisibleMock}
        />
      );

      act(() => {
        capturedPanGesture._onStart();
        // Drag right by 400px (exceeds 375)
        capturedPanGesture._onUpdate({ translationX: 400 });
        capturedPanGesture._onEnd({ velocityX: 100 });
      });

      expect(onPhotoVisibleMock).toHaveBeenCalledWith(mockPhotos[0]);
    });

    it('simulates fast flick gesture (high velocity swipe)', () => {
      const onPhotoVisibleMock = jest.fn();
      render(
        <PhotoPreview
          selectedPhoto={mockPhotos[0]}
          photos={mockPhotos}
          onPhotoVisible={onPhotoVisibleMock}
        />
      );

      act(() => {
        capturedPanGesture._onStart();
        // Short drag left, but high velocity
        capturedPanGesture._onUpdate({ translationX: -50 });
        capturedPanGesture._onEnd({ velocityX: -600 });
      });

      expect(onPhotoVisibleMock).toHaveBeenCalledWith(mockPhotos[1]);
    });

    it('simulates slow short gesture that snaps back (no transition)', () => {
      const onPhotoVisibleMock = jest.fn();
      render(
        <PhotoPreview
          selectedPhoto={mockPhotos[0]}
          photos={mockPhotos}
          onPhotoVisible={onPhotoVisibleMock}
        />
      );

      act(() => {
        capturedPanGesture._onStart();
        // Short drag, slow release
        capturedPanGesture._onUpdate({ translationX: -10 });
        capturedPanGesture._onEnd({ velocityX: -100 });
      });

      expect(onPhotoVisibleMock).not.toHaveBeenCalled();
    });

    it('does not transition past boundaries (swipe right on first photo)', () => {
      const onPhotoVisibleMock = jest.fn();
      render(
        <PhotoPreview
          selectedPhoto={mockPhotos[0]}
          photos={mockPhotos}
          onPhotoVisible={onPhotoVisibleMock}
        />
      );

      act(() => {
        capturedPanGesture._onStart();
        capturedPanGesture._onUpdate({ translationX: 400 });
        capturedPanGesture._onEnd({ velocityX: 600 });
      });

      expect(onPhotoVisibleMock).not.toHaveBeenCalled();
    });

    it('does not transition past boundaries (swipe left on last photo)', () => {
      const onPhotoVisibleMock = jest.fn();
      render(
        <PhotoPreview
          selectedPhoto={mockPhotos[2]}
          photos={mockPhotos}
          onPhotoVisible={onPhotoVisibleMock}
        />
      );

      act(() => {
        capturedPanGesture._onStart();
        capturedPanGesture._onUpdate({ translationX: -400 });
        capturedPanGesture._onEnd({ velocityX: -600 });
      });

      expect(onPhotoVisibleMock).not.toHaveBeenCalled();
    });

    it('handles swipe log when __DEV__ is false', () => {
      const originalDev = (global as any).__DEV__;
      (global as any).__DEV__ = false;

      render(
        <PhotoPreview
          selectedPhoto={mockPhotos[0]}
          photos={mockPhotos}
          onPhotoVisible={jest.fn()}
        />
      );

      act(() => {
        capturedPanGesture._onStart();
        capturedPanGesture._onUpdate({ translationX: -400 });
        capturedPanGesture._onEnd({ velocityX: -100 });
      });

      (global as any).__DEV__ = originalDev;
    });

    it('handles cancelled/unfinished animations', () => {
      // Override with timing/spring to mock finished = false
      (reanimatedModule as any).withTiming = (value: any, config: any, callback: any) => {
        if (typeof callback === 'function') callback(false);
        return value;
      };
      (reanimatedModule as any).withSpring = (value: any, config: any, callback: any) => {
        if (typeof callback === 'function') callback(false);
        return value;
      };

      const onPhotoVisibleMock = jest.fn();
      const { rerender } = render(
        <PhotoPreview
          selectedPhoto={mockPhotos[0]}
          photos={mockPhotos}
          onPhotoVisible={onPhotoVisibleMock}
        />
      );

      // Trigger programmatic jump (adjacent)
      act(() => {
        rerender(
          <PhotoPreview
            selectedPhoto={mockPhotos[1]}
            photos={mockPhotos}
            onPhotoVisible={onPhotoVisibleMock}
          />
        );
      });

      // Trigger programmatic jump (distant)
      act(() => {
        rerender(
          <PhotoPreview
            selectedPhoto={mockPhotos[2]}
            photos={mockPhotos}
            onPhotoVisible={onPhotoVisibleMock}
          />
        );
      });

      // Re-mount component to clear ref state and trigger swipe
      const { unmount } = render(
        <PhotoPreview
          selectedPhoto={mockPhotos[0]}
          photos={mockPhotos}
          onPhotoVisible={onPhotoVisibleMock}
        />
      );

      act(() => {
        capturedPanGesture._onStart();
        capturedPanGesture._onUpdate({ translationX: -400 });
        capturedPanGesture._onEnd({ velocityX: -100 });
      });

      expect(onPhotoVisibleMock).toHaveBeenCalledTimes(1);
      unmount();
    });

    it('handles missing photo in rendering list gracefully', () => {
      const sparsePhotos = [mockPhotos[0], null as any];
      const { toJSON } = render(
        <PhotoPreview
          selectedPhoto={mockPhotos[0]}
          photos={sparsePhotos}
          onPhotoVisible={jest.fn()}
        />
      );
      expect(toJSON()).toBeDefined();
    });

    describe('Zoom and Double Tap Gestures', () => {
      it('initializes zoom scale at 1 and handles double tap to zoom in/out', () => {
        const { toJSON } = render(
          <PhotoPreview
            selectedPhoto={mockPhotos[0]}
            photos={mockPhotos}
            onPhotoVisible={jest.fn()}
          />
        );
        expect(toJSON()).toBeDefined();
        expect(capturedTapGesture).toBeDefined();

        act(() => {
          // Double tap gesture
          capturedTapGesture._onEnd({ x: 200, y: 300 });
        });
      });

      it('handles pinch gesture start, update, and end', () => {
        render(
          <PhotoPreview
            selectedPhoto={mockPhotos[0]}
            photos={mockPhotos}
            onPhotoVisible={jest.fn()}
          />
        );
        expect(capturedPinchGesture).toBeDefined();

        act(() => {
          capturedPinchGesture._onStart();
          capturedPinchGesture._onUpdate({ scale: 2 });
          capturedPinchGesture._onEnd();
        });
      });

      it('prevents photo swiping when zoomed in', () => {
        const onPhotoVisibleMock = jest.fn();
        render(
          <PhotoPreview
            selectedPhoto={mockPhotos[0]}
            photos={mockPhotos}
            onPhotoVisible={onPhotoVisibleMock}
          />
        );

        // Zoom in first with double tap
        act(() => {
          capturedTapGesture._onEnd({ x: 200, y: 300 });
        });

        // Try to pan / swipe to the next photo
        act(() => {
          capturedPanGesture._onStart({ translationX: 0 });
          capturedPanGesture._onUpdate({ translationX: -400 });
          capturedPanGesture._onEnd({ velocityX: -600 });
        });

        // Swipe should have been ignored (onPhotoVisibleMock not called)
        expect(onPhotoVisibleMock).not.toHaveBeenCalled();
      });
    });
  });
});

