import { useCameraStore } from './useCameraStore';

describe('useCameraStore', () => {
  beforeEach(() => {
    useCameraStore.setState({
      isCapturing: false,
      isCameraSecure: true,
      isTorchOn: false,
      thermalState: 'normal',
      isLowRam: false,
    });
  });

  it('initializes with default values', () => {
    const state = useCameraStore.getState();
    expect(state.isCapturing).toBe(false);
    expect(state.isCameraSecure).toBe(true);
    expect(state.isTorchOn).toBe(false);
    expect(state.thermalState).toBe('normal');
    expect(state.isLowRam).toBe(false);
  });

  it('updates isCameraSecure correctly', () => {
    const { setIsCameraSecure } = useCameraStore.getState();
    setIsCameraSecure(false);
    expect(useCameraStore.getState().isCameraSecure).toBe(false);
  });

  it('updates isTorchOn correctly', () => {
    const { setIsTorchOn } = useCameraStore.getState();
    setIsTorchOn(true);
    expect(useCameraStore.getState().isTorchOn).toBe(true);
  });

  it('updates thermalState correctly', () => {
    const { setThermalState } = useCameraStore.getState();
    setThermalState('warning');
    expect(useCameraStore.getState().thermalState).toBe('warning');
  });

  it('updates isLowRam correctly', () => {
    const { setIsLowRam } = useCameraStore.getState();
    setIsLowRam(true);
    expect(useCameraStore.getState().isLowRam).toBe(true);
  });

  it('triggers capture and resets after timeout', () => {
    jest.useFakeTimers();
    const { triggerCapture } = useCameraStore.getState();
    
    triggerCapture();
    expect(useCameraStore.getState().isCapturing).toBe(true);

    jest.advanceTimersByTime(400);
    expect(useCameraStore.getState().isCapturing).toBe(false);
    jest.useRealTimers();
  });
});
