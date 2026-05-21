import { renderHook } from '@testing-library/react-native';
import { useCameraCapture } from './useCameraCapture';
import { useSystemStore } from '@entities/system';
import { useFilmStore } from '@entities/film';

describe('useCameraCapture', () => {
  it('triggers takePhoto and updates noiseReductionMode when isCapturing becomes true', () => {
    const systemStore = useSystemStore.getState();
    const filmStore = useFilmStore.getState();

    filmStore.noiseReductionAuto.value = true;
    filmStore.noiseReductionMode.value = 1;
    systemStore.isCapturing = false;

    const { result, rerender } = renderHook(() => useCameraCapture());

    const mockTakePhoto = jest.fn();
    // @ts-expect-error - assigning to readonly current for testing
    result.current.current = { takePhoto: mockTakePhoto };

    // Trigger capture
    systemStore.isCapturing = true;
    rerender({});

    expect(mockTakePhoto).toHaveBeenCalled();
    expect(filmStore.noiseReductionMode.value).toBe(2);
  });
});
