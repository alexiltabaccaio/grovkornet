import { renderHook } from '@testing-library/react-native';
import { usePinchGesture } from './usePinchGesture';
import * as reanimatedModule from 'react-native-reanimated';

const capturedPinchCallbacks: any = {};
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

jest.mock('react-native-gesture-handler', () => {
  const original = jest.requireActual('react-native-gesture-handler');
  return {
    ...original,
    Gesture: {
      Pinch: () => mockPinchGesture,
    },
  };
});

describe('usePinchGesture', () => {
  let mockZoomScale: { value: number };
  let mockZoomTranslateX: { value: number };
  let mockZoomTranslateY: { value: number };
  let mockIsZoomed: { value: boolean };
  let mockIsDecaying: { value: number };

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
    mockIsDecaying = { value: 0 };
  });

  it('configures pinch gesture correctly', () => {
    renderHook(() =>
      usePinchGesture({
        width: 400,
        height: 800,
        zoomScale: mockZoomScale as any,
        zoomTranslateX: mockZoomTranslateX as any,
        zoomTranslateY: mockZoomTranslateY as any,
        savedZoomScale: { value: 1 } as any,
        savedZoomTranslateX: { value: 0 } as any,
        savedZoomTranslateY: { value: 0 } as any,
        isZoomed: mockIsZoomed as any,
        isDecaying: mockIsDecaying as any,
      })
    );

    expect(capturedPinchCallbacks.onBegin).toBeDefined();
    expect(capturedPinchCallbacks.onStart).toBeDefined();
    expect(capturedPinchCallbacks.onUpdate).toBeDefined();
    expect(capturedPinchCallbacks.onEnd).toBeDefined();
  });

  it('ignores onUpdate if scale is NaN', () => {
    const savedZoomScale = { value: 1.5 };

    renderHook(() =>
      usePinchGesture({
        width: 400,
        height: 800,
        zoomScale: mockZoomScale as any,
        zoomTranslateX: mockZoomTranslateX as any,
        zoomTranslateY: mockZoomTranslateY as any,
        savedZoomScale: savedZoomScale as any,
        savedZoomTranslateX: { value: 0 } as any,
        savedZoomTranslateY: { value: 0 } as any,
        isZoomed: mockIsZoomed as any,
        isDecaying: mockIsDecaying as any,
      })
    );

    // Initial value
    mockZoomScale.value = 1.5;

    // Simulate update with scale: NaN
    capturedPinchCallbacks.onUpdate({ scale: NaN });

    // Should remain 1.5
    expect(mockZoomScale.value).toBe(1.5);
  });
});
