import { useCameraStore } from './useCameraStore';

describe('useCameraStore', () => {
  it('should have initial state', () => {
    const state = useCameraStore.getState();
    expect(state.cameraPosition).toBe('back');
    expect(state.flashMode).toBe('off');
  });

  it('should toggle camera position', () => {
    const { toggleCameraPosition } = useCameraStore.getState();
    
    toggleCameraPosition();
    expect(useCameraStore.getState().cameraPosition).toBe('front');
    
    toggleCameraPosition();
    expect(useCameraStore.getState().cameraPosition).toBe('back');
  });

  it('should set flash mode', () => {
    const { setFlashMode } = useCameraStore.getState();
    
    setFlashMode('on');
    expect(useCameraStore.getState().flashMode).toBe('on');
    
    setFlashMode('auto');
    expect(useCameraStore.getState().flashMode).toBe('auto');
  });
});
