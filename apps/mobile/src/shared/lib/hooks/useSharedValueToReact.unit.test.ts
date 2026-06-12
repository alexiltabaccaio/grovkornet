import { renderHook, act } from '@testing-library/react-native';
import { useSharedValueToReact } from './useSharedValueToReact';
import { useAnimatedReaction } from 'react-native-reanimated';

describe('useSharedValueToReact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial value of shared value', () => {
    const sharedValue = { value: 'initial' };
    const { result } = renderHook(() => useSharedValueToReact(sharedValue as any));
    
    expect(result.current).toBe('initial');
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

    // Simulate same value change
    act(() => {
      reactionCallback!('initial', 'initial');
    });

    expect(result.current).toBe('initial');
  });
});
