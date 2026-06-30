import React from 'react';
import { render, act } from '@testing-library/react-native';
import { View, Dimensions } from 'react-native';
import * as reanimated from 'react-native-reanimated';
import { GestureController } from './GestureController';
import { useControlPanelStore } from '@entities/system';
import { Gesture } from 'react-native-gesture-handler';
import { useBodyStore } from '@entities/body';

// Mock the stores
jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn(),
  useControlPanelStore: jest.fn(),
}));

describe('GestureController', () => {
  const mockSetActiveSection = jest.fn();
  let currentActiveSection = 'none';

  let capturedTapGesture: any;
  let capturedPanGesture: any;
  let originalTap: any;
  let originalPan: any;
  let originalSpring: any;
  let originalUseSharedValue: any;
  let originalAnimatedReaction: any;
  let capturedAspectReaction: any;
  let capturedFooterReaction: any;
  let reactionCount = 0;
  let mockTranslateY: any;
  let _mockStartY: any;
  let sharedValuesArray: any[] = [];
  let dateNowSpy: any;
  const prevValues = new Map<number, any>();

  beforeAll(() => {
    originalSpring = reanimated.withSpring;
    originalUseSharedValue = reanimated.useSharedValue;
    originalAnimatedReaction = reanimated.useAnimatedReaction;

    (reanimated as any).withSpring = (value: any, config: any, callback: any) => {
      if (typeof callback === 'function') {
        callback(true);
      }
      return value;
    };

    (reanimated as any).useSharedValue = (initialVal: any) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const ref = React.useRef<any>(null);
      if (!ref.current) {
        ref.current = { value: initialVal };
        sharedValuesArray.push(ref.current);
        if (sharedValuesArray.length === 1) {
          mockTranslateY = ref.current;
        } else if (sharedValuesArray.length === 2) {
          _mockStartY = ref.current;
        }
      }
      return ref.current;
    };

    (reanimated as any).useAnimatedReaction = (prepare: any, react: any) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const indexRef = React.useRef<number | null>(null);
      if (indexRef.current === null) {
        indexRef.current = reactionCount;
        if (reactionCount === 0) {
          capturedAspectReaction = react;
        } else if (reactionCount === 1) {
          capturedFooterReaction = react;
        }
        reactionCount++;
      }
      const index = indexRef.current;

      // eslint-disable-next-line react-hooks/rules-of-hooks
      React.useEffect(() => {
        const val = prepare();
        const prev = prevValues.has(index) ? prevValues.get(index) : null;
        if (val !== prev) {
          react(val, prev);
          prevValues.set(index, val);
        }
      });
    };
  });

  afterAll(() => {
    (reanimated as any).withSpring = originalSpring;
    (reanimated as any).useSharedValue = originalUseSharedValue;
    (reanimated as any).useAnimatedReaction = originalAnimatedReaction;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    currentActiveSection = 'none';
    sharedValuesArray = [];
    mockTranslateY = null;
    _mockStartY = null;
    capturedAspectReaction = null;
    capturedFooterReaction = null;
    reactionCount = 0;
    prevValues.clear();

    (useControlPanelStore as unknown as jest.Mock).mockImplementation((selector?: (state: any) => any) => {
      const state = {
        activeSection: currentActiveSection,
        setActiveSection: mockSetActiveSection,
      };
      return selector ? selector(state) : state;
    });

    capturedTapGesture = null;
    capturedPanGesture = null;
    originalTap = Gesture.Tap;
    originalPan = Gesture.Pan;

    Gesture.Tap = (...args: any[]) => {
      const gesture = originalTap(...args);
      capturedTapGesture = gesture;
      return gesture;
    };

    Gesture.Pan = (...args: any[]) => {
      const gesture = originalPan(...args);
      capturedPanGesture = new Proxy(gesture, {
        get(target, prop) {
          if (prop === '_onChange') {
            const originalOnChange = target[prop];
            if (typeof originalOnChange === 'function') {
              return (event: any) => {
                const eventWithChangeY = {
                  changeY: event && event.changeY !== undefined ? event.changeY : (event ? event.translationY : undefined),
                  ...event,
                };
                return originalOnChange(eventWithChangeY);
              };
            }
          }
          return target[prop];
        }
      });
      return gesture;
    };
  });

  afterEach(() => {
    Gesture.Tap = originalTap;
    Gesture.Pan = originalPan;
    jest.useRealTimers();
    if (dateNowSpy) {
      dateNowSpy.mockRestore();
    }
  });

  it('should render children correctly', () => {
    const { getByTestId } = render(
      <GestureController>
        <View testID="test-child" />
      </GestureController>
    );
    expect(getByTestId('test-child')).toBeDefined();
  });

  it('handles Tap gesture to close active section instantly when zoom is 1.0', () => {
    currentActiveSection = 'lens';
    const bodyStore = useBodyStore.getState();
    bodyStore.zoom.value = 1.0;

    render(<GestureController />);

    expect(capturedTapGesture).toBeDefined();

    act(() => {
      capturedTapGesture._onEnd();
    });

    expect(mockSetActiveSection).toHaveBeenCalledWith('none');
  });

  it('does not close section on Tap gesture if activeSection is none', () => {
    currentActiveSection = 'none';
    const bodyStore = useBodyStore.getState();
    bodyStore.zoom.value = 1.0;

    render(<GestureController />);

    act(() => {
      capturedTapGesture._onEnd();
    });

    expect(mockSetActiveSection).not.toHaveBeenCalled();
  });

  it('handles Tap gesture to close active section after delay when zoom is not 1.0', () => {
    currentActiveSection = 'lens';
    const bodyStore = useBodyStore.getState();
    bodyStore.zoom.value = 2.0;

    render(<GestureController />);

    act(() => {
      capturedTapGesture._onEnd();
    });

    // Should not close instantly
    expect(mockSetActiveSection).not.toHaveBeenCalled();

    // Advance fake timers by 200ms
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(mockSetActiveSection).toHaveBeenCalledWith('none');
  });

  it('handles DoubleTap gesture to reset zoom and cancel close when zoom is not 1.0', () => {
    currentActiveSection = 'lens';
    const bodyStore = useBodyStore.getState();
    bodyStore.zoom.value = 2.0;

    let mockTime = 1000;
    dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => mockTime);

    render(<GestureController />);

    // First tap
    act(() => {
      capturedTapGesture._onEnd();
    });
    expect(mockSetActiveSection).not.toHaveBeenCalled();

    // Simulate second tap 100ms later
    mockTime = 1100;
    act(() => {
      capturedTapGesture._onEnd();
    });

    // Zoom should be reset to 1.0
    expect(bodyStore.zoom.value).toBe(1.0);

    // Fast-forward all timers to make sure the timeout was cleared and setActiveSection is not called
    act(() => {
      jest.runAllTimers();
    });

    expect(mockSetActiveSection).not.toHaveBeenCalled();
  });

  it('handles Pan gesture updates and does not dismiss on Pan end', () => {
    currentActiveSection = 'lens';
    render(<GestureController />);

    expect(capturedPanGesture).toBeDefined();

    act(() => {
      capturedPanGesture._onStart();
    });

    act(() => {
      // Simulate panning up (negative translationY)
      capturedPanGesture._onChange({ translationY: -150 });
    });

    expect(mockTranslateY.value).toBe(-150);

    act(() => {
      capturedPanGesture._onEnd({ translationY: -150, velocityY: 0 });
    });

    // Should NOT close the active section on pan release
    expect(mockSetActiveSection).not.toHaveBeenCalled();
    // translateY should stay at -150 (it persists)
    expect(mockTranslateY.value).toBe(-150);
  });

  it('handles Pan gesture end with high velocity and does not dismiss', () => {
    currentActiveSection = 'lens';
    render(<GestureController />);

    act(() => {
      capturedPanGesture._onStart();
    });

    act(() => {
      capturedPanGesture._onChange({ translationY: -20 });
    });

    expect(mockTranslateY.value).toBe(-20);

    act(() => {
      capturedPanGesture._onEnd({ translationY: -20, velocityY: -600 });
    });

    // High velocity should NOT dismiss
    expect(mockSetActiveSection).not.toHaveBeenCalled();
    // And position persists
    expect(mockTranslateY.value).toBe(-20);
  });

  it('does not dismiss on Pan gesture if threshold and velocity are not met', () => {
    currentActiveSection = 'lens';
    render(<GestureController />);

    act(() => {
      capturedPanGesture._onStart();
    });

    act(() => {
      capturedPanGesture._onChange({ translationY: -20 });
    });

    act(() => {
      capturedPanGesture._onEnd({ translationY: -50, velocityY: -100 });
    });

    expect(mockSetActiveSection).not.toHaveBeenCalled();
  });

  it('does not pan if translationY is positive (swiping down) when at 0', () => {
    currentActiveSection = 'lens';
    render(<GestureController />);

    act(() => {
      capturedPanGesture._onStart();
    });

    act(() => {
      // Positive translationY (swipe down) should be ignored
      capturedPanGesture._onChange({ translationY: 50 });
    });

    expect(mockTranslateY.value).toBe(0);
    expect(mockSetActiveSection).not.toHaveBeenCalled();
  });

  it('does not pan if activeSection is none on Pan change', () => {
    currentActiveSection = 'none';
    render(<GestureController />);

    act(() => {
      capturedPanGesture._onStart();
    });

    act(() => {
      capturedPanGesture._onChange({ translationY: -20 });
    });

    expect(mockTranslateY.value).toBe(0);
    expect(mockSetActiveSection).not.toHaveBeenCalled();
  });

  it('resets translateY when activeSection becomes none', () => {
    currentActiveSection = 'lens';
    const { rerender } = render(
      <GestureController>
        <View />
      </GestureController>
    );

    act(() => {
      capturedPanGesture._onStart();
    });

    act(() => {
      capturedPanGesture._onChange({ translationY: -100 });
    });

    expect(mockTranslateY.value).toBe(-100);

    // Simulate closing active section
    act(() => {
      currentActiveSection = 'none';
      rerender(
        <GestureController>
          <View key="changed" />
        </GestureController>
      );
    });

    expect(mockTranslateY.value).toBe(0);
  });

  it('does not close active section on Tap if pan gesture was active and moved', () => {
    currentActiveSection = 'lens';
    const bodyStore = useBodyStore.getState();
    bodyStore.zoom.value = 1.0;

    render(<GestureController />);

    act(() => {
      capturedPanGesture._onStart();
    });

    act(() => {
      capturedPanGesture._onChange({ translationY: -10 });
    });

    act(() => {
      capturedTapGesture._onEnd();
    });

    // Should NOT close the section because we moved/panned
    expect(mockSetActiveSection).not.toHaveBeenCalled();
  });

  it('allows Tap gesture to close active section on subsequent taps after a pan gesture', () => {
    currentActiveSection = 'lens';
    const bodyStore = useBodyStore.getState();
    bodyStore.zoom.value = 1.0;

    render(<GestureController />);

    // 1. Simulate pan gesture (sets hasMoved.value = true)
    act(() => {
      capturedPanGesture._onStart();
    });

    act(() => {
      capturedPanGesture._onChange({ translationY: -50 });
    });

    act(() => {
      capturedPanGesture._onEnd({ translationY: -50, velocityY: 0 });
    });

    // 2. Simulate tap gesture (calls _onBegin to reset hasMoved.value = false, then _onEnd to tap)
    act(() => {
      if (capturedTapGesture._onBegin) {
        capturedTapGesture._onBegin();
      }
      capturedTapGesture._onEnd();
    });

    // Should successfully close the active section on this tap
    expect(mockSetActiveSection).toHaveBeenCalledWith('none');
  });

  it('resets translateY when aspect ratio changes', () => {
    currentActiveSection = 'lens';
    render(<GestureController />);

    act(() => {
      capturedPanGesture._onStart();
    });

    act(() => {
      capturedPanGesture._onChange({ translationY: -100 });
    });

    expect(mockTranslateY.value).toBe(-100);

    // Simulate aspect ratio change (from 1 to 2)
    act(() => {
      if (capturedAspectReaction) {
        capturedAspectReaction(2, 1);
      }
    });

    expect(mockTranslateY.value).toBe(0);
  });

  it('clamps translateY to footerTranslateY during pan and reacts to footerTranslateY changes', () => {
    currentActiveSection = 'lens';
    const mockFooterTranslateY = { value: -120 };
    render(<GestureController footerTranslateY={mockFooterTranslateY as any} />);

    act(() => {
      capturedPanGesture._onStart();
    });

    act(() => {
      // Panning up past the limit (-300 is past limit: -120 - 144 = -264)
      capturedPanGesture._onChange({ translationY: -300 });
    });

    // translateY should be clamped to -264
    expect(mockTranslateY.value).toBe(-264);

    // End and finalize the pan gesture so isPanning becomes false and reactions are allowed to update translateY
    act(() => {
      if (capturedPanGesture._onEnd) {
        capturedPanGesture._onEnd({ translationY: -300, velocityY: 0 });
      }
      if (capturedPanGesture._onFinalize) {
        capturedPanGesture._onFinalize();
      }
    });

    // Now simulate footerTranslateY moving lower (e.g. from -120 to -80)
    act(() => {
      mockFooterTranslateY.value = -80;
      if (capturedFooterReaction) {
        capturedFooterReaction(-80 - 144, -120 - 144);
      }
    });

    // translateY should be pushed down to -224
    expect(mockTranslateY.value).toBe(-224);
  });

  it('calculates the dynamic limit based on aspect ratios when viewport dimensions are present', () => {
    currentActiveSection = 'lens';
    
    // Spy on Dimensions.get to return a valid portrait screen
    const dimensionsSpy = jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 1080,
      height: 1920,
      scale: 1,
      fontScale: 1,
    });

    const bodyStore = useBodyStore.getState();
    const mockFooterTranslateY = { value: -250 }; // drawer pulled up completely

    // 1. Test aspect ratio 16:9 (aspectRatio value = 1) -> L_bottom should be 0, limit should be -250 - 144 + 0 = -394
    bodyStore.aspectRatio.value = 1;
    const { rerender } = render(<GestureController footerTranslateY={mockFooterTranslateY as any} />);

    act(() => {
      capturedPanGesture._onStart();
    });
    act(() => {
      capturedPanGesture._onChange({ translationY: -500 });
    });
    // With 16:9, limit = -394
    expect(mockTranslateY.value).toBe(-394);

    // limit = -250 - 144 + 356.5 = -37.5
    bodyStore.aspectRatio.value = 2;
    rerender(<GestureController footerTranslateY={mockFooterTranslateY as any} />);

    act(() => {
      capturedPanGesture._onStart();
    });
    act(() => {
      capturedPanGesture._onChange({ translationY: -500 });
    });
    expect(mockTranslateY.value).toBe(-37.5);

    dimensionsSpy.mockRestore();
  });

  it('ignores translationY if translationY is NaN in onChange', () => {
    currentActiveSection = 'lens';
    render(<GestureController />);

    act(() => {
      capturedPanGesture._onStart();
    });

    act(() => {
      capturedPanGesture._onChange({ translationY: -100 });
    });
    expect(mockTranslateY.value).toBe(-100);

    act(() => {
      // Send NaN, should be ignored
      capturedPanGesture._onChange({ translationY: NaN });
    });
    // Should stay at -100
    expect(mockTranslateY.value).toBe(-100);
  });

  it('uses viewfinderTranslateY from props when provided', () => {
    currentActiveSection = 'lens';
    const mockViewfinderTranslateY = { value: 0 };
    render(<GestureController viewfinderTranslateY={mockViewfinderTranslateY as any} />);

    act(() => {
      capturedPanGesture._onStart();
    });

    act(() => {
      capturedPanGesture._onChange({ translationY: -150 });
    });

    expect(mockViewfinderTranslateY.value).toBe(-150);
  });
});

