 
import { renderHook, act } from '@testing-library/react-native';
import { Accelerometer } from 'expo-sensors';
import { useDeviceRotation } from './useDeviceRotation';

describe('useDeviceRotation', () => {
  let accelerometerCallback: ((data: { x: number; y: number; z: number }) => void) | null = null;
  const mockRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    accelerometerCallback = null;
    (Accelerometer.addListener as jest.Mock).mockImplementation((callback) => {
      accelerometerCallback = callback;
      return { remove: mockRemove };
    });
  });

  it('should initialize rotationY to 0', () => {
    const { result } = renderHook(() => useDeviceRotation());
    expect(result.current.value).toBe(0);
  });

  it('should register and clean up accelerometer listener', () => {
    const { unmount } = renderHook(() => useDeviceRotation());
    expect(Accelerometer.addListener).toHaveBeenCalledTimes(1);
    
    unmount();
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });

  it('should update rotationY to -90 when device is in Landscape Right (x < -0.5)', () => {
    const { result } = renderHook(() => useDeviceRotation());
    
    expect(accelerometerCallback).not.toBeNull();
    act(() => {
      accelerometerCallback!({ x: -0.8, y: 0.1, z: 0 });
    });

    expect(result.current.value).toBe(-90);
  });

  it('should update rotationY to 90 when device is in Landscape Left (x > 0.5)', () => {
    const { result } = renderHook(() => useDeviceRotation());
    
    expect(accelerometerCallback).not.toBeNull();
    act(() => {
      accelerometerCallback!({ x: 0.8, y: -0.1, z: 0 });
    });

    expect(result.current.value).toBe(90);
  });

  it('should update rotationY to 0 when device is Portrait Upside Down (y > 0.5)', () => {
    const { result } = renderHook(() => useDeviceRotation());
    
    expect(accelerometerCallback).not.toBeNull();
    act(() => {
      accelerometerCallback!({ x: 0, y: 0.8, z: 0 });
    });

    expect(result.current.value).toBe(0);
  });

  it('should update rotationY to 180 when device is Portrait Standard (y < -0.5)', () => {
    const { result } = renderHook(() => useDeviceRotation());
    
    // First rotate to Landscape Right (-90)
    act(() => {
      accelerometerCallback!({ x: -0.8, y: 0.1, z: 0 });
    });
    expect(result.current.value).toBe(-90);

    // Now rotate back to Standard Portrait (180)
    act(() => {
      accelerometerCallback!({ x: 0.1, y: -0.8, z: 0 });
    });
    expect(Math.abs(result.current.value)).toBe(180);
  });

  it('ignores NaN accelerometer readings and recovers if current value is NaN', () => {
    const { result } = renderHook(() => useDeviceRotation());
    
    expect(accelerometerCallback).not.toBeNull();
    
    // Rotate to Landscape Left (90)
    act(() => {
      accelerometerCallback!({ x: 0.8, y: -0.1, z: 0 });
    });
    expect(result.current.value).toBe(90);

    // Send NaN reading -> should be ignored
    act(() => {
      accelerometerCallback!({ x: NaN, y: -0.1, z: 0 });
    });
    expect(result.current.value).toBe(90);

    // Force rotationY to NaN to simulate severe corruption
    act(() => {
      result.current.value = NaN;
    });

    // Send valid reading -> should fall back to 0 and calculate diff safely without crash
    act(() => {
      accelerometerCallback!({ x: -0.8, y: 0.1, z: 0 }); // Target: -90
    });
    // targetAngle = -90, currentAngle fallback = 0, angleDiff = -90 -> rotationY = -90
    expect(result.current.value).toBe(-90);
  });
});
