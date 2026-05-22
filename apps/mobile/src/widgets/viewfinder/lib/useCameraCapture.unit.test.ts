import { renderHook } from '@testing-library/react-native';
import { useCameraCapture } from './useCameraCapture';
import { useSystemStore } from '@entities/system';

describe('useCameraCapture', () => {
  it('triggers takePhoto when isCapturing becomes true', () => {
    const systemStore = useSystemStore.getState();

    systemStore.isCapturing = false;

    const { result, rerender } = renderHook(() => useCameraCapture());

    const mockTakePhoto = jest.fn();
    // @ts-expect-error - assigning to readonly current for testing
    result.current.current = { takePhoto: mockTakePhoto };

    // Trigger capture
    systemStore.isCapturing = true;
    rerender({});

    expect(mockTakePhoto).toHaveBeenCalled();
  });
});
