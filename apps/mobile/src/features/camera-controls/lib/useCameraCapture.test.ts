import { renderHook } from '@testing-library/react-native';
import { useCameraCapture } from './useCameraCapture';
import { useUIStore } from '../model/useUIStore';
import { useStylesStore } from '../model/useStylesStore';

describe('useCameraCapture', () => {
  it('triggers takePhoto and updates noiseReductionMode when isCapturing becomes true', () => {
    const uiStore = useUIStore.getState();
    const styleStore = useStylesStore.getState();

    styleStore.noiseReductionAuto.value = true;
    styleStore.noiseReductionMode.value = 1;
    uiStore.isCapturing = false;

    const { result, rerender } = renderHook(() => useCameraCapture());

    const mockTakePhoto = jest.fn();
    // @ts-expect-error - assigning to readonly current for testing
    result.current.current = { takePhoto: mockTakePhoto };

    // Trigger capture
    uiStore.isCapturing = true;
    rerender({});

    expect(mockTakePhoto).toHaveBeenCalled();
    expect(styleStore.noiseReductionMode.value).toBe(2);
  });
});
