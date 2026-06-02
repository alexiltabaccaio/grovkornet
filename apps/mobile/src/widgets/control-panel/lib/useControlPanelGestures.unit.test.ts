import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import * as reanimated from 'react-native-reanimated';
import { useControlPanelGestures } from './useControlPanelGestures';
import { useSystemStore } from '@entities/system';
import { Gesture } from 'react-native-gesture-handler';

describe('useControlPanelGestures', () => {
  let capturedPanGesture: any;
  let originalPan: any;
  let originalTiming: any;
  let originalSpring: any;
  let originalUseSharedValue: any;

  beforeAll(() => {
    originalTiming = reanimated.withTiming;
    originalSpring = reanimated.withSpring;
    originalUseSharedValue = reanimated.useSharedValue;

    (reanimated as any).withTiming = (value: any, config: any, callback: any) => {
      if (typeof callback === 'function') {
        callback(true);
      }
      return value;
    };

    (reanimated as any).withSpring = (value: any, config: any, callback: any) => {
      if (typeof callback === 'function') {
        callback(true);
      }
      return value;
    };

    // Use a custom hook compliant naming for eslint rules-of-hooks
    const useMockSharedValue = (initialVal: any) => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      return React.useMemo(() => ({ value: initialVal }), []);
    };

    (reanimated as any).useSharedValue = useMockSharedValue;
  });

  afterAll(() => {
    (reanimated as any).withTiming = originalTiming;
    (reanimated as any).withSpring = originalSpring;
    (reanimated as any).useSharedValue = originalUseSharedValue;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    capturedPanGesture = null;

    originalPan = Gesture.Pan;
    Gesture.Pan = (...args: any[]) => {
      const gesture = originalPan(...args);
      capturedPanGesture = gesture;
      return gesture;
    };

    // Reset store state
    useSystemStore.setState({
      activeSection: 'none',
      activeModule: 'none',
      activeParameter: 'none',
    });
  });

  afterEach(() => {
    Gesture.Pan = originalPan;
  });

  it('should initialize and react to activeSection changes', () => {
    const { result, rerender } = renderHook(() => useControlPanelGestures());

    expect(result.current.activeSection).toBe('none');
    expect(result.current.translateY.value).toBe(0);
    expect(result.current.drawerAnimation.value).toBe(250);

    // Open drawer
    act(() => {
      useSystemStore.setState({ activeSection: 'film' });
    });
    rerender({});

    expect(result.current.activeSection).toBe('film');
    expect(result.current.translateY.value).toBe(-50);
    expect(result.current.drawerAnimation.value).toBe(0);

    // Close drawer
    act(() => {
      useSystemStore.setState({ activeSection: 'none' });
    });
    rerender({});

    expect(result.current.activeSection).toBe('none');
    expect(result.current.translateY.value).toBe(0);
    expect(result.current.drawerAnimation.value).toBe(250);
  });

  it('handles Pan gesture start, update and end correctly', () => {
    const { result } = renderHook(() => useControlPanelGestures());

    expect(capturedPanGesture).toBeDefined();

    act(() => {
      result.current.translateY.value = -50;
    });

    act(() => {
      capturedPanGesture._onStart();
    });

    act(() => {
      // Pan up: translationY = -50
      capturedPanGesture._onUpdate({ translationY: -50 });
    });
    expect(result.current.translateY.value).toBe(-100);

    act(() => {
      // Clamp to MAX_UP (-250): translationY = -300
      capturedPanGesture._onUpdate({ translationY: -300 });
    });
    expect(result.current.translateY.value).toBe(-250);

    act(() => {
      // Clamp to -50: translationY = 100
      capturedPanGesture._onUpdate({ translationY: 100 });
    });
    expect(result.current.translateY.value).toBe(-50);

    // Snapping points: -50, -115, -150, -250
    act(() => {
      result.current.translateY.value = -70;
      capturedPanGesture._onEnd({ velocityY: 0 });
    });
    expect(result.current.translateY.value).toBe(-50);

    act(() => {
      result.current.translateY.value = -100;
      capturedPanGesture._onEnd({ velocityY: 0 });
    });
    expect(result.current.translateY.value).toBe(-115);

    act(() => {
      result.current.translateY.value = -140;
      capturedPanGesture._onEnd({ velocityY: 0 });
    });
    expect(result.current.translateY.value).toBe(-150);

    act(() => {
      result.current.translateY.value = -220;
      capturedPanGesture._onEnd({ velocityY: 0 });
    });
    expect(result.current.translateY.value).toBe(-250);

    // Snapping points with velocity estimation (estimatedY = translateY.value + e.velocityY * 0.1)
    act(() => {
      result.current.translateY.value = -50;
      // velocityY = -600 -> estimatedY = -50 + -60 = -110 -> snaps to -115
      capturedPanGesture._onEnd({ velocityY: -600 });
    });
    expect(result.current.translateY.value).toBe(-115);

    act(() => {
      result.current.translateY.value = -50;
      // velocityY = -950 -> estimatedY = -50 + -95 = -145 -> snaps to -150
      capturedPanGesture._onEnd({ velocityY: -950 });
    });
    expect(result.current.translateY.value).toBe(-150);
  });
});
