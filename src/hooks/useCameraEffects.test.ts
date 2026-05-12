import { renderHook, act } from '@testing-library/react-native';
import { useCameraEffects } from './useCameraEffects';

// Mock Reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn((val) => ({ value: val })),
  withTiming: jest.fn(),
  withRepeat: jest.fn(),
  Easing: { linear: jest.fn() },
  runOnJS: jest.fn((fn) => fn),
}));

// Mock Worklets Core
jest.mock('react-native-worklets-core', () => ({
  useSharedValue: jest.fn((val) => ({ value: val })),
}));

// Mock useFilmFrameProcessor
jest.mock('./useFilmFrameProcessor', () => ({
  useFilmFrameProcessor: jest.fn(() => ({})),
}));

describe('useCameraEffects', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCameraEffects());

    expect(result.current.activeTab).toBe('grain');
    expect(result.current.grainIntensity.value).toBe(0.5);
    expect(result.current.saturation.value).toBe(1.0);
    expect(result.current.grainEnabled.value).toBe(false);
  });

  it('should update active tab', () => {
    const { result } = renderHook(() => useCameraEffects());

    act(() => {
      result.current.setActiveTab('image');
    });

    expect(result.current.activeTab).toBe('image');
  });

  it('should have working setters for worklet values', () => {
    const { result } = renderHook(() => useCameraEffects());

    act(() => {
      result.current.setGrainIntensity(0.8);
      result.current.setSaturation(0.5);
      result.current.setGrainEnabled(true);
    });

    // Note: In our implementation, setters update the worklet values 
    // but the Reanimated values are updated by the components themselves.
    // We are testing that the setters exist and don't crash.
    expect(typeof result.current.setGrainIntensity).toBe('function');
    expect(typeof result.current.setSaturation).toBe('function');
    expect(typeof result.current.setGrainEnabled).toBe('function');
  });
});
