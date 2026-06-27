import { renderHook } from '@testing-library/react-native';
import { usePanGesture } from './usePanGesture';
import * as reanimatedModule from 'react-native-reanimated';

const capturedPanCallbacks: any = {};
const mockPanGesture: any = {
  maxPointers: jest.fn().mockReturnThis(),
  onBegin: jest.fn().mockImplementation((cb) => {
    capturedPanCallbacks.onBegin = cb;
    return mockPanGesture;
  }),
  onStart: jest.fn().mockImplementation((cb) => {
    capturedPanCallbacks.onStart = cb;
    return mockPanGesture;
  }),
  onUpdate: jest.fn().mockImplementation((cb) => {
    capturedPanCallbacks.onUpdate = cb;
    return mockPanGesture;
  }),
  onEnd: jest.fn().mockImplementation((cb) => {
    capturedPanCallbacks.onEnd = cb;
    return mockPanGesture;
  }),
};

jest.mock('react-native-gesture-handler', () => {
  const original = jest.requireActual('react-native-gesture-handler');
  return {
    ...original,
    Gesture: {
      Pan: () => mockPanGesture,
    },
  };
});

describe('usePanGesture', () => {
  let mockTranslateX: { value: number };
  let mockDragOffset: { value: number };
  let mockZoomScale: { value: number };
  let mockZoomTranslateX: { value: number };
  let mockZoomTranslateY: { value: number };
  let mockIsZoomed: { value: boolean };
  let mockPanStartTranslationX: { value: number };
  let mockPanMode: { value: string };
  let mockIsDecaying: { value: number };
  let mockRecentlyStoppedDecay: { value: number };
  const mockPrepareTransition = jest.fn();
  const mockFinalizeTransition = jest.fn();
  let mockIsTransitioning: { value: boolean };

  beforeAll(() => {
    (reanimatedModule as any).withTiming = (value: any, config: any, callback: any) => {
      if (typeof callback === 'function') callback(true);
      return value;
    };
    (reanimatedModule as any).withDecay = (config: any, callback: any) => {
      if (typeof callback === 'function') callback(true);
      return 100;
    };
    (reanimatedModule as any).useSharedValue = (val: any) => {
      return { value: val };
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockTranslateX = { value: 0 };
    mockDragOffset = { value: 0 };
    mockZoomScale = { value: 1 };
    mockZoomTranslateX = { value: 0 };
    mockZoomTranslateY = { value: 0 };
    mockIsZoomed = { value: false };
    mockPanStartTranslationX = { value: 0 };
    mockPanMode = { value: 'swipe' };
    mockIsDecaying = { value: 0 };
    mockRecentlyStoppedDecay = { value: 0 };
    mockIsTransitioning = { value: false };
  });

  it('configures pan gesture correctly', () => {
    renderHook(() =>
      usePanGesture({
        width: 400,
        height: 800,
        photosLength: 3,
        slotWidth: 400,
        translateX: mockTranslateX as any,
        dragOffset: mockDragOffset as any,
        zoomScale: mockZoomScale as any,
        zoomTranslateX: mockZoomTranslateX as any,
        zoomTranslateY: mockZoomTranslateY as any,
        savedZoomTranslateX: { value: 0 } as any,
        savedZoomTranslateY: { value: 0 } as any,
        isZoomed: mockIsZoomed as any,
        panStartTranslationX: mockPanStartTranslationX as any,
        panMode: mockPanMode as any,
        isDecaying: mockIsDecaying as any,
        recentlyStoppedDecay: mockRecentlyStoppedDecay as any,
        prepareTransition: mockPrepareTransition,
        finalizeTransition: mockFinalizeTransition,
        isTransitioning: mockIsTransitioning as any,
        isTeleporting: { value: false } as any,
        teleportMockIndex: { value: -1 } as any,
        teleportRealIndex: { value: -1 } as any,
        finalizeTeleport: jest.fn(),
      })
    );

    expect(mockPanGesture.maxPointers).toHaveBeenCalledWith(1);
    expect(capturedPanCallbacks.onBegin).toBeDefined();
    expect(capturedPanCallbacks.onStart).toBeDefined();
    expect(capturedPanCallbacks.onUpdate).toBeDefined();
    expect(capturedPanCallbacks.onEnd).toBeDefined();
  });

  it('ignores onUpdate if translationX or translationY is NaN', () => {
    mockZoomScale.value = 2.5; // zoomed in -> pan mode
    mockIsZoomed.value = true;
    mockPanMode.value = 'pan';

    const savedZoomTranslateX = { value: -50 };
    const savedZoomTranslateY = { value: -50 };

    renderHook(() =>
      usePanGesture({
        width: 400,
        height: 800,
        photosLength: 3,
        slotWidth: 400,
        translateX: mockTranslateX as any,
        dragOffset: mockDragOffset as any,
        zoomScale: mockZoomScale as any,
        zoomTranslateX: mockZoomTranslateX as any,
        zoomTranslateY: mockZoomTranslateY as any,
        savedZoomTranslateX: savedZoomTranslateX as any,
        savedZoomTranslateY: savedZoomTranslateY as any,
        isZoomed: mockIsZoomed as any,
        panStartTranslationX: mockPanStartTranslationX as any,
        panMode: mockPanMode as any,
        isDecaying: mockIsDecaying as any,
        recentlyStoppedDecay: mockRecentlyStoppedDecay as any,
        prepareTransition: mockPrepareTransition,
        finalizeTransition: mockFinalizeTransition,
        isTransitioning: mockIsTransitioning as any,
        isTeleporting: { value: false } as any,
        teleportMockIndex: { value: -1 } as any,
        teleportRealIndex: { value: -1 } as any,
        finalizeTeleport: jest.fn(),
      })
    );

    mockZoomTranslateX.value = -50;
    mockZoomTranslateY.value = -50;

    // Trigger update with NaN values
    capturedPanCallbacks.onUpdate({ translationX: NaN, translationY: NaN });

    // Should remain unchanged
    expect(mockZoomTranslateX.value).toBe(-50);
    expect(mockZoomTranslateY.value).toBe(-50);
  });
});
