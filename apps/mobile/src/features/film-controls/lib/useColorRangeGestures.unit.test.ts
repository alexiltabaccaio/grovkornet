import { renderHook } from '@testing-library/react-native';
import { useColorRangeGestures } from './useColorRangeGestures';
import * as reanimatedModule from 'react-native-reanimated';

const capturedPanCallbacks: any = {};
const mockPanGesture = {
  onStart: jest.fn().mockImplementation((cb) => {
    capturedPanCallbacks.onStart = cb;
    return mockPanGesture;
  }),
  onUpdate: jest.fn().mockImplementation((cb) => {
    capturedPanCallbacks.onUpdate = cb;
    return mockPanGesture;
  }),
};

const capturedTapCallbacks: any = {};
const mockTapGesture = {
  numberOfTaps: jest.fn().mockReturnThis(),
  maxDistance: jest.fn().mockReturnThis(),
  onEnd: jest.fn().mockImplementation((cb) => {
    capturedTapCallbacks.onEnd = cb;
    return mockTapGesture;
  }),
};

jest.mock('react-native-gesture-handler', () => {
  const original = jest.requireActual('react-native-gesture-handler');
  return {
    ...original,
    Gesture: {
      Pan: () => mockPanGesture,
      Tap: () => mockTapGesture,
      Simultaneous: jest.fn().mockImplementation((...args) => args),
    },
  };
});

describe('useColorRangeGestures', () => {
  let mockTrackWidth: { value: number };
  let mockLeftShared: { value: number };
  let mockRightShared: { value: number };
  let mockLimitLeftShared: { value: number };
  let mockLimitRightShared: { value: number };
  const mockUpdateLeftBound = jest.fn();
  const mockUpdateRightBound = jest.fn();

  beforeAll(() => {
    (reanimatedModule as any).useSharedValue = (val: any) => {
      return { value: val };
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockTrackWidth = { value: 300 };
    mockLeftShared = { value: 50 };
    mockRightShared = { value: 100 };
    mockLimitLeftShared = { value: 0 };
    mockLimitRightShared = { value: 150 };
  });

  it('configures gestures correctly', () => {
    renderHook(() =>
      useColorRangeGestures({
        trackWidth: mockTrackWidth as any,
        leftShared: mockLeftShared as any,
        rightShared: mockRightShared as any,
        limitLeftShared: mockLimitLeftShared as any,
        limitRightShared: mockLimitRightShared as any,
        updateLeftBound: mockUpdateLeftBound,
        updateRightBound: mockUpdateRightBound,
        leftDefault: 40,
        rightDefault: 70,
      })
    );

    expect(mockTapGesture.numberOfTaps).toHaveBeenCalledWith(2);
    expect(mockTapGesture.maxDistance).toHaveBeenCalledWith(20);
    expect(capturedPanCallbacks.onStart).toBeDefined();
    expect(capturedPanCallbacks.onUpdate).toBeDefined();
    expect(capturedTapCallbacks.onEnd).toBeDefined();
  });

  it('handles Pan onStart, selecting the closer thumb and triggering updates', () => {
    renderHook(() =>
      useColorRangeGestures({
        trackWidth: mockTrackWidth as any,
        leftShared: mockLeftShared as any,
        rightShared: mockRightShared as any,
        limitLeftShared: mockLimitLeftShared as any,
        limitRightShared: mockLimitRightShared as any,
        updateLeftBound: mockUpdateLeftBound,
        updateRightBound: mockUpdateRightBound,
        leftDefault: 40,
        rightDefault: 70,
      })
    );

    // Left is at 50, right is at 100. Min=0, Max=150, TrackWidth=300.
    // Touch near left thumb (e.g. x = 110)
    capturedPanCallbacks.onStart({ x: 110 });
    capturedPanCallbacks.onUpdate({ translationX: 10 });
    expect(mockUpdateLeftBound).toHaveBeenCalled();
    expect(mockUpdateRightBound).not.toHaveBeenCalled();

    // Reset mocks
    mockUpdateLeftBound.mockClear();
    mockUpdateRightBound.mockClear();

    // Touch near right thumb (e.g. x = 200)
    capturedPanCallbacks.onStart({ x: 200 });
    capturedPanCallbacks.onUpdate({ translationX: 10 });
    expect(mockUpdateRightBound).toHaveBeenCalled();
    expect(mockUpdateLeftBound).not.toHaveBeenCalled();
  });

  it('handles Tap onEnd (double tap reset) resetting to defaults', () => {
    renderHook(() =>
      useColorRangeGestures({
        trackWidth: mockTrackWidth as any,
        leftShared: mockLeftShared as any,
        rightShared: mockRightShared as any,
        limitLeftShared: mockLimitLeftShared as any,
        limitRightShared: mockLimitRightShared as any,
        updateLeftBound: mockUpdateLeftBound,
        updateRightBound: mockUpdateRightBound,
        leftDefault: 40,
        rightDefault: 70,
      })
    );

    capturedTapCallbacks.onEnd();
    expect(mockUpdateLeftBound).toHaveBeenCalledWith(40);
    expect(mockUpdateRightBound).toHaveBeenCalledWith(70);
  });
});
