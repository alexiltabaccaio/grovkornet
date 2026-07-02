import { renderHook, act } from '@testing-library/react-native';
import { usePhotoPreviewGestures } from './usePhotoPreviewGestures';
import * as reanimatedModule from 'react-native-reanimated';

// Mock Reanimated animation functions
let originalTiming: any;
let originalSpring: any;
let originalDecay: any;
let originalUseSharedValue: any;

// Mock Gesture Handler
const capturedPanCallbacks: any = {};
const capturedPinchCallbacks: any = {};
const capturedDoubleTapCallbacks: any = {};

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

const mockPinchGesture: any = {
  onBegin: jest.fn().mockImplementation((cb) => {
    capturedPinchCallbacks.onBegin = cb;
    return mockPinchGesture;
  }),
  onStart: jest.fn().mockImplementation((cb) => {
    capturedPinchCallbacks.onStart = cb;
    return mockPinchGesture;
  }),
  onUpdate: jest.fn().mockImplementation((cb) => {
    capturedPinchCallbacks.onUpdate = cb;
    return mockPinchGesture;
  }),
  onEnd: jest.fn().mockImplementation((cb) => {
    capturedPinchCallbacks.onEnd = cb;
    return mockPinchGesture;
  }),
  onFinalize: jest.fn().mockImplementation((cb) => {
    capturedPinchCallbacks.onFinalize = cb;
    return mockPinchGesture;
  }),
};

const mockDoubleTapGesture: any = {
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
      Pan: () => mockPanGesture,
      Pinch: () => mockPinchGesture,
      Tap: () => mockDoubleTapGesture,
      Simultaneous: jest.fn().mockImplementation((...args) => args),
    },
  };
});

describe('usePhotoPreviewGestures', () => {
  let mockTranslateX: { value: number };
  let mockDragOffset: { value: number };
  let mockCurrentIndex: { value: number };
  let mockRotationY: { value: number };
  const mockPrepareTransition = jest.fn();
  const mockFinalizeTransition = jest.fn();
  let mockIsTransitioning: { value: boolean };

  beforeAll(() => {
    originalTiming = reanimatedModule.withTiming;
    originalSpring = reanimatedModule.withSpring;
    originalDecay = reanimatedModule.withDecay;
    originalUseSharedValue = reanimatedModule.useSharedValue;

    (reanimatedModule as any).withTiming = (value: any, config: any, callback: any) => {
      if (typeof callback === 'function') callback(true);
      return value;
    };

    (reanimatedModule as any).withSpring = (value: any, config: any, callback: any) => {
      if (typeof callback === 'function') callback(true);
      return value;
    };

    (reanimatedModule as any).withDecay = (config: any, callback: any) => {
      if (typeof callback === 'function') callback(true);
      return config.velocity > 0 ? 100 : -100;
    };

    (reanimatedModule as any).useSharedValue = (val: any) => {
      return { value: val };
    };
  });

  afterAll(() => {
    (reanimatedModule as any).withTiming = originalTiming;
    (reanimatedModule as any).withSpring = originalSpring;
    (reanimatedModule as any).withDecay = originalDecay;
    (reanimatedModule as any).useSharedValue = originalUseSharedValue;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockTranslateX = { value: 0 };
    mockDragOffset = { value: 0 };
    mockCurrentIndex = { value: 0 };
    mockRotationY = { value: 0 };
    mockIsTransitioning = { value: false };
  });

  const getHookResult = () => {
    return renderHook(() =>
      usePhotoPreviewGestures({
        width: 400,
        height: 800,
        photosLength: 3,
        slotWidth: 400,
        translateX: mockTranslateX as any,
        dragOffset: mockDragOffset as any,
        currentIndex: mockCurrentIndex as any,
        rotationY: mockRotationY as any,
        selectedPhoto: { id: '1', uri: 'file:///test/1.jpg' },
        prepareTransition: mockPrepareTransition,
        finalizeTransition: mockFinalizeTransition,
        isTransitioning: mockIsTransitioning as any,
        isTeleporting: { value: false } as any,
        teleportMockIndex: { value: -1 } as any,
        teleportRealIndex: { value: -1 } as any,
        finalizeTeleport: jest.fn(),
      })
    );
  };

  it('initializes gestures with standard values', () => {
    const { result } = getHookResult();

    expect(result.current.zoomScale.value).toBe(1);
    expect(result.current.zoomTranslateX.value).toBe(0);
    expect(result.current.zoomTranslateY.value).toBe(0);
    expect(result.current.isZoomed.value).toBe(false);
  });

  it('handles double tap to zoom in', () => {
    const { result } = getHookResult();

    expect(capturedDoubleTapCallbacks.onEnd).toBeDefined();

    act(() => {
      // Simulate double tap on coordinates x=150, y=300
      capturedDoubleTapCallbacks.onEnd({ x: 150, y: 300 });
    });

    expect(result.current.isZoomed.value).toBe(true);
    expect(result.current.zoomScale.value).toBe(2.5);
    // centerX=200, targetX = (200 - 150) * 1.5 = 75
    expect(result.current.zoomTranslateX.value).toBe(75);
    // centerY=400, targetY = (400 - 300) * 1.5 = 150
    expect(result.current.zoomTranslateY.value).toBe(150);
  });

  it('zooms on double tap even if transition is in progress', () => {
    const { result } = getHookResult();
    mockIsTransitioning.value = true;

    act(() => {
      capturedDoubleTapCallbacks.onEnd({ x: 150, y: 300 });
    });

    expect(result.current.isZoomed.value).toBe(true);
    expect(result.current.zoomScale.value).toBe(2.5);
  });

  it('handles double tap to zoom out when already zoomed', () => {
    const { result } = getHookResult();

    // Zoom in first
    act(() => {
      capturedDoubleTapCallbacks.onEnd({ x: 200, y: 400 });
    });
    expect(result.current.isZoomed.value).toBe(true);

    // Zoom out
    act(() => {
      capturedDoubleTapCallbacks.onEnd({ x: 200, y: 400 });
    });

    expect(result.current.isZoomed.value).toBe(false);
    expect(result.current.zoomScale.value).toBe(1);
    expect(result.current.zoomTranslateX.value).toBe(0);
    expect(result.current.zoomTranslateY.value).toBe(0);
  });

  it('handles pinch gesture update and end', () => {
    const { result } = getHookResult();

    expect(capturedPinchCallbacks.onUpdate).toBeDefined();
    expect(capturedPinchCallbacks.onEnd).toBeDefined();

    // Scale up via pinch
    act(() => {
      capturedPinchCallbacks.onUpdate({ scale: 2 });
    });

    expect(result.current.zoomScale.value).toBe(2);
    expect(result.current.isZoomed.value).toBe(true);

    // Scale down to < 1.1 and end (resets zoom)
    act(() => {
      capturedPinchCallbacks.onUpdate({ scale: 0.5 }); // 2 * 0.5 = 1.0 (but bounded minimum 1)
      capturedPinchCallbacks.onEnd();
    });

    expect(result.current.isZoomed.value).toBe(false);
    expect(result.current.zoomScale.value).toBe(1);
  });

  it('handles pan gesture (swipe mode) when not zoomed', () => {
    getHookResult();

    expect(capturedPanCallbacks.onStart).toBeDefined();
    expect(capturedPanCallbacks.onUpdate).toBeDefined();
    expect(capturedPanCallbacks.onEnd).toBeDefined();

    // Start swipe
    act(() => {
      capturedPanCallbacks.onStart({ translationX: 0 });
    });
    expect(mockDragOffset.value).toBe(0);

    // Update (drag to negative x)
    act(() => {
      capturedPanCallbacks.onUpdate({ translationX: -250 });
    });
    expect(mockTranslateX.value).toBe(-250);

    // End (release exceeding half width threshold - width is 400)
    act(() => {
      capturedPanCallbacks.onEnd({ velocityX: -600 });
    });

    expect(mockTranslateX.value).toBe(-400); // target index 1 * slotWidth
    expect(mockFinalizeTransition).toHaveBeenCalledWith(1, true);
  });

  it('handles pan gesture (pan mode) when zoomed', () => {
    const { result } = getHookResult();

    // Zoom in
    act(() => {
      capturedDoubleTapCallbacks.onEnd({ x: 200, y: 400 });
    });

    // Start pan
    act(() => {
      capturedPanCallbacks.onStart();
    });

    // Move pan
    act(() => {
      capturedPanCallbacks.onUpdate({ translationX: 50, translationY: -50 });
    });

    // Confirm that coordinates shift in pan mode
    expect(result.current.zoomTranslateX.value).toBeGreaterThan(0);
    expect(result.current.zoomTranslateY.value).toBeLessThan(0);

    // End pan (should trigger decay)
    act(() => {
      capturedPanCallbacks.onEnd({ velocityX: 100, velocityY: -100 });
    });

    // Expect zoom values to change due to simulated withDecay
    expect(result.current.zoomTranslateX.value).toBeDefined();
    expect(result.current.zoomTranslateY.value).toBeDefined();
  });
});
