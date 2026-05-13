import { renderHook, act } from '@testing-library/react-native';
import { useCameraStore } from './useCameraStore';

describe('useCameraStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useCameraStore.setState({ 
        cameraPosition: 'back', 
        flashMode: 'off' 
      });
    });
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useCameraStore());
    
    expect(result.current.cameraPosition).toBe('back');
    expect(result.current.flashMode).toBe('off');
  });

  it('should toggle camera position from back to front', () => {
    const { result } = renderHook(() => useCameraStore());
    
    act(() => {
      result.current.toggleCameraPosition();
    });
    expect(result.current.cameraPosition).toBe('front');
  });

  it('should toggle camera position from front to back', () => {
    const { result } = renderHook(() => useCameraStore());
    
    // First toggle to front
    act(() => {
      result.current.toggleCameraPosition();
    });
    
    // Then toggle back to back
    act(() => {
      result.current.toggleCameraPosition();
    });
    
    expect(result.current.cameraPosition).toBe('back');
  });

  it('should set flash mode correctly', () => {
    const { result } = renderHook(() => useCameraStore());
    
    act(() => {
      result.current.setFlashMode('on');
    });
    expect(result.current.flashMode).toBe('on');

    act(() => {
      result.current.setFlashMode('auto');
    });
    expect(result.current.flashMode).toBe('auto');

    act(() => {
      result.current.setFlashMode('off');
    });
    expect(result.current.flashMode).toBe('off');
  });
});
