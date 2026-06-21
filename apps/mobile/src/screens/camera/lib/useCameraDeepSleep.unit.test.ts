import { renderHook, act } from '@testing-library/react-native';
import { useCameraDeepSleep } from './useCameraDeepSleep';

describe('useCameraDeepSleep', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with deep sleep disabled', () => {
    const { result } = renderHook(() => useCameraDeepSleep(false));
    expect(result.current.isCameraDeepSleep).toBe(false);
  });

  it('starts a timer when isOpen becomes true and enters deep sleep after 60 seconds', () => {
    const { result, rerender } = renderHook(
      (props: { isOpen: boolean }) => useCameraDeepSleep(props.isOpen),
      {
        initialProps: { isOpen: false },
      }
    );

    expect(result.current.isCameraDeepSleep).toBe(false);

    // Set isOpen to true
    rerender({ isOpen: true });
    expect(result.current.isCameraDeepSleep).toBe(false);

    // Fast-forward time by 59 seconds
    act(() => {
      jest.advanceTimersByTime(59000);
    });
    expect(result.current.isCameraDeepSleep).toBe(false);

    // Fast-forward last second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.isCameraDeepSleep).toBe(true);
  });

  it('resets deep sleep state immediately if isOpen becomes false during deep sleep', () => {
    const { result, rerender } = renderHook(
      (props: { isOpen: boolean }) => useCameraDeepSleep(props.isOpen),
      {
        initialProps: { isOpen: true },
      }
    );

    // Enter deep sleep
    act(() => {
      jest.advanceTimersByTime(60000);
    });
    expect(result.current.isCameraDeepSleep).toBe(true);

    // Gallery closed
    rerender({ isOpen: false });
    expect(result.current.isCameraDeepSleep).toBe(false);
  });

  it('clears the timer and does not enter deep sleep if isOpen becomes false before 60 seconds', () => {
    const { result, rerender } = renderHook(
      (props: { isOpen: boolean }) => useCameraDeepSleep(props.isOpen),
      {
        initialProps: { isOpen: false },
      }
    );

    rerender({ isOpen: true });

    // Advance 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });
    expect(result.current.isCameraDeepSleep).toBe(false);

    // Close before timer finishes
    rerender({ isOpen: false });

    // Advance remaining 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });
    expect(result.current.isCameraDeepSleep).toBe(false);
  });
});
