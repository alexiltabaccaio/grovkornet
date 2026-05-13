import { renderHook, act } from '@testing-library/react-native';
import { useDoublePress } from './useDoublePress';

describe('useDoublePress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call onSingle on the first press', () => {
    const onReset = jest.fn();
    const onSingle = jest.fn();
    const { result } = renderHook(() => useDoublePress(onReset));

    act(() => {
      result.current.handlePressWithDouble('tool', onSingle);
    });

    expect(onSingle).toHaveBeenCalledTimes(1);
    expect(onReset).not.toHaveBeenCalled();
  });

  it('should call onReset if pressed twice within 300ms', () => {
    const onReset = jest.fn();
    const onSingle = jest.fn();
    const { result } = renderHook(() => useDoublePress(onReset));

    act(() => {
      result.current.handlePressWithDouble('tool', onSingle);
    });
    
    // Advance time by 100ms
    act(() => {
      jest.advanceTimersByTime(100);
      result.current.handlePressWithDouble('tool', onSingle);
    });

    expect(onSingle).toHaveBeenCalledTimes(1); // Only the first press counts as a single press
    expect(onReset).toHaveBeenCalledWith('tool');
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('should call onSingle again if interval exceeds 300ms', () => {
    const onReset = jest.fn();
    const onSingle = jest.fn();
    const { result } = renderHook(() => useDoublePress(onReset));

    act(() => {
      result.current.handlePressWithDouble('tool', onSingle);
    });
    
    // Advance time by 400ms
    act(() => {
      jest.advanceTimersByTime(400);
      result.current.handlePressWithDouble('tool', onSingle);
    });

    expect(onSingle).toHaveBeenCalledTimes(2);
    expect(onReset).not.toHaveBeenCalled();
  });

  it('should reset the timer after a double press', () => {
    const onReset = jest.fn();
    const onSingle = jest.fn();
    const { result } = renderHook(() => useDoublePress(onReset));

    // First press
    act(() => {
      result.current.handlePressWithDouble('tool', onSingle);
    });

    // Second press (double press)
    act(() => {
      jest.advanceTimersByTime(100);
      result.current.handlePressWithDouble('tool', onSingle);
    });

    // Third press (should be treated as a NEW single press because timer was reset to 0)
    act(() => {
      jest.advanceTimersByTime(100);
      result.current.handlePressWithDouble('tool', onSingle);
    });

    expect(onSingle).toHaveBeenCalledTimes(2);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
