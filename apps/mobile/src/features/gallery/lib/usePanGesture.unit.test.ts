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
    (reanimatedModule as any).withSpring = (value: any, config: any, callback: any) => {
      if (typeof callback === 'function') callback(true);
      return value;
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

  const getBaseProps = () => ({
    dimensions: {
      width: 400,
      height: 800,
      photosLength: 3,
      slotWidth: 400,
    },
    zoomState: {
      zoomScale: mockZoomScale as any,
      zoomTranslateX: mockZoomTranslateX as any,
      zoomTranslateY: mockZoomTranslateY as any,
      savedZoomTranslateX: { value: 0 } as any,
      savedZoomTranslateY: { value: 0 } as any,
      isZoomed: mockIsZoomed as any,
    },
    swipeState: {
      translateX: mockTranslateX as any,
      dragOffset: mockDragOffset as any,
      panStartTranslationX: mockPanStartTranslationX as any,
      panMode: mockPanMode as any,
      isTransitioning: mockIsTransitioning as any,
    },
    teleportState: {
      isTeleporting: { value: false } as any,
      teleportMockIndex: { value: -1 } as any,
      teleportRealIndex: { value: -1 } as any,
    },
    decayState: {
      isDecaying: mockIsDecaying as any,
      recentlyStoppedDecay: mockRecentlyStoppedDecay as any,
    },
    callbacks: {
      prepareTransition: mockPrepareTransition,
      finalizeTransition: mockFinalizeTransition,
      finalizeTeleport: jest.fn(),
    },
  });

  it('configures pan gesture correctly', () => {
    renderHook(() => usePanGesture(getBaseProps()));

    expect(mockPanGesture.maxPointers).toHaveBeenCalledWith(1);
    expect(capturedPanCallbacks.onBegin).toBeDefined();
    expect(capturedPanCallbacks.onStart).toBeDefined();
    expect(capturedPanCallbacks.onUpdate).toBeDefined();
    expect(capturedPanCallbacks.onEnd).toBeDefined();
  });

  it('ignores onUpdate if translationX or translationY is NaN', () => {
    const props = getBaseProps();
    props.zoomState.zoomScale.value = 2.5; // zoomed in -> pan mode
    props.zoomState.isZoomed.value = true;
    props.swipeState.panMode.value = 'pan';
    
    props.zoomState.savedZoomTranslateX = { value: -50 } as any;
    props.zoomState.savedZoomTranslateY = { value: -50 } as any;

    renderHook(() => usePanGesture(props));

    props.zoomState.zoomTranslateX.value = -50;
    props.zoomState.zoomTranslateY.value = -50;

    // Trigger update with NaN values
    capturedPanCallbacks.onUpdate({ translationX: NaN, translationY: NaN });

    // Should remain unchanged
    expect(props.zoomState.zoomTranslateX.value).toBe(-50);
    expect(props.zoomState.zoomTranslateY.value).toBe(-50);
  });

  it('handles swipe correctly and triggers transitions', () => {
    const props = getBaseProps();
    renderHook(() => usePanGesture(props));

    // Simulate start
    capturedPanCallbacks.onStart({ translationX: 0 });
    expect(props.swipeState.panMode.value).toBe('swipe');

    // Simulate swipe to left (next photo)
    capturedPanCallbacks.onUpdate({ translationX: -200, translationY: 0 });
    // width is 400, so dragThreshold is 133.33. -200 should trigger transition to next index (1).
    expect(props.swipeState.translateX.value).toBe(-200); // 0 + (-200)
    
    // Simulate end with sufficient velocity
    capturedPanCallbacks.onEnd({ velocityX: -400, velocityY: 0 });
    
    // Target index should be 1, so translateX should be -400
    expect(mockPrepareTransition).toHaveBeenCalledWith(1, true);
    expect(mockFinalizeTransition).toHaveBeenCalledWith(1, true);
    // Because we mock withSpring to immediately invoke callback and return target value
    expect(props.swipeState.translateX.value).toBe(-400); 
  });

  it('respects pan bounds when zoomed', () => {
    const props = getBaseProps();
    props.zoomState.zoomScale.value = 2; // Zoomed 2x
    props.zoomState.isZoomed.value = true;
    
    renderHook(() => usePanGesture(props));

    // Width = 400. ZoomScale = 2.
    // Bounds maxTx = (400 * 1) / 2 = 200. minTx = -200.
    // Height = 800. ZoomScale = 2.
    // Bounds maxTy = (800 * 1) / 2 = 400. minTy = -400.

    capturedPanCallbacks.onStart({ translationX: 0, translationY: 0 });
    expect(props.swipeState.panMode.value).toBe('pan');

    // Try to pan beyond maxTx (200)
    capturedPanCallbacks.onUpdate({ translationX: 300, translationY: 0 });
    expect(props.zoomState.zoomTranslateX.value).toBe(200); // Clamped

    // Try to pan beyond minTy (-400)
    capturedPanCallbacks.onUpdate({ translationX: 0, translationY: -500 });
    expect(props.zoomState.zoomTranslateY.value).toBe(-400); // Clamped
  });
});
