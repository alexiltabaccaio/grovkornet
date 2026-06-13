import { renderHook } from '@testing-library/react-native';
import { useCameraCapture } from './useCameraCapture';
import { useCameraStore } from '@entities/camera';

describe('useCameraCapture', () => {
  it('triggers takePhoto when isCapturing becomes true', () => {
    const cameraStore = useCameraStore.getState();

    cameraStore.isCapturing = false;

    const { result, rerender } = renderHook(() => useCameraCapture());

    const mockTakePhoto = jest.fn();
    result.current.current = { takePhoto: mockTakePhoto };

    // Trigger capture
    cameraStore.isCapturing = true;
    rerender({});

    expect(mockTakePhoto).toHaveBeenCalled();
  });
});
