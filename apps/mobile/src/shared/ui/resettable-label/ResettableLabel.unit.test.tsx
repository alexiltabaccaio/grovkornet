import React from 'react';
import { render, act } from '@testing-library/react-native';
import { ResettableLabel } from './ResettableLabel';
import * as Haptics from '@shared/lib/haptics';

// Mock Haptics
jest.mock('@shared/lib/haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Medium: 'medium',
  },
}));

// Mock Gesture.Tap fluent chain
let capturedOnEndCallback: any = null;
const mockTapGesture: any = {
  enabled: jest.fn().mockImplementation(() => mockTapGesture),
  numberOfTaps: jest.fn().mockReturnThis(),
  maxDistance: jest.fn().mockReturnThis(),
  onEnd: jest.fn().mockImplementation((cb) => {
    capturedOnEndCallback = cb;
    return mockTapGesture;
  }),
};

jest.mock('react-native-gesture-handler', () => {
  const original = jest.requireActual('react-native-gesture-handler');
  return {
    ...original,
    Gesture: {
      Tap: () => mockTapGesture,
    },
    GestureDetector: ({ children }: any) => children,
  };
});

describe('ResettableLabel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedOnEndCallback = null;
  });

  it('renders text label when onReset is not provided', () => {
    const { getByText } = render(
      <ResettableLabel label="My Label" />
    );

    expect(getByText('My Label')).toBeTruthy();
  });

  it('renders label inside GestureDetector and configures double tap when onReset is provided', () => {
    const onResetMock = jest.fn();
    const { getByText } = render(
      <ResettableLabel label="Clickable Label" onReset={onResetMock} />
    );

    expect(getByText('Clickable Label')).toBeTruthy();
    expect(mockTapGesture.numberOfTaps).toHaveBeenCalledWith(2);
    expect(mockTapGesture.maxDistance).toHaveBeenCalledWith(20);
    expect(mockTapGesture.onEnd).toHaveBeenCalled();
  });

  it('executes Haptics and onReset when the double tap gesture ends', () => {
    const onResetMock = jest.fn();
    render(<ResettableLabel label="Interactive Label" onReset={onResetMock} />);

    expect(capturedOnEndCallback).toBeDefined();

    act(() => {
      capturedOnEndCallback();
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    expect(onResetMock).toHaveBeenCalled();
  });
});
