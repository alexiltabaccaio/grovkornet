import { renderHook, act } from '@testing-library/react-native';
import { useSharedValueToReact } from './useSharedValueToReact';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';

describe('useSharedValueToReact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial value of shared value and register reaction with dependencies', () => {
    let prepareCallback: (() => any) | null = null;
    (useAnimatedReaction as jest.Mock).mockImplementation((prepare, _react) => {
      prepareCallback = prepare;
    });

    const sharedValue = { value: 'initial' };
    const { result } = renderHook(() => useSharedValueToReact(sharedValue as any));
    
    expect(result.current).toBe('initial');
    expect(useAnimatedReaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      [sharedValue]
    );

    // Call prepare callback to cover the preparation line
    expect(prepareCallback).not.toBeNull();
    expect(prepareCallback!()).toBe('initial');
  });

  it('should update state when shared value changes', () => {
    let reactionCallback: ((curr: any, prev: any) => void) | null = null;
    (useAnimatedReaction as jest.Mock).mockImplementation((prepare, react) => {
      reactionCallback = react;
    });

    const sharedValue = { value: 'initial' };
    const { result } = renderHook(() => useSharedValueToReact(sharedValue as any));

    expect(result.current).toBe('initial');
    expect(reactionCallback).not.toBeNull();

    // Simulate change
    act(() => {
      reactionCallback!('updated', 'initial');
    });

    expect(result.current).toBe('updated');
  });

  it('should not update state when value remains the same', () => {
    let reactionCallback: ((curr: any, prev: any) => void) | null = null;
    (useAnimatedReaction as jest.Mock).mockImplementation((prepare, react) => {
      reactionCallback = react;
    });

    const sharedValue = { value: 'initial' };
    const { result } = renderHook(() => useSharedValueToReact(sharedValue as any));

    expect(result.current).toBe('initial');
    expect(reactionCallback).not.toBeNull();

    // Clear call history of runOnJS mock
    (runOnJS as jest.Mock).mockClear();

    // Simulate same value change
    act(() => {
      reactionCallback!('initial', 'initial');
    });

    expect(result.current).toBe('initial');
    expect(runOnJS).not.toHaveBeenCalled();
  });
});
