import { renderHook } from '@testing-library/react-native';
import { useDoubleTapGesture } from './useDoubleTapGesture';
import * as reanimatedModule from 'react-native-reanimated';

const capturedDoubleTapCallbacks: any = {};
const mockDoubleTapGesture = {
  numberOfTaps: jest.fn().mockReturnThis(),
  maxDelay: jest.fn().mockReturnThis(),
  maxDuration: jest.fn().mockReturnThis(),
  maxDistance: jest.fn().mockReturnThis(),
  onEnd: jest.fn().mockImplementation((cb) => {
    capturedDoubleTapCallbacks.onEnd = cb;
    return mockDoubleTapGesture;
  }),
};

jest.mock('react-native-gesture-handler', () => {
  const original = jest.requireActual('react-native-gesture-handler');
  return {
    ...original,
    Gesture: {
      Tap: () => mockDoubleTapGesture,
    },
  };
});

describe('useDoubleTapGesture', () => {
  let mockZoomScale: { value: number };
  let mockZoomTranslateX: { value: number };
  let mockZoomTranslateY: { value: number };
  let mockIsZoomed: { value: boolean };
  let mockIsTransitioning: { value: boolean };
  let mockRecentlyStoppedDecay: { value: number };

  beforeAll(() => {
    (reanimatedModule as any).withTiming = (value: any) => value;
    (reanimatedModule as any).useSharedValue = (val: any) => {
      return { value: val };
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockZoomScale = { value: 1 };
    mockZoomTranslateX = { value: 0 };
    mockZoomTranslateY = { value: 0 };
    mockIsZoomed = { value: false };
    mockIsTransitioning = { value: false };
    mockRecentlyStoppedDecay = { value: 0 };
  });

  it('configures double tap gesture correctly', () => {
    renderHook(() =>
      useDoubleTapGesture({
        width: 400,
        height: 800,
        zoomScale: mockZoomScale as any,
        zoomTranslateX: mockZoomTranslateX as any,
        zoomTranslateY: mockZoomTranslateY as any,
        isZoomed: mockIsZoomed as any,
        isTransitioning: mockIsTransitioning as any,
        recentlyStoppedDecay: mockRecentlyStoppedDecay as any,
      })
    );

    expect(mockDoubleTapGesture.numberOfTaps).toHaveBeenCalledWith(2);
    expect(mockDoubleTapGesture.maxDelay).toHaveBeenCalledWith(200);
    expect(mockDoubleTapGesture.maxDuration).toHaveBeenCalledWith(250);
    expect(mockDoubleTapGesture.maxDistance).toHaveBeenCalledWith(20);
    expect(capturedDoubleTapCallbacks.onEnd).toBeDefined();
  });

  it('ignores double tap if event.x or event.y is NaN', () => {
    renderHook(() =>
      useDoubleTapGesture({
        width: 400,
        height: 800,
        zoomScale: mockZoomScale as any,
        zoomTranslateX: mockZoomTranslateX as any,
        zoomTranslateY: mockZoomTranslateY as any,
        isZoomed: mockIsZoomed as any,
        isTransitioning: mockIsTransitioning as any,
        recentlyStoppedDecay: mockRecentlyStoppedDecay as any,
      })
    );

    mockIsZoomed.value = false;
    mockZoomScale.value = 1;

    // Trigger double tap with x/y: NaN
    capturedDoubleTapCallbacks.onEnd({ x: NaN, y: NaN });

    // Should remain zoomed out (scale = 1, isZoomed = false)
    expect(mockZoomScale.value).toBe(1);
    expect(mockIsZoomed.value).toBe(false);
  });
});
