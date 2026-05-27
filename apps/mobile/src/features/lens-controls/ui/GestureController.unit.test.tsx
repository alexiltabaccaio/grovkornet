import React from 'react';
import { render, act } from '@testing-library/react-native';
import { View } from 'react-native';
import * as reanimated from 'react-native-reanimated';
import { GestureController } from './GestureController';
import { useSystemStore } from '@entities/system';
import { Gesture } from 'react-native-gesture-handler';

// Mock the stores
jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn(),
}));

describe('GestureController', () => {
  const mockSetActiveSection = jest.fn();
  let currentActiveSection = 'none';

  let capturedTapGesture: any;
  let capturedPanGesture: any;
  let originalTap: any;
  let originalPan: any;
  let originalSpring: any;

  beforeAll(() => {
    originalSpring = reanimated.withSpring;
    (reanimated as any).withSpring = (value: any, config: any, callback: any) => {
      if (typeof callback === 'function') {
        callback(true);
      }
      return value;
    };
  });

  afterAll(() => {
    (reanimated as any).withSpring = originalSpring;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    currentActiveSection = 'none';

    (useSystemStore as unknown as jest.Mock).mockImplementation((selector?: (state: any) => any) => {
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
      capturedPanGesture = gesture;
      return gesture;
    };
  });

  afterEach(() => {
    Gesture.Tap = originalTap;
    Gesture.Pan = originalPan;
  });

  it('should render children correctly', () => {
    const { getByTestId } = render(
      <GestureController>
        <View testID="test-child" />
      </GestureController>
    );
    expect(getByTestId('test-child')).toBeDefined();
  });

  it('handles Tap gesture to close active section', () => {
    currentActiveSection = 'lens';
    render(<GestureController />);

    expect(capturedTapGesture).toBeDefined();

    act(() => {
      capturedTapGesture._onEnd();
    });

    expect(mockSetActiveSection).toHaveBeenCalledWith('none');
  });

  it('does not close section on Tap gesture if activeSection is none', () => {
    currentActiveSection = 'none';
    render(<GestureController />);

    act(() => {
      capturedTapGesture._onEnd();
    });

    expect(mockSetActiveSection).not.toHaveBeenCalled();
  });

  it('handles Pan gesture updates and end with thresholds (swipe up to dismiss)', () => {
    currentActiveSection = 'lens';
    render(<GestureController />);

    expect(capturedPanGesture).toBeDefined();

    act(() => {
      // Simulate panning up (negative translationY)
      capturedPanGesture._onChange({ translationY: -50 });
      // End gesture with translation exceeding threshold (-100)
      capturedPanGesture._onEnd({ translationY: -150, velocityY: 0 });
    });

    expect(mockSetActiveSection).toHaveBeenCalledWith('none');
  });

  it('handles Pan gesture end with high velocity dismiss', () => {
    currentActiveSection = 'lens';
    render(<GestureController />);

    act(() => {
      capturedPanGesture._onChange({ translationY: -20 });
      // End gesture with velocity exceeding threshold (-500)
      capturedPanGesture._onEnd({ translationY: -50, velocityY: -600 });
    });

    expect(mockSetActiveSection).toHaveBeenCalledWith('none');
  });

  it('does not dismiss on Pan gesture if threshold and velocity are not met', () => {
    currentActiveSection = 'lens';
    render(<GestureController />);

    act(() => {
      capturedPanGesture._onChange({ translationY: -20 });
      capturedPanGesture._onEnd({ translationY: -50, velocityY: -100 });
    });

    expect(mockSetActiveSection).not.toHaveBeenCalled();
  });

  it('does not pan if translationY is positive (swiping down)', () => {
    currentActiveSection = 'lens';
    render(<GestureController />);

    act(() => {
      // Positive translationY (swipe down) should be ignored
      capturedPanGesture._onChange({ translationY: 50 });
    });

    expect(mockSetActiveSection).not.toHaveBeenCalled();
  });

  it('does not pan or animate back if activeSection is none on Pan end', () => {
    currentActiveSection = 'none';
    render(<GestureController />);

    act(() => {
      capturedPanGesture._onChange({ translationY: -20 });
      capturedPanGesture._onEnd({ translationY: -150, velocityY: 0 });
    });

    expect(mockSetActiveSection).not.toHaveBeenCalled();
  });
});

